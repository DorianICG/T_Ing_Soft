import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';
import PickupInfoCard from '@/components/ui/cards/PickupInfoCard';
import { Ionicons } from '@expo/vector-icons'; 


export default function ValidacionRetiroScreen() {

  //DATOS DE PRUEBA, AL AGREGAR API, RESPETAR FORMATO
  const pickupData = {
    date: '24/04/2025',
    time: '10:35 a.m.',
    student: {
      name: 'Camilo Andrés Rubilar Yaber',
      rut: '20522384-7',
      phone: '+569 7589 9865',
      grade: 'Tercer Año Medio',
    },
    delegate: {
      name: 'Janina María Doe',
      rut: '20522384-7',
      phone: '+569 7589 9865',
      relation: 'Tía Materna',
    },
  };

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">

        <Text className="text-xl font-bold text-blue-600 mb-4">
          Validación Retiro
        </Text>
        {/* Contenedor "carta" */}

        <View className="bg-white rounded-lg p-3 shadow-md w-full">
          {/* Título con ícono */}
          <View className="items-center mb-1">
            <Ionicons name="warning" size={32} color="#facc15" />
          </View>

          <Text className="text-sm font-bold mb-2 text-center text-red-600">Información de retiro</Text>

          {/* Fecha y hora */}
          <Text className="text-sm mb-1 text-center">
            <Text className="font-bold">Fecha:</Text> {pickupData.date}{' '} <Text className="font-bold">Hora:</Text> {pickupData.time}
          </Text>

          {/* Estudiante */}
          <View className="mb-1">
            <Text className="text-sm font-bold mb-1 text-red-600">Estudiante</Text>
            <PickupInfoCard
              name={pickupData.student.name}
              rut={pickupData.student.rut}
              phone={pickupData.student.phone}
              grade={pickupData.student.grade}
            />
          </View>

          {/* Delegado */}
          <View>
            <Text className="text-sm font-bold mb-1 text-red-600">Delegado</Text>
            <PickupInfoCard
              name={pickupData.delegate.name}
              rut={pickupData.delegate.rut}
              phone={pickupData.delegate.phone}
              relation={pickupData.delegate.relation}
            />
          </View>
        </View>


        <Text className="text-xs text-gray-500 text-center mt-2"> (*) Solicitar autorización al operador para validar su identidad. </Text>

        {/* Contenedor Botones */}
        <View className="mt-2 flex-row space-x-2">

          {/* Boton autorizar */}
          <TouchableOpacity
            className="bg-green-600 py-2 px-4 rounded-lg"
            onPress={() => console.log('Autorizar')}
          >
            <Text className="text-white font-medium">Autorizar</Text>
          </TouchableOpacity>

          {/* Boton Denegar */}
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