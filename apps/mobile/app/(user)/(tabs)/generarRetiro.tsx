import React, { useState, useCallback } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useFocusEffect, router } from 'expo-router';

import GlobalBackground from '@/components/layout/GlobalBackground';
import { useAppContext } from '@/context/AppContext';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { generateQrCode, resendActiveQrCode } from '@/services/withdrawals/parent';

export default function GenearQRScreen() {
  const { data } = useAppContext(); // Accede a datos globales como alumno y razón seleccionados

  // Estados del componente
  const [qrValue, setQrValue] = useState<string | null>(null); // Guarda el valor del código QR
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState<string | null>(null); // Mensaje de error
  const [reenviado, setReenviado] = useState(false); // Indica si se reenvió un QR activo

  // Hook que se activa cada vez que esta pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // Flag para evitar actualizar estado después de desmontar

      const generate = async () => {
        // Reiniciar estados al entrar en la pantalla
        setLoading(true);
        setError(null);
        setQrValue(null);
        setReenviado(false);

        // Validar si hay datos suficientes para generar el QR
        if (!data.alumnoSeleccionado || !data.razonSeleccionada) {
          setError('Datos incompletos para generar el código QR');
          setLoading(false);
          return;
        }

        try {
          // Llamada al servicio para generar un nuevo código QR
          const qrData = await generateQrCode(
            data.alumnoSeleccionado.id,
            data.razonSeleccionada.id,
            data.razonSeleccionada.descripcion
          );

          // Validar la respuesta
          if (!qrData?.qrCode) throw new Error('Respuesta inválida del servidor');

          // Si todo fue bien, mostrar el nuevo código QR
          if (isActive) {
            setQrValue(qrData.qrCode);
            setReenviado(false);
          }
        } catch (err: any) {
          const message = err?.message || 'Error al generar el código QR.';

          // Si ya existe un QR activo, intenta reenviarlo
          if (message.includes('Ya existe un código QR activo')) {
            try {
              const activeQr = await resendActiveQrCode(data.alumnoSeleccionado.id);

              if (activeQr?.qrCode && isActive) {
                setQrValue(activeQr.qrCode); // Mostrar QR reenviado
                setReenviado(true);
                setError(null);
              } else {
                setError('No se pudo obtener el QR activo.');
              }
            } catch (resendErr: any) {
              setError(resendErr.message || 'Error al reenviar el código QR.');
            }
          } else {
            // Otro tipo de error
            setError(message);
          }
        } finally {
          // Finalizar estado de carga si el componente sigue montado
          if (isActive) setLoading(false);
        }
      };

      // Ejecutar generación de QR
      generate();

      // Cleanup: reiniciar estados al salir de la pantalla
      return () => {
        isActive = false;
        setQrValue(null);
        setError(null);
        setLoading(true);
        setReenviado(false);
      };
    }, [data])
  );

  // Renderizado del componente
  return (
    <GlobalBackground>
      <View className="flex-1 items-center justify-center px-4">
        {/* Título */}
        <Text className="text-2xl font-bold text-blue-700 mb-3">Código QR para retiro</Text>

        {/* Cargando, error o contenido */}
        {loading ? (
          <ActivityIndicator size="large" color="#1E3A8A" />
        ) : error ? (
          <Text className="text-red-600 text-center mb-4">{error}</Text>
        ) : (
          <>
            {/* Aviso si el código fue reenviado */}
            {reenviado && (
              <Text className="text-yellow-600 text-center mb-2 font-semibold">
                Ya existe un código QR activo. Se ha reenviado el QR vigente.
              </Text>
            )}

            {/* Contenedor del código QR */}
            <View
              style={{
                backgroundColor: '#e0e0e0',
                padding: 20,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {qrValue ? (
                <QRCode value={qrValue} size={300} />
              ) : (
                <Text style={{ color: 'red' }}>
                  No hay código QR para mostrar.
                </Text>
              )}
            </View>

            {/* Información adicional */}
            <Text className="text-xs text-gray-500 text-center mt-2">
              (*) Este código es válido solo por un retiro
            </Text>
            <Text className="text-xs text-gray-500 text-center mt-2">
              (*) Código válido hasta las 18:00 horas
            </Text>
          </>
        )}

        {/* Botón de finalizar */}
        <View className="w-full px-4 mt-6">
          <View className="max-w-[320px] w-full mx-auto">
            <PrimaryButton
              title="Finalizar"
              onPress={() => router.push('/home')}
              disabled={loading}
            />
          </View>
        </View>
      </View>
    </GlobalBackground>
  );
}
