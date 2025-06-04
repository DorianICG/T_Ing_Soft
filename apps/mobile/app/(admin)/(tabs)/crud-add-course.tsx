import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

import GlobalBackground from '@/components/layout/GlobalBackground';
import TextInputField from '@/components/ui/input/TextInputField';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import AlertModal from '@/components/ui/alerts/AlertModal';

import { createCourse } from '@/services/CRUD/adminCourses';

export default function CrudCreateCourseScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setModalTitle('Campo faltante');
      setModalMessage('Por favor ingresa el nombre del curso.');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      await createCourse({ name: name.trim() });

      setModalTitle('Éxito');
      setModalMessage('El curso se creó correctamente.');
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'Error al crear el curso.');
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
            <Text className="text-2xl font-bold text-blue-700 mb-3">Crear Curso</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Ingresa el nombre para el nuevo curso.
            </Text>

            <View className="space-y-4 w-full">
              <TextInputField
                label="Nombre del curso"
                value={name}
                onChangeText={setName}
                placeholder="Ej: 1º Básico"
              />

              <View className="flex-row justify-between items-center p-4 w-full">
                <View className="w-1/3">
                  <SecondaryButton
                    title="Cancelar"
                    onPress={() => router.push('/crud')}
                    disabled={loading}
                  />
                </View>
                <View className="w-1/3 ml-2">
                  <PrimaryButton
                    title={loading ? 'Creando...' : 'Crear'}
                    onPress={handleSubmit}
                    disabled={loading || !name.trim()}
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
