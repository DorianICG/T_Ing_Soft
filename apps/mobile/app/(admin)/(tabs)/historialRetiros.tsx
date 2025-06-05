import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { router, useFocusEffect } from 'expo-router';

import GlobalBackground from '@/components/layout/GlobalBackground';
import { fetchInspectorWithdrawalHistory } from '@/services/withdrawals/inspector';


import RoundedIconButton from '@/components/ui/buttons/IconButtonSimple';
import { useFiltersContext } from '@/context/FiltersContext';
import InspectorHistoryCard from '@/components/ui/cards/InspectorHistoryCard';

export default function HistorialRetirosInspector() {
  const { filters } = useFiltersContext();

  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <GlobalBackground>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Historial de Retiros</Text>
        </View>

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
  content: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  buttonText: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
});
