import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  isLoading?: boolean; 
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onForgotPassword, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginPress = () => {
    onLogin(email, password);
  };

  return (
    <View className="px-6 pb-8 pt-8">
      <View className="items-center mb-2 -mt-12"> 
      </View>
      <Text className="text-3xl font-bold text-center text-gray-900">Login</Text>
      <Text className="text-gray-400 text-center mt-1 mb-6">Inicia sesión para continuar</Text>
      
      <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">EMAIL</Text>
      <View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-300 px-3 mb-4">
        <TextInput
          className="flex-1 py-3 text-base text-gray-700"
          placeholder="Correo electrónico"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
          editable={!isLoading}
        />
      </View>

      <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">PASSWORD</Text>
      <View className="flex-row items-center bg-gray-100 rounded-xl border border-gray-300 px-3 mb-6">
        <TextInput
          className="flex-1 py-3 text-base text-gray-700"
          placeholder="Contraseña"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          editable={!isLoading}
        />
      </View>

      <TouchableOpacity
        className={`bg-blue-800 rounded-xl py-3 items-center mb-3 ${isLoading ? 'opacity-50' : ''}`}
        onPress={handleLoginPress}
        disabled={isLoading}
      >
        <Text className="text-white text-lg font-bold">
          {isLoading ? 'Ingresando...' : 'Ingresar'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onForgotPassword} disabled={isLoading}>
        <Text className="text-blue-700 text-center text-sm font-semibold mb-6">
          ¿Olvidaste tu contraseña?
        </Text>
      </TouchableOpacity>

      <Text className="text-xs text-gray-500 text-center mt-2">
        (*) Si no cuentas con tus credenciales, ponte en contacto con tu entidad académica
      </Text>
    </View>
  );
};

export default LoginForm;