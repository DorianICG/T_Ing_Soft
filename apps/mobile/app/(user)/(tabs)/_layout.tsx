import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground'; 
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import '../../../global.css'; 

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
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="generarRetiro"
          options={{
            title: 'Retirar',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore" 
          options={{
            title: 'Explorar',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="line.3.horizontal" color={color} />,
          }}
        />
        <Tabs.Screen
          name="misAlumnos"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="misDelegados"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="historialRetiros"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="notificaciones"
          options={{
            href: null,
          }}
        />
      </Tabs>
  );
}