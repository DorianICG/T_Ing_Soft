import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground'; // Suponiendo que este componente existe

export default function RetiroManualScreen() {
  const [alumnoRut, setAlumnoRut] = useState('');
  const [delegadoNombre, setDelegadoNombre] = useState('');

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Encabezado */}
        <View className="p-4 mb-6">
          <Text className="text-white text-xl font-bold">School Name</Text>
          <Image
            source={require('@/assets/images/custom/school.png')} 
            className="w-20 h-20"
          />
        </View>

        {/* Sección principal */}
        <Text className="text-lg font-bold mb-4">Retiro Manual</Text>

        {/* Campo de entrada para Alumno */}
        <View className="mb-4 w-full">
          <Text className="text-base font-bold mb-2">Alumno</Text>
          <View className="flex-row items-center bg-gray-200 rounded-lg border border-gray-300 p-2">
            <Image
              source={require('@/assets/images/custom/search.png')}
              className="w-6 h-6 mr-2"
            />
            <TextInput
              value={alumnoRut}
              onChangeText={setAlumnoRut}
              placeholder="Ingrese RUT del Alumno"
              className="flex-1 text-gray-700"
            />
          </View>
        </View>

        {/* Campo de entrada para Delegado */}
        <View className="mb-4 w-full">
          <Text className="text-base font-bold mb-6">Delegado</Text>
          <View className="flex-row items-center bg-gray-200 rounded-lg border border-gray-300 p-2">
            <Image
              source={require('@/assets/images/custom/search.png')}
              className="w-6 h-6 mr-2"
            />
            <TextInput
              value={delegadoNombre}
              onChangeText={setDelegadoNombre}
              placeholder="Buscar delegado"
              className="flex-1 text-gray-700"
            />
            <TouchableOpacity className="mr-2">
              <Image
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077035.png ' }} // Icono de checkmark
                className="w-6 h-6"
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center bg-gray-200 rounded-lg border border-gray-300 p-2 mb-2">
            <Text className="text-gray-700">Jane Marie Doe 20522384-7</Text>
          </View>
          <View className="flex-row items-center bg-gray-200 rounded-lg border border-gray-300 p-2">
            <Text className="text-gray-700">Delegado no registrado</Text>
          </View>
        </View>

        {/* Botón de acción */}
        <TouchableOpacity
          onPress={() => console.log('Continuar')}
          className="bg-blue-600 py-3 px-8 rounded-lg self-center flex-row items-center space-x-2"
        >
          <Text className="text-white font-medium">Continuar</Text>
        </TouchableOpacity>
      </View>
    </GlobalBackground>
  );
}