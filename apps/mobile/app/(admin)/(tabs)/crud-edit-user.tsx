import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppContext } from '@/hooks/useAppContext';
import GlobalBackground from '@/components/layout/GlobalBackground';
import TextInputField from '@/components/ui/input/TextInputField';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import AlertModal from '@/components/ui/alerts/AlertModal';
import { updateUser } from '@/services/CRUD/adminUsers';
import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton';
import SwitchToggle from '@/components/ui/input/SwitchToggle'; // 👉 Asegúrate que este componente exista

export default function CrudEditStudentScreen() {
  const router = useRouter();
  const { data } = useAppContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [roleName, setRoleName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setIsActive(data.isActive ?? true);
      setRoleName(data.roles?.[0]?.name || '');
    }
  }, [data]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateUser(data.id, {
        firstName,
        lastName,
        email,
        phone,
        isActive,
        roleName,
        organizationId: data.organization?.id,
      });
      setModalTitle('Éxito');
      setModalMessage('El usuario se actualizó correctamente.');
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'Error al actualizar el usuario');
    } finally {
      setLoading(false);
      setModalVisible(true);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalTitle === 'Éxito') {
      router.push('/crud');
    }
  };

  return (
    <GlobalBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-start px-5 py-8">
            <Text className="text-2xl font-bold text-blue-700 mb-3">Editar Usuario</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Modifique los campos que desee para editar el usuario
            </Text>

            <View className="space-y-4 w-full">
              <TextInputField
                label="Nombre"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Nombre del usuario"
              />
              <TextInputField
                label="Apellido"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Apellido del usuario"
              />
              <TextInputField
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="ejemplo@email.com"
              />
              <TextInputField
                label="Teléfono"
                value={phone}
                onChangeText={setPhone}
                placeholder="123456789"
              />

              {/* Toggle Activo/Inactivo */}
              <SwitchToggle
                label="Usuario Activo"
                value={isActive}
                onValueChange={setIsActive}
              />

              <View className="w-full">
                <Text className="text-sm font-medium text-gray-600">Rol</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 mb-4">
                  {['PARENT', 'INSPECTOR'].map((role) => (
                    <View key={role} className="mr-4">
                      <SelectOptionButton
                        label={role}
                        isSelected={roleName === role}
                        onPress={() => setRoleName(role)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-row justify-between items-center p-4 w-full">
                <View className="w-1/3">
                  <SecondaryButton title="Cancelar" onPress={() => router.push('/crud')} />
                </View>
                <View className="w-1/3 ml-2">
                  <PrimaryButton
                    title={loading ? 'Guardando...' : 'Actualizar'}
                    onPress={handleSubmit}
                    disabled={loading || !firstName || !lastName || !email}
                  />
                </View>
              </View>
            </View>

            <AlertModal
              visible={modalVisible}
              title={modalTitle}
              message={modalMessage}
              onClose={handleModalClose}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlobalBackground>
  );
}
