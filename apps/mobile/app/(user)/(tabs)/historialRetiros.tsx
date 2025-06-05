import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Button,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import GlobalBackground from '@/components/layout/GlobalBackground';
import { fetchInspectorWithdrawalHistory } from '@/services/withdrawals/inspector';

import RoundedIconButton from '@/components/ui/buttons/IconButtonSimple';
import { useFiltersContext } from '@/context/FiltersContext';
import InspectorHistoryCard from '@/components/ui/cards/InspectorHistoryCard';

export default function HistorialRetirosInspector() {
  const { filters, setFilters } = useFiltersContext();

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Local states for filters inputs
  const [studentId, setStudentId] = useState<string>(filters.studentId?.toString() || '');
  const [studentRut, setStudentRut] = useState(filters.studentRut || '');
  const [status, setStatus] = useState(filters.status || '');
  const [method, setMethod] = useState(filters.method || '');
  const [approverId, setApproverId] = useState<string>(filters.approverId?.toString() || '');
  const [startDate, setStartDate] = useState<Date | null>(filters.startDate ? new Date(filters.startDate) : null);
  const [endDate, setEndDate] = useState<Date | null>(filters.endDate ? new Date(filters.endDate) : null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [limit, setLimit] = useState<string>(filters.limit?.toString() || '20');
  const [offset, setOffset] = useState<string>(filters.offset?.toString() || '0');

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          setLoading(true);
          const data = await fetchInspectorWithdrawalHistory(filters || {});
          if (isActive) {
            setWithdrawals(data.withdrawals);
          }
        } catch (error: any) {
          Alert.alert('Error', error.message || 'No se pudo cargar el historial');
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadData();
      return () => {
        isActive = false;
      };
    }, [filters])
  );

  const applyFilters = () => {
    setFilters({
      studentId: studentId ? Number(studentId) : undefined,
      studentRut: studentRut || undefined,
      status: status || undefined,
      method: method || undefined,
      approverId: approverId ? Number(approverId) : undefined,
      startDate: startDate ? startDate.toISOString().split('T')[0] : undefined,
      endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      limit: limit ? Number(limit) : 20,
      offset: offset ? Number(offset) : 0,
    });
  };

  return (
    <GlobalBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Historial de Retiros</Text>
        </View>

        {/* Filters section */}
        <ScrollView
          style={{ maxHeight: 280, marginBottom: 12 }}
          contentContainerStyle={{ paddingBottom: 10 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>ID Alumno:</Text>
            <TextInput
              style={styles.input}
              placeholder="ID alumno"
              keyboardType="numeric"
              value={studentId}
              onChangeText={setStudentId}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>RUT Alumno:</Text>
            <TextInput
              style={styles.input}
              placeholder="RUT alumno"
              value={studentRut}
              onChangeText={setStudentRut}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Estado:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: pending, approved, rejected"
              value={status}
              onChangeText={setStatus}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Método:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: QR, Manual"
              value={method}
              onChangeText={setMethod}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>ID Aprobador:</Text>
            <TextInput
              style={styles.input}
              placeholder="ID aprobador"
              keyboardType="numeric"
              value={approverId}
              onChangeText={setApproverId}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Fecha inicio:</Text>
            <Text style={styles.dateInput} onPress={() => setShowStartDatePicker(true)}>
              {startDate ? startDate.toISOString().split('T')[0] : 'Seleccionar fecha'}
            </Text>
            {showStartDatePicker && (
              <DateTimePicker
                value={startDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowStartDatePicker(false);
                  if (date) setStartDate(date);
                }}
                maximumDate={endDate || undefined}
              />
            )}
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Fecha fin:</Text>
            <Text style={styles.dateInput} onPress={() => setShowEndDatePicker(true)}>
              {endDate ? endDate.toISOString().split('T')[0] : 'Seleccionar fecha'}
            </Text>
            {showEndDatePicker && (
              <DateTimePicker
                value={endDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(_, date) => {
                  setShowEndDatePicker(false);
                  if (date) setEndDate(date);
                }}
                minimumDate={startDate || undefined}
              />
            )}
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Límite:</Text>
            <TextInput
              style={styles.input}
              placeholder="Cantidad máxima"
              keyboardType="numeric"
              value={limit}
              onChangeText={setLimit}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Offset:</Text>
            <TextInput
              style={styles.input}
              placeholder="Desplazamiento"
              keyboardType="numeric"
              value={offset}
              onChangeText={setOffset}
            />
          </View>

          <View style={{ marginTop: 12, marginBottom: 24 }}>
            <Button title="Aplicar filtros" onPress={applyFilters} />
          </View>
        </ScrollView>

        <View style={styles.content}>
          {loading ? (
            <ActivityIndicator size="large" color="#1D4ED8" />
          ) : withdrawals.length === 0 ? (
            <Text style={styles.empty}>No hay retiros registrados.</Text>
          ) : (
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {withdrawals.map((w) => (
                <InspectorHistoryCard
                  key={w.id}
                  student={`${w.student.name} (${w.student.courseName})`}
                  dateTime={w.withdrawalTime}
                  validator={w.approver?.name || 'Desconocido'}
                  method={w.method}
                  status={w.status}
                  customReason={w.customReason}
                />
              ))}
            </ScrollView>
          )}
        </View>

        <View style={styles.footer}>
          <RoundedIconButton
            icon="search-outline"
            onPress={() => router.push('/seleccionHistorialRetiros')}
          />
          <Text style={styles.buttonText}>Buscar Retiro</Text>
        </View>
      </View>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D4ED8',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterLabel: {
    width: 110,
    fontWeight: '600',
    color: '#4B5563',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  dateInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    color: '#374151',
  },
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: '#6B7280',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    alignItems: 'center',
  },
  buttonText: {
    marginTop: 4,
    color: '#1D4ED8',
  },
});
