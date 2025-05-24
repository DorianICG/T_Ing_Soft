import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground'; 

export default function SeleccionarPersonaScreen() {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const personas = [
    {
      id: 1,
      nombre: 'John Doe',
      relacion: 'Padre',
    },
    {
      id: 2,
      nombre: 'Carolina Andrea Yaber Rebolledo',
      relacion: 'Tía Materna',
    },
    {
      id: 3,
      nombre: 'Ángel Javier Rubilar Vega',
      relacion: 'Abuelo',
    },
  ];

  return (
    <GlobalBackground>
    <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">

        {/* Pregunta */}
        <Text className="text-xl font-bold text-blue-600 mb-4">
          ¿Quién retirará al alumno?
        </Text>

        {/* Opciones de selección */}
        <View className="w-full space-y-4 mb-8">
          {personas.map((persona) => (
            <TouchableOpacity
              key={persona.id}
              onPress={() => setSelectedPerson(persona.nombre)}
              className={`flex-row items-center p-4 rounded-lg border border-gray-300 ${
                selectedPerson === persona.nombre ? 'bg-blue-300' : ''
              }`}
            >
              <View>
                <Text className="text-base font-medium">{persona.nombre}</Text>
                <Text className="text-sm text-gray-500">{persona.relacion}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón continuar */}
        <TouchableOpacity
          disabled={!selectedPerson}
          className={`py-3 px-8 rounded-lg self-center flex-row items-center justify-center bg-blue-600 ${
            !selectedPerson ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white font-medium">Continuar</Text>
        </TouchableOpacity>
      </View>
    </GlobalBackground>
  );
}