import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import {
  loginUser,
  completeForcePasswordApi,
  verifyMfaApi,
  ApiUser,
  //LoginApiResponse,
  ForcePasswordChangeDetails,
  MfaRequiredDetails,
  LoginSuccessDetails,
  //ForceChangePasswordApiResponse,
  //VerifyMfaApiResponse
} from '../services/api';

const PERMANENT_TOKEN_KEY = 'user-permanent-token';

type User = ApiUser;

interface AuthContextType {
  login: (rut: string, password: string, captchaToken?: string) => Promise<void>; // Función para iniciar sesión
  logout: () => void; // Función para cerrar sesión
  completeForcePasswordChange: (newPassword: string, confirmPassword: string) => Promise<void>; // Función para completar el cambio de contraseña
  verifyMfa: (code: string) => Promise<void>; // Función para verificar MFA
  user: User | null; // Usuario autenticado
  token: string | null; // Token de sesión permanente
  isAuthenticated: boolean; // Indica si el usuario está autenticado
  isLoading: boolean; // Para carga inicial y operaciones async

  needsPasswordChange: boolean; // Indica si el usuario necesita cambiar la contraseña
  userEmailForPasswordChange: string | null; // Email del usuario que necesita cambiar contraseña
  tempToken: string | null; // Token temporal para forceChangePassword
  awaitsMfaVerification: boolean; // Indica si se está esperando la verificación de MFA
  mfaEmail: string | null; // Email para el cual se está verificando MFA
}

// Contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto de autenticación

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
// Proveedor de autenticación
// Este componente envuelve la aplicación y proporciona el contexto de autenticación
interface AuthProviderProps {
  children: ReactNode;
}

