import React, { useState } from 'react';
import {View,Text} from 'react-native';

import AuthBackground from '@/components/layout/AuthBackground';
import { Ionicons } from '@expo/vector-icons'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';


export default function UnlockScreen() { 

  // Logica al apretar botón
  const handleNextPress = () => {
    console.log('Botón apretado');
    // Aqui debajo se añade logica para enviar al back
  };

  return (
    <AuthBackground>
    <View className="flex-1 justify-start items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Encabezado */}
        <View className="rounded-b-lg p-4 mb-10">
          <Ionicons name="warning" size={80} color="#facc15" />
        </View>

        {/* Título */}
        <Text className="text-3xl font-bold text-center text-gray-900">
          Tu cuenta ha sido bloqueada
        </Text>

        {/* Descripción */}
        <Text className="text-base text-gray-600 text-center mb-8">
          Debido a que se han registrado múltiples intentos fallidos para iniciar sesión, se ha bloqueado este por motivos de seguridad.
        </Text>

        {/* Botón de acción */}
      <View className="w-1/2">
        <PrimaryButton
          title="Recuperar cuenta"
          onPress={handleNextPress}
        />
      </View>



      </View>
    </AuthBackground>
  );
}