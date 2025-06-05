import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground'; 
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import '../../../global.css'; 
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
      <Tabs
        screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
        <Tabs.Screen
          name="home"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />

        <Tabs.Screen
          name="scanner"
          options={{
            title: 'Validar Retiro',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="qr-code-outline" size={size ?? 28} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="manual-entry"
          options={{
            title: 'Retiro Manual',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pencil-outline" size={size ?? 28} color={color} />
            ),
          }}
        />


        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person" size={size ?? 28} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="inspectorStudents"
          options={{
            title: 'Alumnos',
            tabBarIcon: ({ color, size }) => (
              <FontAwesome5 name="graduation-cap" size={size ?? 28} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="historialRetiros"
          options={{
            title: 'Historial',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size ?? 28} color={color} />
            ),
          }}
        />



        {/*OCULTOS*/}
        <Tabs.Screen
          name="delegadoNoRegistrado"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="change-password"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="autorizacionRetiro"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="autorizacionRetiroManual"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="seleccionHistorialRetiros"
          options={{
            href: null,
          }}
        />
      </Tabs>



  );
}