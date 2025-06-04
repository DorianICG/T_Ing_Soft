import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

import GlobalBackground from '@/components/layout/GlobalBackground';
import TextInputField from '@/components/ui/input/TextInputField';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import AlertModal from '@/components/ui/alerts/AlertModal';
import { createUser } from '@/services/CRUD/adminUsers';
import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton';

export default function CrudCreateUserScreen() {
  const router = useRouter();

  const [rut, setRut] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [roleName, setRoleName] = useState('');
  const [isActive] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const roles = ['PARENT', 'INSPECTOR'];

const handleSubmit = async () => {
  setLoading(true);
  try {
    await createUser({
      rut,
      firstName,
      lastName,
      email,
      phone,
      password,
      roleName,
      isActive,
    });
    setModalTitle('Éxito');
    setModalMessage('El usuario se creó correctamente.');
  } catch (error: any) {
    // Aquí verificamos si error.errors existe y es un array
    if (error.errors && Array.isArray(error.errors)) {
      // Unimos todos los mensajes en un solo string, separado por salto de línea
      const messages = error.errors.map((e: any) => e.message).join('\n');
      setModalTitle('Error');
      setModalMessage(messages);
    } else {
      // Si no viene ese formato, mostramos un mensaje genérico o el mensaje del error
      setModalTitle('Error');
      setModalMessage(error.message || 'Error al crear el usuario');
    }
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
            <Text className="text-2xl font-bold text-blue-700 mb-3">Crear Usuario</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Complete los campos para crear un nuevo usuario
            </Text>

            <View className="space-y-4 w-full">
              <TextInputField
                label="RUT"
                value={rut}
                onChangeText={setRut}
                placeholder="Ej: 12345678-9"
              />
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
              <TextInputField
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="Ingrese una contraseña"
                secureTextEntry
              />
            <Text className="text-xs text-gray-500  mt-2">
                (*) La contraseña debe tener entre 8-16 caracteres, incluir mayúscula, minúscula, número y símbolo (@$!%*?&)
            </Text>

              <View className="w-full">
                <Text className="text-sm font-medium text-gray-600">Rol</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 mb-4">
                  {roles.map((role) => (
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

              {/* Botones */}
              <View className="flex-row justify-between items-center p-4 w-full">
                <View className="w-1/3">
                  <SecondaryButton title="Cancelar" onPress={() => router.push('/crud')} disabled={loading} />
                </View>
                <View className="w-1/3 ml-2">
                  <PrimaryButton
                    title={loading ? 'Creando...' : 'Crear'}
                    onPress={handleSubmit}
                    disabled={
                      loading ||
                      !rut ||
                      !firstName ||
                      !lastName ||
                      !password ||
                      !roleName
                    }
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
