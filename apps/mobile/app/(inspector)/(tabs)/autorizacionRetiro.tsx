import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import PickupInfoCard from '@/components/ui/cards/PickupInfoCard';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { processQrDecision } from '@/services/withdrawals/inspector';
import AlertModal from '@/components/ui/alerts/AlertModal';
import { router } from 'expo-router';


export default function ValidacionRetiroScreen() {
  const { data: pickupData, setData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);  // Estado para el modal
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  if (
    !pickupData ||
    !pickupData.student ||
    !pickupData.parent ||
    !pickupData.reason ||
    !pickupData.qrCode
  ) {
    return (
      <GlobalBackground>
        <View className="flex-1 justify-center items-center">
          <Text>Ha ocurrido un error, intentelo más tarde.</Text>
        </View>
      </GlobalBackground>
    );
  }

  const {
    student,
    parent,
    reason,
    customReason,
    expiresAt,
    generatedAt,
    isExpired,
    qrCode,
  } = pickupData;

  const formattedExpiresAt = new Date(expiresAt).toLocaleString();
  const formattedGeneratedAt = new Date(generatedAt).toLocaleString();

  // Handler para tomar la decisión
  const handleDecision = async (action: 'APPROVE' | 'DENY') => {
    setLoading(true);
    try {
      const result = await processQrDecision(qrCode, action);
      setModalTitle('Resultado');
      setModalMessage(`Retiro ${action === 'APPROVE' ? 'aprobado' : 'denegado'} exitosamente`);
      setModalVisible(true);  // Mostrar el modal
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'Ocurrió un error al procesar la decisión, volviendo al menu principal');
      setModalVisible(true);  // Mostrar el modal
    } finally {
      setLoading(false);
    }
  };

  // Función para cerrar el modal, limpiar el contexto y navegar a /home
  const handleCloseModal = () => {
    setData(null);  // Limpiar el contexto
    setModalVisible(false);  // Cerrar el modal
    // Aquí se puede usar la navegación si estás usando React Navigation
    router.push('/home');
    // Si no usas React Navigation, puedes usar cualquier otra estrategia para navegar
  };

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">

        <Text className="text-xl font-bold text-blue-600 mb-4">Validación Retiro</Text>

        <View className="bg-white rounded-lg p-3 shadow-md w-full" style={{ maxHeight: 400 }}>
          <View className="items-center mb-1">
            <Ionicons name="warning" size={32} color="#facc15" />
          </View>

          <Text className="text-sm font-bold mb-2 text-center text-red-600">Información de retiro</Text>

          <ScrollView style={{ maxHeight: 350 }} contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={true}>
            <Text className="text-sm mb-1 text-center">
              <Text className="font-bold">Generado:</Text> {formattedGeneratedAt}
            </Text>
            <Text className="text-sm mb-1 text-center">
              <Text className="font-bold">Expira:</Text> {formattedExpiresAt} {isExpired && '(Expirado)'}
            </Text>

            <Text className="text-sm mb-2 text-center">
              <Text className="font-bold">Motivo:</Text> {reason.name} {reason.name === 'OTRO (ESPECIFICAR)' && `- ${customReason}`}
            </Text>

            <View className="mb-3">
              <Text className="text-sm font-bold mb-1 text-red-600">Estudiante</Text>
              <PickupInfoCard name={`${student.firstName} ${student.lastName}`} rut={student.rut} grade={student.courseName} />
            </View>

            <View>
              <Text className="text-sm font-bold mb-1 text-red-600">Delegado</Text>
              <PickupInfoCard name={`${parent.firstName} ${parent.lastName}`} rut={parent.rut} phone={parent.phone || 'No disponible'} relation={parent.relationship} />
            </View>
          </ScrollView>
        </View>

        <Text className="text-xs text-gray-500 text-center mt-2"> (*) Solicitar autorización al operador para validar su identidad. </Text>

        <View className="mt-2 flex-row space-x-2">
          <TouchableOpacity className="bg-green-600 py-2 px-4 rounded-lg" onPress={() => handleDecision('APPROVE')} disabled={loading}>
            <Text className="text-white font-medium">Autorizar</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-red-600 py-2 px-4 rounded-lg" onPress={() => handleDecision('DENY')} disabled={loading}>
            <Text className="text-white font-medium">Denegar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de alerta */}
      <AlertModal visible={modalVisible} title={modalTitle} message={modalMessage} onClose={handleCloseModal} />
    </GlobalBackground>
  );
}
