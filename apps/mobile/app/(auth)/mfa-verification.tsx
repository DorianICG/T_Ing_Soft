import React, { useState } from 'react';
import {View,Text, Alert} from 'react-native';

import AuthBackground from '@/components/layout/AuthBackground';
import { Ionicons } from '@expo/vector-icons'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import CodeInput from '@/components/ui/input/CodeInput';
import { useAuth } from '@/context/AuthContext';


export default function MfaVerificationScreen() {
  const [Code, setCode] = useState('');
  const CodeMaxDigits = 6;
  const { verifyMfa, isLoading, mfaEmail } = useAuth(); 

  const handleNextPress = async () => {
    if (Code.trim().length !== CodeMaxDigits) {
      Alert.alert('Error', `El código debe tener ${CodeMaxDigits} dígitos.`);
      return;
    }

    try {
      await verifyMfa(Code.trim());
    } catch (error: any) {
      console.error('Error al verificar MFA:', error);
      Alert.alert(
        'Error de Verificación',
        error.message || 'No se pudo verificar el código. Por favor, inténtelo de nuevo.'
      );
    }
  };

  const getObfuscatedEmail = (email: string | null) => {
    if (!email) return 'tu correo electrónico';
    const [localPart, domain] = email.split('@');
    if (!domain) return email; 
    const obfuscatedLocal = localPart.length > 3
      ? `${localPart.substring(0, 2)}***${localPart.substring(localPart.length - 1)}`
      : `${localPart.substring(0, 1)}***`;
    return `${obfuscatedLocal}@${domain}`;
  };


  return (
    <AuthBackground>
      <View className="flex-1 justify-start items-center px-5 max-w-[400px] mx-auto w-full pt-10">
        {/* Encabezado */}
        <View className="rounded-b-lg p-4 mb-10">
          <Ionicons name="key-outline" size={80} color="black" />
        </View>

        {/* Título */}
        <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Verificación de Dos Pasos
        </Text>

        {/* Descripción */}
        <Text className="text-base text-gray-600 dark:text-gray-300 text-center mt-2 mb-8">
          Hemos enviado un código de verificación a {getObfuscatedEmail(mfaEmail)}.
          Por favor, ingrésalo a continuación.
        </Text>

        {/* Campo de entrada */}
        <View className="mb-6 w-full">
          <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1">Código de Verificación</Text>
          <View className="mt-1 w-full">
            <CodeInput
              label="Código de Verificación"
              code={Code}
              onChange={setCode} 
              maxLength={CodeMaxDigits}
            />
          </View>
        </View>

        {/* Botón de acción */}
        <View className="w-full max-w-[200px]">
          <PrimaryButton
            title="Verificar Código"
            onPress={handleNextPress}
            disabled={Code.trim().length !== CodeMaxDigits || isLoading}
          />
        </View>
      </View>
    </AuthBackground>
  );
}