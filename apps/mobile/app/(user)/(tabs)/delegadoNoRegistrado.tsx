import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';
import PickupInfoCard from '@/components/ui/cards/PickupInfoCard';
import { Ionicons } from '@expo/vector-icons'; 


export default function DelegadoNoRegistradoScreen() {

  //DATOS DE PRUEBA, AL AGREGAR API, RESPETAR FORMATO
  const pickupData = {
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
          Retiro Manual
        </Text>
        <Text className="text-2xl font-bold text-red-600 mb-4">
        Delegado no registrado
        </Text>
        {/* Contenedor "carta" */}

        <View className="bg-white rounded-lg p-3 shadow-md w-full">
          {/* Título con ícono */}
          <View className="items-center mb-1">
            <Ionicons name="warning" size={32} color="#facc15" />
          </View>

        <Text className="text-lg font-bold mb-2 text-center text-red-600">
        Este delegado no se encuentra en nuestro registro
        </Text>


          {/* Delegado */}
          <View>
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
            <Text className="text-white font-medium">Enviar</Text>
          </TouchableOpacity>

          {/* Boton Denegar */}
          <TouchableOpacity
            className="bg-red-600 py-2 px-4 rounded-lg"
            onPress={() => console.log('Denegar')}
          >
            <Text className="text-white font-medium">Cancelar</Text>
          </TouchableOpacity>

        </View>
      </View>
    </GlobalBackground>
  );
}