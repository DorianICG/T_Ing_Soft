import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

import { useFiltersContext } from '@/context/FiltersContext';
import GlobalBackground from '@/components/layout/GlobalBackground';
import TextInputField from '@/components/ui/input/TextInputField';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import SwitchToggle from '@/components/ui/input/SwitchToggle';
import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton';
import { getCourses } from '@/services/CRUD/adminCourses';

export default function CrudStudentSearchScreen() {
  const router = useRouter();
  const { setFilters } = useFiltersContext();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState('1');
  const [limit, setLimit] = useState('20');
  const [courseId, setCourseId] = useState<number | null>(null);
  const [hasParent, setHasParent] = useState(false);
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

  const handleSearch = async () => {
    setLoading(true);
    try {
      setFilters({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        search: search || undefined,
        courseId: courseId === null ? undefined : courseId, // undefined para desactivar filtro
        hasParent: hasParent,
      });

      router.push('/crud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-start px-5 py-8">
            <Text className="text-2xl font-bold text-blue-700 mb-3">Buscar Estudiantes</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Ingresa los filtros para buscar estudiantes
            </Text>

            <View className="space-y-4 w-full">
              <TextInputField
                label="Nombre, Apellido o RUT"
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar Alumno..."
              />

              {/* Selector horizontal de cursos con opción "Todos" */}
              <View className="w-full">
                <Text className="text-sm font-medium text-gray-600">Curso</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-2 mb-4"
                >
                  {/* Opción "Todos" para no filtrar */}
                  <View key="all" className="mr-4">
                    <SelectOptionButton
                      label="Todos"
                      isSelected={courseId === null}
                      onPress={() => setCourseId(null)}
                    />
                  </View>

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

              <SwitchToggle
                label="Tiene Apoderado"
                value={hasParent}
                onValueChange={setHasParent}
              />

              <TextInputField
                label="Página"
                value={page}
                onChangeText={setPage}
                placeholder="1"
                keyboardType="numeric"
              />
              <TextInputField
                label="Límite"
                value={limit}
                onChangeText={setLimit}
                placeholder="20"
                keyboardType="numeric"
              />

              <View className="flex-row justify-between items-center p-4 w-full">
                <View className="w-1/3">
                  <SecondaryButton title="Cancelar" onPress={() => router.push('/crud')} />
                </View>
                <View className="w-1/3 ml-2">
                  <PrimaryButton
                    title={loading ? 'Buscando...' : 'Buscar'}
                    onPress={handleSearch}
                    disabled={loading}
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlobalBackground>
  );
}
