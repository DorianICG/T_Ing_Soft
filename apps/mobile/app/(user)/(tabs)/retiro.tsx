import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';

import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

import { useAppContext } from '@/context/AppContext';
import { router } from 'expo-router';
import { fetchParentStudents } from '@/services/withdrawals/parent';

import { useFocusEffect } from '@react-navigation/native'; // <-- nuevo import

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  rut: string;
}

export default function SeleccionarPersonaScreen() {
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { setData } = useAppContext();

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchParentStudents();
        setStudents(data);
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudieron cargar los estudiantes');
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  // Limpiar la selección cuando se sale de la pantalla
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSelectedPersonId(null);
      };
    }, [])
  );

  const handleContinue = () => {
    const selected = students.find(p => p.id === selectedPersonId);
    if (selected) {
      setData({
        alumnoSeleccionado: {
          id: selected.id,
          nombre: `${selected.firstName} ${selected.lastName}`,
          rut: selected.rut,
        },
      });
      router.push('/razonesRetiro');
    }
  };

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        <Text className="text-xl font-bold text-blue-600 mb-4">
          ¿A quién desea retirar?
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : students.length === 0 ? (
          <Text className="text-center text-gray-600 mt-4">No se han encontrado estudiantes.</Text>
        ) : (
          <View className="w-full mb-8 max-h-80">
            <ScrollView contentContainerClassName="space-y-4">
              {students.map((student) => (
                <SelectOptionButton
                  key={student.id}
                  label={`${student.firstName} ${student.lastName}`}
                  sublabel={`${student.rut}`}
                  isSelected={selectedPersonId === student.id}
                  onPress={() => setSelectedPersonId(student.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        <View className="w-full px-4">
          <View className="max-w-[320px] w-full mx-auto">
            <PrimaryButton
              title="Continuar"
              disabled={!selectedPersonId}
              onPress={handleContinue}
            />
          </View>
        </View>
      </View>
    </GlobalBackground>
  );
}
