import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

import GlobalBackground from '@/components/layout/GlobalBackground';
import TextInputField from '@/components/ui/input/TextInputField';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import AlertModal from '@/components/ui/alerts/AlertModal';
import DatePicker from '@/components/ui/input/DatePicker';
import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton';
import { createStudent } from '@/services/CRUD/adminStudents';
import { getCourses } from '@/services/CRUD/adminCourses';

export default function CrudCreateStudentScreen() {
  const router = useRouter();

  const [rut, setRut] = useState('');
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
    // Validar campos obligatorios
    if (!rut || !firstName || !lastName || !courseId) {
      setModalTitle('Campos faltantes');
      setModalMessage('Por favor completa todos los campos obligatorios: RUT, Nombre, Apellido y Curso.');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      await createStudent({
        rut,
        firstName,
        lastName,
        birthDate: birthDate || null,
        courseId: courseId!,
        parentRut: parentRut || null,
      });

      setModalTitle('Éxito');
      setModalMessage('El estudiante se creó correctamente.');
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'Error al crear el estudiante.');
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
            <Text className="text-2xl font-bold text-blue-700 mb-3">Crear Estudiante</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Complete los campos para crear un nuevo estudiante.
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
                placeholder="Nombre del estudiante"
              />
              <TextInputField
                label="Apellido"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Apellido del estudiante"
              />

              <DatePicker
                label="Fecha de Nacimiento (opcional)"
                value={birthDate}
                onChange={setBirthDate}
              />

              <View className="w-full">
                <Text className="text-sm font-medium text-gray-600">Curso *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 mb-4">
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
                label="RUT del Apoderado (opcional)"
                value={parentRut}
                onChangeText={setParentRut}
              />

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
                      !courseId
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
