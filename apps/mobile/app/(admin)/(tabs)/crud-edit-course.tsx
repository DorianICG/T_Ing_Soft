import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';  // <- import router para navegación
import { useAppContext } from '@/hooks/useAppContext';


import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import GlobalBackground from '@/components/layout/GlobalBackground';
import TextInputField from '@/components/ui/input/TextInputField';
import { updateCourse } from '@/services/CRUD/adminCourses';
import AlertModal from '@/components/ui/alerts/AlertModal';



export default function CrudEditCourseScreen() {
  const router = useRouter();

  const { data } = useAppContext();

  const [nombreCurso, setNombreCurso] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data?.name) setNombreCurso(data.name);
  }, [data]);

  const handleContinue = async () => {
    if (!nombreCurso) return;

    setLoading(true);
    try {
      await updateCourse(data.id, { name: nombreCurso }); // solo enviar nombre
      setModalTitle('Éxito');
      setModalMessage('El curso se actualizó correctamente.');
      setModalVisible(true);
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'Error al actualizar el curso');
      setModalVisible(true);
    } finally {
      setLoading(false);
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
            <Text className="text-2xl font-bold text-blue-700 mb-3">Editar Curso</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Modifique los campos que desee para editar el curso
            </Text>

            <View className="space-y-4 w-full">
              <TextInputField
                label="Nombre del Curso"
                value={nombreCurso}
                onChangeText={setNombreCurso}
                placeholder="Nombre del curso"
              />

              <View className="flex-row justify-between items-center p-4 w-full">
                <View className="w-1/3">
                  <SecondaryButton
                    title="Cancelar"
                    onPress={() => {
                      router.push('/crud');
                    }}
                  />
                </View>
                <View className="w-1/3 ml-2">
                  <PrimaryButton
                    title={loading ? 'Guardando...' : 'Actualizar'}
                    onPress={handleContinue}
                    disabled={!nombreCurso || loading}
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
