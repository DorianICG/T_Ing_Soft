import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';
import Icon from '@expo/vector-icons/Ionicons'; 
import { useRouter } from 'expo-router';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function SeleccionarPersonaScreen() {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const router = useRouter();

  const personas = [
    {
      id: 1,
      nombre: 'David Ignacio Rubilar Yaber',
      foto: 'https://via.placeholder.com/80',  // Reemplaza con URL real
    },
    {
      id: 2,
      nombre: 'Camilo Andrés Rubilar Yaber',
      foto: 'https://via.placeholder.com/80',  // Reemplaza con URL real
    },
  ];

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Header Section */}
        <View className="flex-row items-center mb-6">
          <Text className="text-2xl font-bold text-white mr-2">John Doe</Text>
        </View>

        {/* Question */}
        <Text className="text-xl font-bold text-blue-600 mb-4">
          Historial de retiros
        </Text>
        <Text className="text-base text-gray-600 mb-4 text-center">
          ¿De qué alumno desea ver el historial de retiros?
        </Text>

        {/* Person Selection Buttons */}
        <View className="w-full space-y-2">
          {personas.map((persona) => (
            <TouchableOpacity
              key={persona.id}
              onPress={() => setSelectedPerson(persona.nombre)}
              className={`flex-row items-center p-6 rounded-xl border border-gray-800 ${
                selectedPerson === persona.nombre
                ? 'bg-blue-500 border-blue-500'
                : ''
              }`}
            >
              <Text
                className={`text-base ${
                  selectedPerson === persona.nombre ? 'text-white' : 'text-blue-500'
                }`}
              >
                {persona.nombre}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Option for "Todos los alumnos" */}
          <TouchableOpacity
            onPress={() => setSelectedPerson('Todos los alumnos')}
            className={`flex-row items-center p-6 rounded-xl border border-gray-800 ${
              selectedPerson === 'Todos los alumnos'
                ? 'bg-blue-500 border-blue-500'
                : ''
            }`}
          >
            <Text
              className={`text-base ${
                selectedPerson === 'Todos los alumnos' ? 'text-white' : 'text-blue-500'
              }`}
            >
              Todos los alumnos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Botón continuar con PrimaryButton */}
        <PrimaryButton
          title="Continuar"
          icon={<Icon name="arrow-forward" size={20} color="white" />}
          onPress={() => {
            if (selectedPerson) {
              router.push('/historialRetiros');
            }
          }}
        />
      </View>
    </GlobalBackground>
  );
}