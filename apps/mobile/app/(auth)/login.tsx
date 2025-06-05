import { useState } from 'react';
import { View, Text, SafeAreaView, ScrollView} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import RutInput from '@/components/ui/input/RutInput';
import PasswordInput from '@/components/ui/input/PasswordInput';
import AuthBackground from '@/components/layout/AuthBackground';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import TextLinkButton from '@/components/ui/buttons/TextLinkButton';

export default function LoginScreen() {
  const { login } = useAuth();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');

  // Logica al apretar botón
  const handleLogin = async () => {
    try {
      await login(rut, password);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert('Ocurrió un error desconocido');
      }
    }
  };

  return (
    <AuthBackground>
      {/* Contenedor */}
      <SafeAreaView className="flex-1">
        <ScrollView>
          <View className="flex-1 items-center justify-start">
            <Text className="text-3xl font-bold text-center text-gray-900">Bienvenido</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">Inicia sesión para continuar</Text>

            {/* Seccion inputs */}
            <View className="space-y-4">

              <Text className="text-sm font-semibold text-gray-500 mb-1 ml-1">RUT</Text>
              <RutInput
                value={rut}
                onChangeText={setRut}
                placeholder="12.345.678-9"
                className="bg-white p-4 rounded-lg border border-gray-200"
              />
            
              <Text className="text-sm font-semibold text-gray-500 mb-2 mt-2 ml-1">Contraseña</Text>
              <PasswordInput
                value={password}
                onChangeText={setPassword}
                placeholder="Ingrese su Contraseña"
                className="bg-white p-4 rounded-lg border border-gray-200"
              />

              {/* Botón Ingresar */}
              <View className="flex-1 justify-center items-center p-2">
                <View className="w-1/2">
                  <PrimaryButton
                    title="Ingresar"
                    onPress={handleLogin}
                    disabled={!rut.trim() || !password.trim()}
                  />
                </View>
              </View>

              {/* Contraseña */}
              <View className="items-center">
                <TextLinkButton
                  title="¿Olvidaste tu contraseña?"
                  onPress={() => router.push('/forgot-password')}
                />
              </View>


              <Text className="text-xs text-gray-500 text-center mt-2">
                (*) Si no cuentas con tus credenciales, ponte en contacto con tu entidad académica
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthBackground>
  );
}