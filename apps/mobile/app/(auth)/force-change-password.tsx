import React, { useState } from 'react';
import {View,Text, Alert, ScrollView} from 'react-native';

import AuthBackground from '@/components/layout/AuthBackground';
import { Ionicons } from '@expo/vector-icons'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import PasswordInput from '@/components/ui/input/PasswordInput';
import { useAuth } from '@/context/AuthContext';


export default function ForceChangePasswordScreen() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { completeForcePasswordChange, isLoading, userEmailForPasswordChange } = useAuth(); // Obtener del contexto

  const handleNextPress = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    if (newPassword.length < 6) { 
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await completeForcePasswordChange(newPassword, confirmPassword);
      // El AuthContext se encargará de la redirección si tiene éxito (a MFA o a home)
      // No es necesario limpiar campos aquí ya que la pantalla cambiará.
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      Alert.alert(
        'Error al Cambiar Contraseña',
        error.message || 'No se pudo actualizar la contraseña. Por favor, inténtelo de nuevo.'
      );
    }
  };


  const isFormValid =
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    newPassword === confirmPassword &&
    !isLoading;

  return (
    <AuthBackground>
      <ScrollView>
        <View className="flex-1 justify-start items-center px-5 max-w-[400px] mx-auto w-full pt-10">
          {/* Encabezado */}
          <View className="rounded-b-lg p-4 mb-10">
            <Ionicons name="lock-open-outline" size={80} color="black" />
          </View>

          {/* Título */}
          <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Crea tu Nueva Contraseña
          </Text>

          {/* Descripción */}
          <Text className="text-base text-gray-600 dark:text-gray-300 text-center mt-2 mb-8">
            {userEmailForPasswordChange ? `Hola ${userEmailForPasswordChange}, ` : ''}
            Como es tu primer inicio de sesión, por favor establece una contraseña segura.
          </Text>

          {/* Campo contraseña nueva */}
          <View className="mb-6 w-full">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1">Nueva contraseña</Text>
            <View className="mt-1 w-full">
              <PasswordInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Ingresa tu nueva contraseña"
                className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 w-full"
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Campo de confirmacion contraseña */}
          <View className="mb-6 w-full">
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

          {/* Botón de acción */}
          <View className="w-full max-w-[200px]">
            <PrimaryButton
              title="Confirmar Contraseña"
              onPress={handleNextPress}
              disabled={!isFormValid || isLoading} 
            />
          </View>
        </View>
      </ScrollView>
    </AuthBackground>
  );
}