// Proveedor de autenticación
// Este componente envuelve la aplicación y proporciona el contexto de autenticación
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null); 
  const [token, setToken] = useState<string | null>(null); 
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [userEmailForPasswordChange, setUserEmailForPasswordChange] = useState<string | null>(null);
  const [tempTokenState, setTempTokenState] = useState<string | null>(null);

  const [awaitsMfaVerification, setAwaitsMfaVerification] = useState(false);
  const [mfaEmail, setMfaEmail] = useState<string | null>(null);

  // Cargar el token y el usuario al iniciar la aplicación
  // Este efecto se ejecuta una vez al cargar la aplicación
  // y verifica si hay un token almacenado en SecureStore
  // Si hay un token, lo establece en el estado y carga el usuario
  useEffect(() => {
    const loadTokenAndUser = async () => {
      setIsLoading(true);
      try {
        const storedPermanentToken = await SecureStore.getItemAsync(PERMANENT_TOKEN_KEY);
        if (storedPermanentToken) {
          setToken(storedPermanentToken);
        }
      } catch (e) {
        console.error('Failed to load token or user', e);
        await SecureStore.deleteItemAsync(PERMANENT_TOKEN_KEY);
        setToken(null); setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadTokenAndUser();
  }, []);

  // Redirigir al usuario según su rol
  // Esta función se encarga de redirigir al usuario a la ruta correspondiente según su rol
  const redirectToRole = useCallback((role: User['role']) => {
    if (role === 'ADMIN') router.replace('/(admin)/(tabs)/home');
    else if (role === 'INSPECTOR') router.replace('/(inspector)/(tabs)/home');
    else if (role === 'PARENT') router.replace('/(user)/(tabs)/generarRetiro');
    else router.replace('/(auth)/login');
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments.length > 0 && segments[0] === '(auth)'; // Verifica si está en el grupo de rutas de autenticación
    const currentPath = segments.join('/'); // Obtiene la ruta actual como una cadena
    const inForcePasswordChangeScreen = currentPath === '(auth)/force-change-password'; // Verifica si está en la pantalla de cambio de contraseña forzado
    const inMfaScreen = currentPath === '(auth)/mfa-verification'; // Verifica si está en la pantalla de verificación de MFA

    if (needsPasswordChange && !inForcePasswordChangeScreen) {
      router.replace('/(auth)/force-change-password');
      return;
    }
    if (awaitsMfaVerification && !inMfaScreen) {
      router.replace('/(auth)/mfa-verification');
      return;
    }

    if (!token && !needsPasswordChange && !awaitsMfaVerification && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && user && inAuthGroup && !needsPasswordChange && !awaitsMfaVerification && !inForcePasswordChangeScreen && !inMfaScreen) {
      redirectToRole(user.role);
    } else if (token && user && (segments.length as number) === 0 && !needsPasswordChange && !awaitsMfaVerification) {
      redirectToRole(user.role);
    }
  }, [token, user, segments, isLoading, router, needsPasswordChange, awaitsMfaVerification, redirectToRole]);

  const clearIntermediateStates = () => {
    setNeedsPasswordChange(false);
    setTempTokenState(null);
    setUserEmailForPasswordChange(null);
    setAwaitsMfaVerification(false);
    setMfaEmail(null);
  };

  const handleFullLoginSuccess = useCallback(async (permanentToken: string, userData: User) => {
    setToken(permanentToken);
    setUser(userData);
    await SecureStore.setItemAsync(PERMANENT_TOKEN_KEY, permanentToken);
    clearIntermediateStates();
    redirectToRole(userData.role);
  }, [redirectToRole]);

  const login = useCallback(async (rutLogin: string, passwordLogin: string, captchaToken?: string) => {
    setIsLoading(true);
    clearIntermediateStates(); 
    setToken(null); setUser(null); 
    await SecureStore.deleteItemAsync(PERMANENT_TOKEN_KEY);

    try {
      const response = await loginUser({ rut: rutLogin, password: passwordLogin, captchaToken });

      if ('forceChangePassword' in response && response.forceChangePassword === true) {
        const details = response as ForcePasswordChangeDetails;
        setTempTokenState(details.tempToken);
        setUserEmailForPasswordChange(details.email); 
        setNeedsPasswordChange(true);
      } else if ('mfaRequired' in response && response.mfaRequired === true) {
        const details = response as MfaRequiredDetails;
        setMfaEmail(details.email);
        setAwaitsMfaVerification(true);
      } else if ('token' in response && response.token && response.user) {
        const details = response as LoginSuccessDetails;
        await handleFullLoginSuccess(details.token, details.user);
      } else {
        console.error('Respuesta inesperada del API de login:', response);
        throw new Error('Respuesta inesperada del servidor durante el inicio de sesión.');
      }
    } catch (error) {
      console.error('Login failed in AuthContext:', error);
      clearIntermediateStates();
      setToken(null); setUser(null);
      await SecureStore.deleteItemAsync(PERMANENT_TOKEN_KEY);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleFullLoginSuccess]);

  const completeForcePasswordChange = useCallback(async (newPassword: string, confirmPassword: string) => {
    if (!tempTokenState) {
      throw new Error("No hay un token temporal válido para cambiar la contraseña.");
    }
    setIsLoading(true);
    try {
      const response = await completeForcePasswordApi(
        { newPassword, confirmPassword },
        tempTokenState
      );

      if ('mfaRequired' in response && response.mfaRequired === true) {
        const details = response as MfaRequiredDetails;
        setMfaEmail(details.email); // El email para MFA viene de esta respuesta
        setAwaitsMfaVerification(true);
        setNeedsPasswordChange(false); // Ya no necesita cambiar contraseña
        setTempTokenState(null);       // Token temporal usado
        setUserEmailForPasswordChange(null); // Email para cambio de pass ya no es necesario
        // Redirección a MFA manejada por useEffect
      } else if ('token' in response && response.token && response.user) {
        // Este caso es menos común según tu flujo, pero lo manejamos por si el backend lo permite
        const details = response as LoginSuccessDetails;
        await handleFullLoginSuccess(details.token, details.user);
      } else {
        console.error('Respuesta inesperada del API de forceChangePassword:', response);
        throw new Error('Respuesta inesperada del servidor al cambiar la contraseña.');
      }
    } catch (error) {
      console.error('Failed to complete password change:', error);
      // No limpiar tempTokenState aquí, para que el usuario pueda reintentar si es un error de red
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [tempTokenState, handleFullLoginSuccess]);

  const verifyMfa = useCallback(async (code: string) => {
    if (!mfaEmail) {
      throw new Error("No hay un email registrado para la verificación MFA.");
    }
    setIsLoading(true);
    try {
      const response = await verifyMfaApi({ email: mfaEmail, code });
      // La respuesta siempre debería ser LoginSuccessDetails si es exitosa
      await handleFullLoginSuccess(response.token, response.user);
    } catch (error) {
      console.error('Failed to verify MFA:', error);
      // No limpiar mfaEmail aquí, para que el usuario pueda reintentar
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mfaEmail, handleFullLoginSuccess]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    clearIntermediateStates();
    setToken(null); setUser(null);
    await SecureStore.deleteItemAsync(PERMANENT_TOKEN_KEY);
    // La redirección a login la manejará el useEffect principal
    // router.replace('/(auth)/login'); // Opcionalmente, forzar aquí
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!token && !!user && !needsPasswordChange && !awaitsMfaVerification;

  return (
    <AuthContext.Provider value={{
      login,
      logout,
      completeForcePasswordChange,
      verifyMfa,
      user,
      token,
      isAuthenticated,
      isLoading,
      needsPasswordChange,
      userEmailForPasswordChange, // Este es el email del usuario que necesita cambiar contraseña
      tempToken: tempTokenState,
      awaitsMfaVerification,
      mfaEmail // Este es el email para el cual se está verificando MFA
    }}>
      {children}
    </AuthContext.Provider>
  );
};