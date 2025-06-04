import React, { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

import { useAppContext } from '@/hooks/useAppContext';
import { useFiltersContext } from '@/context/FiltersContext';
import GlobalBackground from '@/components/layout/GlobalBackground';
import TextInputField from '@/components/ui/input/TextInputField';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';

export default function CrudCourseSearchScreen() {
  const router = useRouter();
  const { setFilters } = useFiltersContext();

  const [name, setName] = useState('');
  const [page, setPage] = useState('1');
  const [limit, setLimit] = useState('20');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Guardamos los filtros directamente en contexto filters
      setFilters({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        search: name,
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
            <Text className="text-2xl font-bold text-blue-700 mb-3">Buscar Curso</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Ingresa los filtros para buscar cursos
            </Text>

            <View className="space-y-4 w-full">
              <TextInputField
                label="Curso"
                value={name}
                onChangeText={setName}
                placeholder="Nombre del Curso"
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
                    disabled={loading || !name}
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
