// @/components/ui/cards/infoRetiroCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  fechaHora: string;
  autorizacionPor: string;
  tipoValidacion: string;
  estudiante: string;
  delegado: string;
  motivoRetiro: string;
}

export default function InfoRetiroCard({
  fechaHora,
  autorizacionPor,
  tipoValidacion,
  estudiante,
  delegado,
  motivoRetiro,
}: Props) {
  return (
    <View className="bg-gray-200 border border-gray-400 rounded-lg p-4 mb-4 w-full">
      {/* Título */}
      <Text className="font-semibold text-gray-800 mb-2">Información del retiro</Text>

      {/* Detalles */}
      <Text className="text-sm text-red-600">Fecha de retiro: {fechaHora}</Text>
      <Text className="text-sm text-red-600">Autorización por: {autorizacionPor}</Text>
      <Text className="text-sm text-red-600">Tipo de validación: {tipoValidacion}</Text>
      <Text className="text-sm text-black-600">Estudiante: {estudiante}</Text>
      <Text className="text-sm text-black-600">Delegado: {delegado}</Text>
      <Text className="text-sm text-black-600">Motivo del retiro: {motivoRetiro}</Text>
    </View>
  );
}