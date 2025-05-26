import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground'; // Suponiendo que este componente existe

export default function CuentaBloqueadaScreen() {
  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Encabezado, crear figma de imagen (escudo) */}
       {/* <View className="bg-blue-900 rounded-b-lg p-4 mb-6">
          <Image
            source={require('@/assets/images/custom/LOGO.jpg')} 
            className="w-20 h-20"
          />
        </View>*/}

        {/* Icono de advertencia */}
        <View className="mb-4">
          <Text className="text-yellow-500 text-4xl font-bold text-center">
            ⚠️
          </Text>
        </View>

        {/* Mensaje principal */}
        <Text className="text-xl font-bold text-gray-800 mb-4">
          Tu cuenta ha sido bloqueada
        </Text>

        {/* Descripción secundaria */}
        <Text className="text-base text-gray-600 text-center mb-8">
          Debido a que se han registrado múltiples intentos fallidos para iniciar sesión, se ha bloqueado esta por motivos de seguridad.
        </Text>

        {/* Botón de recuperación */}
        <TouchableOpacity
          onPress={() => {
            // Lógica para redirigir a la pantalla de recuperación de cuenta
            console.log('Redirigiendo a Recuperar cuenta...');
          }}
          className="bg-blue-600 py-3 px-8 rounded-lg self-center flex-row items-center space-x-2"
        >
          <Text className="text-white font-medium">Recuperar cuenta</Text>
        </TouchableOpacity>
      </View>
    </GlobalBackground>
  );
}