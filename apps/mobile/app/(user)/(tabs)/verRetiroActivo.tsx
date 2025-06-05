//CANCELADO MANUAL EN TESTEO
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { router } from 'expo-router';

import GlobalBackground from '@/components/layout/GlobalBackground';
import { useAppContext } from '@/context/AppContext';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import AlertModal from '@/components/ui/alerts/AlertModal';
import { cancelActiveQrCode } from '@/services/withdrawals/parent';



export default function GenearQRScreen() {
  const { data } = useAppContext();
  const qrValue = data.currentQrCode;

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [redirectAfterClose, setRedirectAfterClose] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancelCode = async () => {
    if (!qrValue) return;

    console.log('Valor de qrValue que se enviará a cancelar:', qrValue);

    try {
      setLoading(true);
      await cancelActiveQrCode(qrValue);
      setModalTitle('Éxito');
      setModalMessage('El código QR fue cancelado correctamente.');
      setRedirectAfterClose(true);
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'No se pudo cancelar el código QR.');
      setRedirectAfterClose(false);
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    if (redirectAfterClose) {
      router.push('/historialRetiros');
    }
  };

  return (
    <GlobalBackground>
      <View className="flex-1 items-center justify-center px-4">
        {/* Título */}
        <Text className="text-2xl font-bold text-blue-700 mb-3">Código QR para retiro</Text>

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
            <QRCode value={qrValue.toString()} size={300} />
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

        {/* Botones */}
        <View className="w-full px-4 mt-6">
          <View className="max-w-[320px] w-full mx-auto flex-row justify-center space-x-4">
            <SecondaryButton
              title="Volver"
              onPress={() => router.push('/historialRetiros')}
              disabled={loading}
            />
            <PrimaryButton
              title="Cancelar código"
              onPress={handleCancelCode}
              disabled={!qrValue || loading}
            />
          </View>
        </View>

        {/* Modal de alerta */}
        <AlertModal
          visible={modalVisible}
          title={modalTitle}
          message={modalMessage}
          onClose={handleCloseModal}
        />
      </View>
    </GlobalBackground>
  );
}
