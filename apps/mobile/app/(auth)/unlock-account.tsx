import AuthBackground from '@/components/layout/AuthBackground';
import React from 'react';
import { View, Text } from 'react-native';


export default function UnlockScreen() { 
  return (
    <AuthBackground>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-blue-700 mb-3">Desbloquear cuenta</Text>
        <Text className="text-lg text-gray-600">Esta pantalla es para desbloquear la cuenta</Text>
      </View>
    </AuthBackground>
  );
}