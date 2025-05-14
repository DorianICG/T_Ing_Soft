import GlobalBackground from '@/components/layout/GlobalBackground';
import React from 'react';
import { View, Text } from 'react-native';


export default function GenearQRScreen() { 
  return (
    <GlobalBackground>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-blue-700 mb-3">Generar Retiro</Text>
        <Text className="text-lg text-gray-600">Esta pantalla es para generar un QR para el retiro de alumnos.</Text>
      </View>
    </GlobalBackground>
  );
}