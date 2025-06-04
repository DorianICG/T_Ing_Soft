import React from 'react';
import { View, Text, Image } from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';
import InfoRetiroCard from '@/components/ui/cards/infoRetiroCard'; // Importa las cards personalizadas

export default function HistorialRetirosScreen() {
  const historialRetiros = [
    {
      fechaHora: '24/04/2025 Hora: 10:25 am',
      autorizacionPor: 'Inspector Ernesto Olivares',
      tipoValidacion: 'QR',
      estudiante: 'Camilo Andrés Rubilar Yaber',
      delegado: 'Jane Marie Doe',
      motivoRetiro: 'Retiro normal',
    },
    {
      fechaHora: '24/04/2025 Hora: 11:15 am',
      autorizacionPor: 'Inspector Ernesto Olivares',
      tipoValidacion: 'QR',
      estudiante: 'David Ignacio Rubilar Yaber',
      delegado: 'María López',
      motivoRetiro: 'Retiro por resfriado/malestar',
    },
  ];

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5">
        {/* Header Section */}
        <View className="flex-row items-center mb-6">
          <Text className="text-2xl font-bold text-white mr-2">John Doe</Text>
          <Image
            source={{ uri: 'https://via.placeholder.com/80'  }}
            className="w-20 h-20 rounded-full"
          />
        </View>

        {/* Title */}
        <Text className="text-xl font-bold text-blue-600 mb-4">Historial de retiros</Text>

        {/* Retiro Information Cards */}
        {historialRetiros.map((retiro, index) => (
          <InfoRetiroCard
            key={index}
            fechaHora={retiro.fechaHora}
            autorizacionPor={retiro.autorizacionPor}
            tipoValidacion={retiro.tipoValidacion}
            estudiante={retiro.estudiante}
            delegado={retiro.delegado}
            motivoRetiro={retiro.motivoRetiro}
          />
        ))}
      </View>
    </GlobalBackground>
  );
}