import React, { useState } from 'react';
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

export default function CrudUserSearchScreen() {
  const router = useRouter();
  const { setFilters } = useFiltersContext();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState('1');
  const [limit, setLimit] = useState('20');
  const [role, setRole] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string>(''); // ID como texto para input
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);

const roles = ['null', 'PARENT', 'INSPECTOR', 'ADMIN']; 


const roleLabels: Record<string, string> = {
  null: 'Todos',
  PARENT: 'Padre',
  INSPECTOR: 'Inspector',
  ADMIN: 'Administrador',
};


  const handleSearch = async () => {
    setLoading(true);
    try {
      setFilters({
        page: Number(page) || 1,
        limit: Number(limit) || 20,
        search: search || undefined,
        role: role || undefined,
        organizationId: organizationId ? Number(organizationId) : undefined,
        isActive,
      });

      router.push('/crud'); // Ajusta según tu ruta
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-start px-5 py-8">
            <Text className="text-2xl font-bold text-blue-700 mb-3">Buscar Usuarios</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">
              Ingresa los filtros para buscar usuarios
            </Text>

            <View className="space-y-4 w-full">
              <TextInputField
                label="Nombre, Apellido o RUT"
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar usuario..."
              />

              {/* Selector horizontal de roles */}
              <View className="w-full">
                <Text className="text-sm font-medium text-gray-600">Rol</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-2 mb-4"
                >
                    {roles.map((r) => (
                    <View key={r ?? 'none'} className="mr-4">
                        <SelectOptionButton
                        label={roleLabels[r]}
                        isSelected={(role ?? 'null') === r}
                        onPress={() => setRole(r === 'null' ? null : r)}
                        />

                    </View>
                    ))}

                </ScrollView>
              </View>



              <SwitchToggle
                label="Activo"
                value={isActive}
                onValueChange={setIsActive}
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
