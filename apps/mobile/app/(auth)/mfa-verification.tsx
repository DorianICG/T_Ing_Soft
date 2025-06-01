import React, { useState } from 'react';
import {View,Text} from 'react-native';

import AuthBackground from '@/components/layout/AuthBackground';
import { Ionicons } from '@expo/vector-icons'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import CodeInput from '@/components/ui/input/CodeInput';


export default function MfaVerificationScreen() { 
  const [smsCode, setSmsCode] = useState('');
  const smsCodeMaxDigits = 6; // Si se cambia, ajustar aqui

  // Logica al apretar botón
  const handleNextPress = () => {
    console.log('Código SMS ingresado:', smsCode);
    // Aqui debajo se añade logica para enviar al back
  };

  return (
    <AuthBackground>
      <View className="flex-1 justify-start items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Encabezado */}
        <View className="rounded-b-lg p-4 mb-10">
          <Ionicons name="key-outline" size={80} color="black" />
        </View>

        {/* Título */}
        <Text className="text-3xl font-bold text-center text-gray-900">
          Autenticación de 2 pasos
        </Text>

        {/* Descripción */}
        <Text className="text-base text-gray-600 text-center mb-8">
           Para verificar su identidad se le ha enviado un código vía mensaje SMS, por favor, ingrese su código
        </Text>

        {/* Campo de entrada */}
        <View className="mb-6">
          <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">Codigo SMS</Text>
          <View className="mt-1 w-[340px] mx-auto">

            <CodeInput
              label=""
              code={smsCode}
              onChange={setSmsCode}
              maxLength={smsCodeMaxDigits} 
            />
          </View>
        </View>


        {/* Botón de acción */}


      <View className="w-1/2">
        <PrimaryButton
          title="Verificar"
          onPress={handleNextPress}
          disabled={smsCode.trim().length !== smsCodeMaxDigits}

        />
      </View>



      </View>
    </AuthBackground>
  );
}