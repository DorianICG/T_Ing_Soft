import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';

export default function ValidacionRetiroScreen() {
  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Encabezado */}
        <View className="">
          <Image
            source={require('@/assets/images/custom/school.png')} // Reemplaza con la ruta real de la imagen
            className="w-20 h-20"
          />
        </View>

        {/* Sección principal */}
        <View className="bg-white rounded-lg p-4 shadow-md">
          {/* Títulos */}
          <Text className="text-lg font-bold mb-2">Validación Retiro</Text>
          <Text className="text-base font-medium mb-4">Información de retiro</Text>

          {/* Icono de advertencia */}
          <View className="flex-row items-center mb-2">
            <Image
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3089/3089110.png ' }} // Icono de advertencia
              className="w-6 h-6 mr-2"
            />
            <Text className="text-yellow-500 font-bold">(*) Solicitar autorización al operador para validar su identidad.</Text>
          </View>

          {/* Información del retiro */}
          <View>
            <Text className="text-base font-bold mb-1">Fecha: 24/04/2025 Hora: 10:35 a.m.</Text>
          </View>

          {/* Estudiante */}
          <View className="mb-2">
            <Text className="text-base font-bold mb-1">Estudiante</Text>
            <Text className="text-base">Camilo Andrés Rubilar Yaber</Text>
            <Text className="text-base">20522384-7</Text>
            <Text className="text-base">+569 7589 9865</Text>
            <Text className="text-base">Tercer Año Medio</Text>
          </View>

          {/* Delegado */}
          <View>
            <Text className="text-base font-bold mb-1">Delegado</Text>
            <Text className="text-base">Janina María Doe</Text>
            <Text className="text-base">20522384-7</Text>
            <Text className="text-base">+569 7589 9865</Text>
            <Text className="text-base">Tía Materna</Text>
          </View>
        </View>

        {/* Botones de acción */}
        <View className="mt-2 flex-row space-x-2">
          <TouchableOpacity
            className="bg-green-600 py-2 px-4 rounded-lg"
            onPress={() => console.log('Autorizar')}
          >
            <Text className="text-white font-medium">Autorizar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="bg-red-600 py-2 px-4 rounded-lg"
            onPress={() => console.log('Denegar')}
          >
            <Text className="text-white font-medium">Denegar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GlobalBackground>
  );
}