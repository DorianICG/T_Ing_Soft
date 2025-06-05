import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router'; 
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '../context/AuthContext'; 
import { useEffect } from 'react';
import { ActivityIndicator, Text, View, Image } from 'react-native'; 
import { AppProvider } from '@/context/AppContext';

import images from '@/constants/images';
import { FiltersProvider } from '@/context/FiltersContext';

// Prevenir que la splash screen se oculte automáticamente
SplashScreen.preventAutoHideAsync();

function InitialLayout() {
  const { isLoading: authLoading } = useAuth();
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    // Ocultar la splash screen una vez que las fuentes estén cargadas Y la autenticación no esté cargando
    if ((fontsLoaded || fontError) && !authLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, authLoading]);

  // Muestra un estado de carga mientras las fuentes o la autenticación se están procesando
  if (!fontsLoaded && !fontError || authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        
        <Image
          source={images.logos.logoBlack}
          style={{ width: 200, height: 200, marginBottom: 20 }}
          resizeMode="contain"
        />

        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginBottom: 20 }} />

        <Text>Cargando...</Text>
      </View>
    );
  }

  // Slot renderizará la ruta actual determinada por Expo Router y tu lógica de AuthContext
  // Si quieres un Stack global para modales o pantallas que no estén en grupos, puedes definirlo aquí.
  // Pero para la navegación principal basada en autenticación, Slot es suficiente.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <FiltersProvider>
        <InitialLayout />
        </FiltersProvider>
      </AppProvider>
    </AuthProvider>
  );
}