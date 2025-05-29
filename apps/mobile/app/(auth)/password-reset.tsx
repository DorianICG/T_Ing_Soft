import React, { useState } from 'react';
import {View,Text,Image,} from 'react-native';

import AuthBackground from '@/components/layout/AuthBackground';
import images from '@/constants/images';
import EmailInput from '@/components/ui/input/EmailInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function PasswordResetScreen() { 
  const [email, setEmail] = useState('');

  return (
    <AuthBackground>
      <View className="flex-1 justify-start items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Encabezado */}
       <View className="rounded-b-lg p-4 mb-10">
          <Image
            source={images.icons.shield} 
            className="w-20 h-20"
          />
        </View>

        {/* Título */}
        <Text className="text-3xl font-bold text-center text-gray-900">
          ¿Olvidaste tu contraseña?
        </Text>

        {/* Descripción */}
        <Text className="text-base text-gray-600 text-center mb-8">
          Ingrese su correo electrónico para proceder a la recuperación de la cuenta.
        </Text>

        {/* Campo de entrada de email */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">Correo electrónico</Text>
          <View className="mt-1 w-[340px] mx-auto">
            <EmailInput
              value={email}
              onChangeText={setEmail}
              placeholder="correo@ejemplo.com"
              className="w-full"
            />
          </View>
        </View>


        {/* Botón de acción */}

        <PrimaryButton
          title="Siguiente"
          onPress={() => {
            console.log('Correo electrónico ingresado:', email);
          }}
          disabled={!email.trim()}
        />


      </View>
    </AuthBackground>
  );
}