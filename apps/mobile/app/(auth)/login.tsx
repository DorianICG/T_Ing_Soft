import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import RutInput from '../../components/RutInput';
import PasswordInput from '../../components/PasswordInput';

export default function LoginScreen() {
  const { login } = useAuth();
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');

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
    <View className="flex-1 bg-gray-50 p-6 justify-center">
      <Text className="text-3xl font-bold text-blue-800 mb-8 text-center">
        Retiro Seguro
      </Text>

      <View className="space-y-4">
        <RutInput
          value={rut}
          onChangeText={setRut}
          placeholder="12.345.678-9"
          className="bg-white p-4 rounded-lg border border-gray-200"
        />
        
        <PasswordInput
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          className="bg-white p-4 rounded-lg border border-gray-200"
        />

        <TouchableOpacity
          onPress={handleLogin}
          className="bg-blue-600 p-4 rounded-lg items-center"
        >
          <Text className="text-white font-semibold text-lg">Ingresar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push('/password-reset')}
          className="mt-4 items-center"
        >
          <Text className="text-blue-600">¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}