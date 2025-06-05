import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router'; 

import AuthBackground from '@/components/layout/AuthBackground';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import PasswordInput from '@/components/ui/input/PasswordInput';
import { resetPasswordApi, DetailedApiError } from '@/services/api'; 
export default function ResetPasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  const params = useLocalSearchParams<{ token?: string }>(); 
  const router = useRouter();

  useEffect(() => {
    if (params.token) {
      setResetToken(params.token);
    } else {
      Alert.alert("Error", "Token de reseteo no encontrado. Por favor, solicita un nuevo enlace para restablecer tu contraseña.");
      router.replace('/(auth)/forgot-password'); 
    }
  }, [params, router]);

  const handleNextPress = async () => {
    setPasswordErrors([]); // Limpiar errores previos
    if (!resetToken) {
      Alert.alert('Error', 'Token de reseteo inválido.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) { 
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPasswordApi({ token: resetToken, newPassword });
      Alert.alert(
        'Éxito',
        response.message + "\nAhora puedes iniciar sesión con tu nueva contraseña."
      );
      router.replace('/(auth)/login'); 
    } catch (error: any) {
      console.error('Error al restablecer contraseña:', error);
      if (error instanceof DetailedApiError && error.errors) {
        // Si tenemos errores detallados del campo 'newPassword'
        const specificPasswordErrors = error.errors
          .filter((e: { field?: string; message: string }) => e.field === 'newPassword' || !e.field) // Tomar errores de newPassword o errores generales
          .map((e: { message: string }) => e.message);
        
        if (specificPasswordErrors.length > 0) {
          setPasswordErrors(specificPasswordErrors);
          Alert.alert('Error de Validación', 'Por favor, corrige los errores indicados.');
        } else {
          Alert.alert('Error al Restablecer', error.message || 'No se pudo restablecer la contraseña.');
        }
      } else {
        // Error genérico
        Alert.alert(
          'Error al Restablecer',
          error.message || 'No se pudo restablecer la contraseña. Por favor, inténtelo de nuevo o solicita un nuevo enlace.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    newPassword === confirmPassword &&
    !isLoading;

  if (!resetToken && !isLoading) {
    return (
      <AuthBackground>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <Text className="mt-2">Verificando token...</Text>
        </View>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View className="flex-1 justify-start items-center px-5 max-w-[400px] mx-auto w-full pt-10">
          {/* ... (Icono y Títulos) ... */}
          <View className="rounded-b-lg p-4 mb-10">
            <Ionicons name="key-outline" size={80} color="black" />
          </View>

          <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Restablecer Contraseña
          </Text>

          <Text className="text-base text-gray-600 dark:text-gray-300 text-center mt-2 mb-8">
            Por favor, ingresa tu nueva contraseña.
          </Text>

          {/* Campo Nueva Contraseña y sus errores */}
          <View className="mb-2 w-full">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1">Nueva contraseña</Text>
            <View className="mt-1 w-full">
              <PasswordInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  if (passwordErrors.length > 0) setPasswordErrors([]); 
                }}
                placeholder="Ingresa tu nueva contraseña"
                className={`bg-white dark:bg-gray-700 p-4 rounded-lg border ${passwordErrors.length > 0 ? 'border-red-500' : 'border-gray-200 dark:border-gray-600'} w-full`}
                editable={!isLoading}
              />
            </View>
            {passwordErrors.map((errorMsg, index) => (
              <Text key={index} className="text-red-500 text-xs mt-1 ml-1">
                {errorMsg}
              </Text>
            ))}
          </View>

          {/* Campo Confirmar Contraseña */}
          <View className="mb-6 w-full mt-4">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1">Confirmar contraseña</Text>
            <View className="mt-1 w-full">
              <PasswordInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirma tu nueva contraseña"
                className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 w-full"
                editable={!isLoading}
              />
            </View>
          </View>

          {isLoading && <ActivityIndicator size="large" color="#0000ff" className="my-4" />}

          <View className="w-full max-w-[200px] mt-4">
            <PrimaryButton
              title="Restablecer Contraseña"
              onPress={handleNextPress}
              disabled={!isFormValid || isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </AuthBackground>
  );
}