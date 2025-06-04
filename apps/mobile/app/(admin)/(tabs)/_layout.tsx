import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground'; 
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import '../../../global.css'; 
import { FiltersProvider } from '@/context/FiltersContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <FiltersProvider>
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
            title: 'Calidar Retiro',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="qrcode" color={color} />,
          }}
        />
        <Tabs.Screen
          name="manual-entry"
          options={{
            title: 'Retiro Manual',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="pencil" color={color} />,
          }}
        />
        <Tabs.Screen
          name="crud"
          options={{
            title: 'Gestion de datos',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="document" color={color} />,
          }}
        />
        <Tabs.Screen
          name="users"
          options={{
            title: 'usuarios',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="perfil"
          options={{
            title: 'perfil',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
          }}
        />

        { /* Pantallas Stack*/ }
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
          name="crud-add-bulk"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="crud-add-course"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="crud-add-student"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="crud-add-user"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="crud-delete"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="crud-edit-course"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="crud-edit-student"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="crud-edit-user"
          options={{
            href: null,
          }}
        />
      </Tabs>
      </FiltersProvider>
  );
}