import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground';

import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

import { useAppContext } from '@/context/AppContext';
import { router } from 'expo-router';
import { fetchParentStudents } from '@/services/withdrawals';

//Estructura de datos a guardar
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
  const { setData } = useAppContext(); //Set de datos para contexto

  //Manejo del loading de datos
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchParentStudents(); //Busca los datos
        setStudents(data); //Almacena localmente los datos (NO EN AppContext)
      } catch (err: any) {
        Alert.alert('Error', err.message || 'No se pudieron cargar los estudiantes');
      } finally {
        setLoading(false);
      }
    };
    loadStudents();
  }, []);

  //Funcion a ejecutar cuando se apreta el boton
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
      router.push('/encargadoRetiro'); // siguiente pantalla
    }
  };

  return (
    <GlobalBackground>
    <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        {/* Pregunta */}
        <Text className="text-xl font-bold text-blue-600 mb-4">
          ¿A quién desea retirar?
        </Text>

    {/* Opciones de selección */}
    {loading ? (
      <ActivityIndicator size="large" color="#0000ff" />
      //Caso = No hay estudiantes
    ) : students.length === 0 ? (
      <Text className="text-center text-gray-600 mt-4">No se han encontrado estudiantes.</Text>
    ) : (
      //Caso = Hay datos!
      <View className="w-full mb-8 max-h-80">
        <ScrollView contentContainerClassName="space-y-4">
          {/* Mapeo de los datos */}
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


      {/* Botón continuar */}
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