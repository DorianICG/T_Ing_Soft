import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground'; // Suponiendo que este componente existe

export default function RecuperarContrasenaScreen() {
  const [email, setEmail] = useState('');

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Encabezado */}
       <View className="rounded-b-lg p-4 mb-10">
          <Image
            source={require('@/assets/images/custom/shield.png')} 
            className="w-20 h-20"
          />
        </View>

        {/* Título */}
        <Text className="text-xl font-bold text-gray-800">
          ¿Olvidaste tu contraseña?
        </Text>

        {/* Descripción */}
        <Text className="text-base text-gray-600 text-center mb-8">
          Ingrese su correo electrónico para proceder a la recuperación de la cuenta.
        </Text>

        {/* Campo de entrada de email */}
        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700">Email</Text>
          <View className="flex-row items-center bg-gray-200 rounded-lg border border-gray-300 p-2 mt-1 w-[300px] mx-auto">
            <Image
              source={require('@/assets/images/custom/email.png')}
              className="w-6 h-6 mr-2"
            />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Correo electrónico"
              className="flex-1 text-gray-700"
            />
          </View>
        </View>

        {/* Botón de acción */}
        <TouchableOpacity
          onPress={() => {
            console.log('Correo electrónico ingresado:', email);
            // Lógica para enviar el correo electrónico o redirigir a la siguiente pantalla
          }}
          className={`py-3 px-8 rounded-lg self-center flex-row items-center space-x-2 ${
            email.trim() ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white font-medium">Siguiente</Text>
        </TouchableOpacity>
      </View>
    </GlobalBackground>
  );
}