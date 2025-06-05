import React, { useState } from 'react';
import {View,Text,Image, Alert, ScrollView, ActivityIndicator} from 'react-native';
import { useRouter } from 'expo-router';
import AuthBackground from '@/components/layout/AuthBackground';
import images from '@/constants/images';
import EmailInput from '@/components/ui/input/EmailInput';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { requestPasswordResetApi } from '@/services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null); // Para mostrar mensaje de éxito/info
  const router = useRouter();

  const handleNextPress = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor, ingresa tu correo electrónico.');
      return;
    }
    setIsLoading(true);
    setMessage(null);
    try {
      const response = await requestPasswordResetApi({ email });
      setMessage(response.message);
      Alert.alert(
        'Solicitud Enviada',
        response.message + "\n\nPor favor, revisa tu bandeja de entrada (y spam)."
      );
      // se puede redirigir al login o mostrar el mensaje en la misma pantalla.
      // setEmail(''); // para limpiar campo
    } catch (error: any) {
      console.error('Error al solicitar reseteo de contraseña:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo procesar tu solicitud. Inténtalo de nuevo.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthBackground>
      <ScrollView>
        <View className="flex-1 justify-start items-center px-5 max-w-[400px] mx-auto w-full pt-10">
          {/* Encabezado */}
          <View className="rounded-b-lg p-4 mb-10">
            <Image
              source={images.icons.shield}
              className="w-20 h-20"
              resizeMode="contain" 
            />
          </View>

          {/* Título */}
          <Text className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            ¿Olvidaste tu contraseña?
          </Text>

          {/* Descripción */}
          <Text className="text-base text-gray-600 dark:text-gray-300 text-center mt-2 mb-8">
            Ingresa tu correo electrónico y te enviaremos instrucciones para restablecer tu contraseña.
          </Text>

          {/* Campo de entrada de email */}
          <View className="mb-6 w-full">
            <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 ml-1">Correo electrónico</Text>
            <View className="mt-1 w-full">
              <EmailInput
                value={email}
                onChangeText={setEmail}
                placeholder="correo@ejemplo.com"
                className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 w-full"
                editable={!isLoading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Mensaje de feedback */}
          {message && (
            <View className="my-4 p-3 bg-green-100 dark:bg-green-700 rounded-md w-full">
              <Text className="text-green-700 dark:text-green-100 text-center">{message}</Text>
            </View>
          )}
          {isLoading && <ActivityIndicator size="large" color="#0000ff" className="my-4" />}


          {/* Botón de acción */}
          <View className="w-full max-w-[200px]">
            <PrimaryButton
              title="Enviar Instrucciones"
              onPress={handleNextPress}
              disabled={!email.trim() || isLoading}
            />
          </View>

          {/* Enlace para volver a Login */}
          <View className="mt-8">
            <Text
              className="text-blue-600 dark:text-blue-400 text-center"
              onPress={() => router.replace('/(auth)/login')} // Asume que tienes una ruta de login
            >
              Volver a Iniciar Sesión
            </Text>
          </View>
        </View>
      </ScrollView>
    </AuthBackground>
  );
}