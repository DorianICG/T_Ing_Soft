import React, { useState } from 'react';
import {View,Text,ScrollView} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';

import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

import { useAppContext } from '@/context/AppContext';
import { router } from 'expo-router';

export default function SeleccionarPersonaScreen() {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const { setData  } = useAppContext(); //Set de datos para contexto

  //Datos de prueba
  const personas = [
    {
      id: "ALU1",
      nombre: 'David Ignacio Rubilar Yaber',
    },
    {
      id: "ALU2",
      nombre: 'Camilo Andrés Rubilar Yaber',
    },
  ];

  //Funcion a ejecutar cuando se apreta el boton
  const handleContinue = () => {
    if (selectedPerson) {
      const selected = personas.find(p => p.id === selectedPerson);

      if (selected) {
        // Se guardan datos en el contexto (sobrescribe)
        setData({
          alumnoSeleccionado: {
            id: selected.id,
            nombre: selected.nombre,
          },
        });

        router.push('/encargadoRetiro');
      }
    }
  };

  return (
    <GlobalBackground>
    <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Pregunta */}
        <Text className="text-xl font-bold text-blue-600 mb-4">
          ¿A quién desea retirar?
        </Text>

    {/* Opciones de selección */}
    <View className="w-full mb-8 max-h-80"> 
      <ScrollView contentContainerClassName="space-y-4">
        {personas.map((persona) => (
          <SelectOptionButton
            key={persona.id}
            label={persona.nombre}
            isSelected={selectedPerson === persona.id}
            onPress={() => setSelectedPerson(persona.id)}
          />
        ))}
      </ScrollView>
    </View>

      {/* Botón continuar */}
      <View className="w-full px-4">
        <View className="max-w-[320px] w-full mx-auto">
          <PrimaryButton
            title="Continuar"
            disabled={!selectedPerson}
              onPress={handleContinue} 
            />
        </View>
      </View>


      </View>
    </GlobalBackground>
  );
}