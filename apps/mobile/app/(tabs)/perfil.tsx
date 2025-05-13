import React from 'react';
import { View } from 'react-native';
import LoginForm from '../../components/LoginForm';
import GlobalBackground from '@/components/layout/GlobalBackground';

export default function PerfilScreen() {
  return (
    <GlobalBackground>
      <View className="flex-1">
        <LoginForm onLogin={function (email: string, password: string): void {
          throw new Error('Function not implemented.');
        } } onForgotPassword={function (): void {
          throw new Error('Function not implemented.');
        } } />
      </View>
    </GlobalBackground>
  );
}