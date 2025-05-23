import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';
import Icon from '@expo/vector-icons/Ionicons'; 
import { useRouter } from 'expo-router';
export default function SeleccionarPersonaScreen() {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const router = useRouter();

  const personas = [
    {
      id: 1,
      nombre: 'David Ignacio Rubilar Yaber',
      foto: 'https://via.placeholder.com/80 ', // Reemplaza con URL real
    },
    {
      id: 2,
      nombre: 'Camilo Andrés Rubilar Yaber',
      foto: 'https://via.placeholder.com/80 ', // Reemplaza con URL real
    },
  ];

  return (
    <GlobalBackground>
    <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Pregunta */}
        <Text className="text-xl font-bold text-blue-600 mb-4">
          ¿A quién desea retirar?
        </Text>

        <View className="w-full space-y-4 mb-8">
        {personas.map((persona) => (
            <TouchableOpacity
            key={persona.id}
            onPress={() => setSelectedPerson(persona.nombre)}
            className={`flex-row items-center p-6 rounded-xl border border-grey-800 ${
                selectedPerson === persona.nombre ? 'border-blue-500' : ''
            }`}
            >
            <Text className="ml-6 text-base text-black flex-1">
                {persona.nombre}
            </Text>
            </TouchableOpacity>
        ))}
        </View>

        {/* Botón continuar */}
        <TouchableOpacity
          disabled={!selectedPerson}
          onPress={() => {
            if (selectedPerson) {
              router.push('/encargadoRetiro'); 
            }
          }}
          className={`py-3 px-8 rounded-lg self-center flex-row items-center space-x-2 ${
            selectedPerson ? 'bg-blue-600' : 'bg-gray-300'
          }`}
        >
          <Text className="text-white font-medium">Continuar</Text>
          <Icon name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </GlobalBackground>
  );
}