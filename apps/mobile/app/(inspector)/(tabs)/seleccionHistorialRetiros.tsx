import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import GlobalBackground from '@/components/layout/GlobalBackground';
import TextInputField from '@/components/ui/input/TextInputField';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import SwitchToggle from '@/components/ui/input/SwitchToggle';
import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton';
import { fetchParentStudents } from '@/services/withdrawals/parent';
import { useFiltersContext } from '@/context/FiltersContext';

const STATUS_OPTIONS = ['APPROVED', 'DENIED'];
const METHOD_OPTIONS = ['QR', 'MANUAL'];

export default function WithdrawalHistoryFiltersScreen() {
  const router = useRouter();
  const { setFilters } = useFiltersContext();

  const [students, setStudents] = useState<{ id: number; firstName: string; lastName: string }[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const [studentRut, setStudentRut] = useState<string>('');
  const [status, setStatus] = useState<string | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [approverId, setApproverId] = useState<string>(''); // string para input controlado
  const [startDate, setStartDate] = useState<string>(''); // formato 'YYYY-MM-DD'
  const [endDate, setEndDate] = useState<string>('');

  const [limit, setLimit] = useState<string>('20');
  const [offset, setOffset] = useState<string>('0');
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const data = await fetchParentStudents();
        setStudents(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudieron cargar los estudiantes');
      } finally {
        setLoadingStudents(false);
      }
    };
    loadStudents();
  }, []);

  const handleApplyFilters = () => {
    setLoading(true);
    try {
      setFilters({
        studentId: selectedStudentId === null ? undefined : selectedStudentId,
        studentRut: studentRut.trim() || undefined,
        status: status || undefined,
        method: method || undefined,
        approverId: approverId ? Number(approverId) : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: Number(limit) || 20,
        offset: Number(offset) || 0,
      });
      router.push('/historialRetiros');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlobalBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ flexGrow: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1D4ED8', marginBottom: 8 }}>
              Filtros Historial de Retiros
            </Text>
            <Text style={{ color: '#6B7280', marginBottom: 20, textAlign: 'center' }}>
              Ingresa los filtros para obtener el historial de retiros
            </Text>



            {/* Nuevo input studentRut */}
            <TextInputField
              label="RUT del Alumno"
              value={studentRut}
              onChangeText={setStudentRut}
              placeholder="Ej: 12345678-9"
              keyboardType="default"
            />

            {/* Selector de status */}
            <View style={{ marginVertical: 16 }}>
              <Text style={{ fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Estado</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ marginRight: 16 }}>
                  <SelectOptionButton
                    label="Todos"
                    isSelected={status === null}
                    onPress={() => setStatus(null)}
                  />
                </View>
                {STATUS_OPTIONS.map((opt) => (
                  <View key={opt} style={{ marginRight: 16 }}>
                    <SelectOptionButton
                      label={opt}
                      isSelected={status === opt}
                      onPress={() => setStatus(opt)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Selector de method */}
            <View style={{ marginVertical: 16 }}>
              <Text style={{ fontWeight: '600', color: '#4B5563', marginBottom: 8 }}>Método</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ marginRight: 16 }}>
                  <SelectOptionButton
                    label="Todos"
                    isSelected={method === null}
                    onPress={() => setMethod(null)}
                  />
                </View>
                {METHOD_OPTIONS.map((opt) => (
                  <View key={opt} style={{ marginRight: 16 }}>
                    <SelectOptionButton
                      label={opt}
                      isSelected={method === opt}
                      onPress={() => setMethod(opt)}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Input approverId UTILIZABLE SOLO POR EL ADMIN
            <TextInputField
              label="ID del Inspector"
              value={approverId}
              onChangeText={setApproverId}
              placeholder="Número de ID del inspector"
              keyboardType="numeric"
            /> */}

            {/* Input fechas */}
            <TextInputField
              label="Fecha Inicio (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="Ej: 2023-01-01"
              keyboardType="default"
            />

            <TextInputField
              label="Fecha Fin (YYYY-MM-DD)"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="Ej: 2023-12-31"
              keyboardType="default"
            />

            {/* Limite y offset */}
            <TextInputField
              label="Límite"
              value={limit}
              onChangeText={setLimit}
              placeholder="Cantidad máxima de resultados"
              keyboardType="numeric"
            />

            <TextInputField
              label="Paginación"
              value={offset}
              onChangeText={setOffset}
              placeholder="Desplazamiento para paginación"
              keyboardType="numeric"
            />



            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 32 }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <SecondaryButton title="Cancelar" onPress={() => router.push('/historialRetiros')} />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <PrimaryButton
                  title={loading ? 'Aplicando...' : 'Aplicar Filtros'}
                  onPress={handleApplyFilters}
                  disabled={loading}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GlobalBackground>
  );
}
