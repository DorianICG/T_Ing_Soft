import GlobalBackground from '@/components/layout/GlobalBackground';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import React, { useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { router } from 'expo-router';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';


export default function GenearQRScreen() { 
  const { data } = useAppContext(); //Recepcion de datos

  // Construccion del QR (usa datos del contexto: data)
  const QRvalue = data.alumnoSeleccionado && data.delegadoSeleccionado
    ? `${data.alumnoSeleccionado.id};${data.delegadoSeleccionado.id}`
    : 'Datos incompletos para generar QR';

    //DEBUG CONSOLA
  useEffect(() => {
    if (data.alumnoSeleccionado && data.delegadoSeleccionado) {
      console.log('Alumno seleccionado:', data.alumnoSeleccionado.nombre);
      console.log('Delegado seleccionado:', data.delegadoSeleccionado.nombre);
    }
  }, [data]);

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

      {/* Botón Finalizar */}
      <View className="w-full px-4">
        <View className="max-w-[320px] w-full mx-auto">
            <PrimaryButton
              title="Finalizar"
              onPress={() => {
                router.push('/home'); // Reemplaza '/confirmacion' con la ruta deseada
              }}
            />
        </View>
      </View>

    </View>
  </GlobalBackground>
);
}