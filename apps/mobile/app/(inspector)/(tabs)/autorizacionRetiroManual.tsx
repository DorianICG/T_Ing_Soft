import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import PickupInfoCard from '@/components/ui/cards/PickupInfoCard';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import AlertModal from '@/components/ui/alerts/AlertModal';
import { router } from 'expo-router';
import { authorizeManualWithdrawal } from '@/services/withdrawals/inspector';

export default function ValidacionRetiroScreen() {
  const { data: pickupData, setData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Validación de datos completos
  if (
    !pickupData ||
    !pickupData.student ||
    !pickupData.authorizedParent ||
    !pickupData.withdrawalReason || // Cambié 'reason' por 'withdrawalReason'
    !pickupData.withdrawalReason.reasonName
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
    authorizedParent,
    withdrawalReason, // Asegúrate de acceder al campo correcto
  } = pickupData;

  // Mostrar el motivo o "OTRO (ESPECIFICAR)" si es necesario
  const displayedReason = withdrawalReason.reasonName.startsWith('OTRO') 
    ? `${withdrawalReason.reasonName} - ${withdrawalReason.customReason}` 
    : withdrawalReason.reasonName;

const handleAuthorization = async (status: string) => {
  const { student, withdrawalReason } = pickupData;

  // Se verifica si el studentId, reasonId y customReason existen
  if (!student?.id || !withdrawalReason?.reasonId) {
    setModalTitle('Error');
    setModalMessage('Faltan datos para autorizar el retiro.');
    setModalVisible(true);
    return;
  }

  // Determinar el valor de customReason
  const customReasonToSend = withdrawalReason.reasonName.startsWith('OTRO')
    ? withdrawalReason.customReason || ""  
    : withdrawalReason.reasonName;       

  // Set loading to true to disable buttons
  setLoading(true);

  // Llamada a la API para autorizar el retiro
  try {
    const response = await authorizeManualWithdrawal(
      student.id,  // studentId
      withdrawalReason.reasonId,  // reasonId
      customReasonToSend  // Aquí estamos usando el valor adecuado para customReason
    );

    // Respuesta exitosa
    setModalTitle(status === 'authorized' ? 'Autorización Exitosa' : 'Operación Cancelada');
    setModalMessage(status === 'authorized' ? 'El retiro ha sido autorizado correctamente, volviendo al menu principal.' : 'Se ha cancelado la operación, volviendo al menu principal.');
    setModalVisible(true);

  } catch (error) {
    // Manejo de errores
    console.error('Error al autorizar el retiro:', error);
    setModalTitle('Error');
    setModalMessage('Hubo un error al autorizar el retiro, volviendo al menu principal.');
    setModalVisible(true);
  } finally {
    
  }
};


// Redirigir al usuario a la pantalla de inicio después de cerrar el modal
  const handleModalClose = () => {
    router.push('/home'); 
    setLoading(false);
    setModalVisible(false); 
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
            {/* Mostrar el motivo de retiro */}
            <Text className="text-sm mb-2 text-center">
              <Text className="font-bold">Motivo:</Text> {displayedReason}
            </Text>

            {/* Información del estudiante */}
            <View className="mb-3">
              <Text className="text-sm font-bold mb-1 text-red-600">Estudiante</Text>
              <PickupInfoCard
                name={`${student.firstName} ${student.lastName}`}
                rut={student.rut}
                grade={student.course.name}
              />
            </View>

            {/* Información del delegado autorizado */}
            <View>
              <Text className="text-sm font-bold mb-1 text-red-600">Delegado</Text>
              <PickupInfoCard
                name={`${authorizedParent.firstName} ${authorizedParent.lastName}`}
                rut={authorizedParent.rut}
                phone={authorizedParent.phone || 'No disponible'}
              />
            </View>
          </ScrollView>
        </View>

        <Text className="text-xs text-gray-500 text-center mt-2"> (*) Solicitar autorización al operador para validar su identidad. </Text>

        <View className="mt-2 flex-row space-x-2">
          {/* Botón de autorizar */}
          <TouchableOpacity 
            className="bg-green-600 py-2 px-4 rounded-lg" 
            onPress={() => handleAuthorization('authorized')} 
            disabled={loading}  // Deshabilita el botón cuando está cargando
          >
            <Text className="text-white font-medium">Autorizar</Text>
          </TouchableOpacity>

          {/* Botón de denegar */}
          <TouchableOpacity 
            className="bg-red-600 py-2 px-4 rounded-lg" 
            onPress={() => handleAuthorization('denied')} 
            disabled={loading}  // Deshabilita el botón cuando está cargando
          >
            <Text className="text-white font-medium">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal de alerta */}
      <AlertModal
        visible={modalVisible}
        title={modalTitle || 'Resultado'}
        message={modalMessage || 'Operación exitosa'}
        onClose={handleModalClose}  // Redirige a /home cuando se cierra el modal
      />
    </GlobalBackground>
  );
}
