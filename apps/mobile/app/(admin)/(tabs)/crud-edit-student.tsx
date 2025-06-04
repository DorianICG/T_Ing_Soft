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
import DatePicker from '@/components/ui/input/DatePicker';
import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton'; // componente para opciones seleccionables
import { updateStudent } from '@/services/CRUD/adminStudents';
import { getCourses } from '@/services/CRUD/adminCourses';



export default function CrudEditStudentScreen() {
  const router = useRouter();
  const { data } = useAppContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [courseId, setCourseId] = useState<number | null>(null);
  const [parentRut, setParentRut] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);

  // Cargar datos iniciales y cursos
  useEffect(() => {
    if (data) {
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setBirthDate(data.birthDate?.substring(0, 10) || '');
      setCourseId(data.course?.id || null);
      setParentRut(data.parent?.rut || '');
    }
  }, [data]);

useEffect(() => {
  const loadCourses = async () => {
    try {
      const json = await getCourses({ page: 1, limit: 50 });
      setCourses(json.courses || []);  
    } catch (error: any) {
      console.error('Error al cargar cursos:', error.message || error);
    }
  };
  loadCourses();
}, []);


  const handleSubmit = async () => {
    if (!firstName || !lastName || !birthDate || !courseId || !parentRut) {
      setModalTitle('Campos faltantes');
      setModalMessage('Por favor completa todos los campos obligatorios.');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      await updateStudent(data.id, {
        firstName,
        lastName,
        birthDate,
        courseId,
        parentRut,
      });

      setModalTitle('Éxito');
      setModalMessage('El estudiante se actualizó correctamente.');
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'Error al actualizar el estudiante.');
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
            <Text className="text-2xl font-bold text-blue-700 mb-3">Editar Estudiante</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Modifica los campos para actualizar la información del estudiante.
            </Text>

            <View className="space-y-4 w-full">
              <TextInputField
                label="Nombre"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Nombre del estudiante"
              />
              <TextInputField
                label="Apellido"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Apellido del estudiante"
              />
              <DatePicker
                label="Fecha de Nacimiento"
                value={birthDate}
                onChange={setBirthDate}
              />

              {/* Selector horizontal de cursos */}
              <View className="w-full">
                <Text className="text-sm font-medium text-gray-600">Curso</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-2 mb-4"
                >
                  {courses.length === 0 && (
                    <Text className="text-gray-400 italic mr-4">Cargando cursos...</Text>
                  )}
                  {courses.map((course) => (
                    <View key={course.id} className="mr-4">
                      <SelectOptionButton
                        label={course.name}
                        isSelected={courseId === course.id}
                        onPress={() => setCourseId(course.id)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>

              <TextInputField
                label="RUT del Apoderado"
                value={parentRut}
                onChangeText={setParentRut}
              />

              <View className="flex-row justify-between items-center p-4 w-full">
                <View className="w-1/3">
                  <SecondaryButton title="Cancelar" onPress={() => router.push('/crud')} />
                </View>
                <View className="w-1/3 ml-2">
                  <PrimaryButton
                    title={loading ? 'Guardando...' : 'Actualizar'}
                    onPress={handleSubmit}
                    disabled={loading}
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
