import GlobalBackground from '@/components/layout/GlobalBackground';
import React from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';



export default function GenearQRScreen() { 

  const QRvalue = 'https://youtu.be/dQw4w9WgXcQ?si=McftVXD4CvCCgRRC'; //VALOR DE TESTEO!!

return (
  <GlobalBackground>
    {/*Contenedor Vista*/}
    <View className="flex-1 items-center justify-center">
      <Text className="text-2xl font-bold text-blue-700 mb-3">Codigo QR para retiro</Text>

      {/*Contenedor Cuadrado Gris*/}
      <View
      style={{
        backgroundColor: '#e0e0e0', // gris claro
        padding: 20,
        borderRadius: 10,
      }}>
      <QRCode value={QRvalue} size={300} />
      </View>

      <Text className="text-xs text-gray-500 text-center mt-2">
        (*) Este código es válido solo por un retiro
      </Text>

      <Text className="text-xs text-gray-500 text-center mt-2">
        (*) Código valido hasta las 18:00 horas
      </Text>

    </View>
  </GlobalBackground>
);
}