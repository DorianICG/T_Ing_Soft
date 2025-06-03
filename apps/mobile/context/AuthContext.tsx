import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { Platform } from 'react-native'; // Importar Platform
import {
  loginUser,
  completeForcePasswordApi,
  verifyMfaApi,
  ApiUser,
  ForcePasswordChangeDetails,
  MfaRequiredDetails,
  LoginSuccessDetails,
} from '../services/api';

//Datos del ususario que inicia sesion
const PERMANENT_TOKEN_KEY = 'user-permanent-token';
const USER_FIRST_NAME_KEY = 'user-first-name';
const USER_LAST_NAME_KEY = 'user-last-name';

// --- Funciones auxiliares para almacenamiento multiplataforma ---
const storeToken = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Failed to save token to localStorage', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getToken = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Failed to get token from localStorage', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteToken = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Failed to delete token from localStorage', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
// --- Fin de funciones auxiliares ---

type User = ApiUser;

interface AuthContextType {
  login: (rut: string, password: string, captchaToken?: string) => Promise<void>;
  logout: () => void;
  completeForcePasswordChange: (newPassword: string, confirmPassword: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsPasswordChange: boolean;
  userEmailForPasswordChange: string | null;
  tempToken: string | null;
  awaitsMfaVerification: boolean;
  mfaEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

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

  useEffect(() => {
    const loadTokenAndUser = async () => {
      console.log('[AUTH_LOAD] Cargando token y usuario ')
      setIsLoading(true);
      try {
        const storedPermanentToken = await getToken(PERMANENT_TOKEN_KEY); // Usar getToken
        console.log('[AUTH_LOAD] Token from storage:', storedPermanentToken ? 'found' : 'not found');
        if (storedPermanentToken) {
          setToken(storedPermanentToken);
        } else {
          setToken(null);
          setUser(null);
        }
      } catch (e) {
        console.error('[AUTH_LOAD] Failed to load token or user', e);
        await deleteToken(PERMANENT_TOKEN_KEY); // Usar deleteToken
        setToken(null); 
        setUser(null);
      } finally {
        console.log('[AUTH_LOAD] Finished loading. isLoading: false');
        setIsLoading(false);
      }
    };
    loadTokenAndUser();
  }, []);

  const redirectToRole = useCallback((role: User['role']) => {
    if (role === 'ADMIN') router.replace('/(admin)/(tabs)/home');
    else if (role === 'INSPECTOR') router.replace('/(inspector)/(tabs)/home');
    else if (role === 'PARENT') router.replace('/(user)/(tabs)/generarRetiro');
    else router.replace('/(auth)/login');
  }, [router]);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments.length > 0 && segments[0] === '(auth)';
    const currentPath = segments.join('/');
    const inForcePasswordChangeScreen = currentPath === '(auth)/force-change-password';
    const inMfaScreen = currentPath === '(auth)/mfa-verification';

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
    await storeToken(PERMANENT_TOKEN_KEY, permanentToken); // Usar storeToken
    await storeToken(USER_FIRST_NAME_KEY, userData.firstName);
    await storeToken(USER_LAST_NAME_KEY, userData.lastName);
    clearIntermediateStates();
    redirectToRole(userData.role);
  }, [redirectToRole]);

  const login = useCallback(async (rutLogin: string, passwordLogin: string, captchaToken?: string) => {
    setIsLoading(true);
    clearIntermediateStates();
    setToken(null); setUser(null);
    await deleteToken(PERMANENT_TOKEN_KEY); // Usar deleteToken

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
      await deleteToken(PERMANENT_TOKEN_KEY); // Usar deleteToken
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
        setMfaEmail(details.email);
        setAwaitsMfaVerification(true);
        setNeedsPasswordChange(false);
        setTempTokenState(null);
        setUserEmailForPasswordChange(null);
      } else if ('token' in response && response.token && response.user) {
        const details = response as LoginSuccessDetails;
        await handleFullLoginSuccess(details.token, details.user);
      } else {
        console.error('Respuesta inesperada del API de forceChangePassword:', response);
        throw new Error('Respuesta inesperada del servidor al cambiar la contraseña.');
      }
    } catch (error) {
      console.error('Failed to complete password change:', error);
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
      await handleFullLoginSuccess(response.token, response.user);
    } catch (error) {
      console.error('Failed to verify MFA:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [mfaEmail, handleFullLoginSuccess]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    clearIntermediateStates();
    setToken(null); setUser(null);
    await deleteToken(PERMANENT_TOKEN_KEY); // Usar deleteToken
    await deleteToken(USER_FIRST_NAME_KEY);
    await deleteToken(USER_LAST_NAME_KEY);
    setIsLoading(false);
    // La redirección a login la manejará el useEffect principal
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
      userEmailForPasswordChange,
      tempToken: tempTokenState,
      awaitsMfaVerification,
      mfaEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};