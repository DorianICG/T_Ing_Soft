import React, { useState } from 'react';
import {View,Text} from 'react-native';

import AuthBackground from '@/components/layout/AuthBackground';
import { Ionicons } from '@expo/vector-icons'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import PasswordInput from '@/components/ui/input/PasswordInput';


export default function ForceChangePasswordScreen() { 
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Logica al apretar botón
  const handleNextPress = () => {
    console.log('Contraseña nueva ingresada:', newPassword);
    // Aqui debajo se añade logica para enviar al back
  };

  //logica para habilitar boton
  const isFormValid =
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    newPassword === confirmPassword;

  return (
    <AuthBackground>
      <View className="flex-1 justify-start items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Encabezado */}
        <View className="rounded-b-lg p-4 mb-10">
          <Ionicons name="lock-open-outline" size={80} color="black" />
        </View>

        {/* Título */}
        <Text className="text-3xl font-bold text-center text-gray-900">
          Ingrese su nueva contraseña
        </Text>

        {/* Descripción */}
        <Text className="text-base text-gray-600 text-center mb-8">
           Ya que es su primera vez ingresando, le pedimos por favor que ingrese su contraseña definitiva
        </Text>

        {/* Campo contraseña nueva */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">Nueva contraseña</Text>
          <View className="mt-1 w-[340px] mx-auto">

        <PasswordInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Ingrese su contraseña nueva"
          className="bg-white p-4 rounded-lg border border-gray-200"
        />
          </View>
        </View>

        {/* Campo de confirmacion contraseña */}
          <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">Confirmar contraseña</Text>
          <View className="mt-1 w-[340px] mx-auto">

        <PasswordInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Ingrese nuevamente"
          className="bg-white p-4 rounded-lg border border-gray-200"
        />
          </View>
        </View>


        {/* Botón de acción */}
        <View className="w-1/2">
          <PrimaryButton
            title="Confirmar"
            onPress={handleNextPress}
            disabled={!isFormValid}
          />

      </View>
    </View>
    </AuthBackground>
  );
}