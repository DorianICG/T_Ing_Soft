import GlobalBackground from '@/components/layout/GlobalBackground';
import React from 'react';
import { View, Text } from 'react-native';


export default function NotificacionesScreen() { 
  return (
    <GlobalBackground>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-blue-700 mb-3">Notificaciones</Text>
        <Text className="text-lg text-gray-600">Esta pantalla es para ver las notificaciones</Text>
      </View>
    </GlobalBackground>
  );
}