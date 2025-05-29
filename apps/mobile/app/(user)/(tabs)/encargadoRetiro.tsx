import React, { useState } from 'react';
import {View,Text,ScrollView} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground'; 
import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

import { useAppContext } from '@/context/AppContext';
import { router } from 'expo-router';


export default function SeleccionarPersonaScreen() {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const { setData } = useAppContext(); //Set de datos

  //DATOS DE PRUEBA, AL AGREGAR API, RESPETAR FORMATO
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

    //Funcion a ejecutar cuando se apreta el boton
  const handleContinue = () => {
    if (selectedPerson) {
      const selected = personas.find(p => p.nombre === selectedPerson);
      if (selected) {
        setData((prevData: any) => ({
          ...prevData, //Guarda contexto anterior, sin sobrescribir
          delegadoSeleccionado: {
            id: selected.id,
            nombre: selected.nombre,
            relacion: selected.relacion,
          },
        }
      ));

        // redirige a pantalla nueva
        router.push('/generarRetiro');
      }
    }
  };

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">

        {/* Pregunta */}
        <Text className="text-xl font-bold text-blue-600 mb-4">
          ¿Quién retirará al alumno?
        </Text>

        {/* Opciones de selección */}
    <View className="w-full mb-8 max-h-80"> 
      <ScrollView contentContainerClassName="space-y-4">
          {personas.map((persona) => (
            
            //MAPEO DE DATOS A BOTON

            <SelectOptionButton
              key={persona.id}
              label={persona.nombre}
              sublabel={persona.relacion}
              isSelected={selectedPerson === persona.nombre}
              onPress={() => setSelectedPerson(persona.nombre)}
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