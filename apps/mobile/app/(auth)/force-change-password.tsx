import AuthBackground from '@/components/layout/AuthBackground';
import React from 'react';
import { View, Text } from 'react-native';


export default function ForceChangePasswordScreen() { 
  return (
    <AuthBackground>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-blue-700 mb-3">Cambio de contraseña forzado (PRIMER INGRESO)</Text>
        <Text className="text-lg text-gray-600">Esta pantalla es para cambiar la contraseña</Text>
      </View>
    </AuthBackground>
  );
}