import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';  // <-- Importa el hook

import AuthBackground from '@/components/layout/AuthBackground';
import { Ionicons } from '@expo/vector-icons'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import PasswordInput from '@/components/ui/input/PasswordInput';

import { changeUserPassword } from '@/services/controllers/user';
import AlertModal from '@/components/ui/alerts/AlertModal';
import GlobalBackground from '@/components/layout/GlobalBackground';

export default function ChangePasswordScreen() { 
  const router = useRouter();  // <-- Inicializa router

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const showModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  // Handler para confirmar cambio
  const handleConfirmPress = async () => {
    if (newPassword !== confirmPassword) {
      showModal('Error', 'La nueva contraseña y su confirmación no coinciden');
      return;
    }

    setLoading(true);
    try {
      const message = await changeUserPassword({ currentPassword, newPassword, confirmPassword });
      showModal('Éxito', message);
      // Aquí esperamos a que el usuario cierre el modal para navegar, por eso no navegamos aquí directamente
    } catch (error: any) {
      showModal('Error', error.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  // Cuando se cierra el modal de éxito, navegamos a perfil
  const handleModalClose = () => {
    setModalVisible(false);

    // Si el modal fue de éxito, redirigimos a perfil
    if (modalTitle === 'Éxito') {
      router.push('/perfil');
    }
  };

  // Handler para cancelar: limpia y redirige inmediatamente
  const handleCancelPress = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    router.push('/perfil');
  };

  const isFormValid =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length > 0 &&
    confirmPassword.trim().length > 0 &&
    newPassword === confirmPassword;

  return (
    <GlobalBackground>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Título */}
        <Text className="text-3xl font-bold text-center text-gray-900 mb-4">
          Cambiar Contraseña
        </Text>

        {/* Descripción */}
        <Text className="text-base text-gray-600 text-center mb-8">
          Para actualizar su contraseña, ingrese su contraseña actual y luego la nueva.
        </Text>

        {/* Contraseña actual */}
        <View className="mb-6 w-full max-w-[340px]">
          <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">Contraseña actual</Text>
          <PasswordInput
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Ingrese su contraseña actual"
            className="bg-white p-4 rounded-lg border border-gray-200"
          />
        </View>

        {/* Nueva contraseña */}
        <View className="mb-6 w-full max-w-[340px]">
          <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">Nueva contraseña</Text>
          <PasswordInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Ingrese su contraseña nueva"
            className="bg-white p-4 rounded-lg border border-gray-200"
          />
        </View>

        {/* Confirmar contraseña */}
        <View className="mb-6 w-full max-w-[340px]">
          <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">Confirmar contraseña</Text>
          <PasswordInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Ingrese nuevamente"
            className="bg-white p-4 rounded-lg border border-gray-200"
          />
        </View>

        {/* Botones */}
        <View className="flex-row w-full max-w-[340px] justify-between">
          <View className="w-[48%]">
            <SecondaryButton title="Cancelar" onPress={handleCancelPress} disabled={loading} />
          </View>
          <View className="w-[48%]">
            <PrimaryButton
              title={loading ? 'Guardando...' : 'Confirmar'}
              onPress={handleConfirmPress}
              disabled={!isFormValid || loading}
            />
          </View>
        </View>

        {/* Modal */}
        <AlertModal
          visible={modalVisible}
          title={modalTitle}
          message={modalMessage}
          onClose={handleModalClose}
        />
      </ScrollView>
    </GlobalBackground>
  );
}
