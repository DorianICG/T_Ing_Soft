import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { searchStudentByRut } from '@/services/withdrawals/inspector';
import InspectorStudentCard from '@/components/ui/cards/InspectorStudentCard';
import { useFocusEffect } from '@react-navigation/native';

type StudentData = {
  fullName: string;
  rut: string;
  courseName: string;
};

type ParentData = {
  fullName: string;
  rut: string;
  phone: string;
};

export default function ManualEntryScreen() {
  const [rut, setRut] = useState('');
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [parentData, setParentData] = useState<ParentData | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Limpiar estado al salir de la pantalla
  useFocusEffect(
    useCallback(() => {
      return () => {
        setRut('');
        setStudentData(null);
        setParentData(null);
        setErrorMessage('');
      };
    }, [])
  );

  const handleSearch = async () => {
    setErrorMessage('');
    try {
      const result = await searchStudentByRut(rut);
      console.log('Resultado de búsqueda:', result);

      const student = result.data.student;
      const parent = result.data.authorizedParent;

      const studentFullName = `${student.firstName} ${student.lastName}`;
      const parentFullName = `${parent.firstName} ${parent.lastName}`;

      setStudentData({
        fullName: studentFullName,
        rut: student.rut,
        courseName: student.course.name,
      });

      setParentData({
        fullName: parentFullName,
        rut: parent.rut,
        phone: parent.phone,
      });
    } catch (error: any) {
      console.error('Error al buscar el estudiante:', error.message);
      setStudentData(null);
      setParentData(null);
      setErrorMessage(error.message || 'No se pudo buscar el estudiante');
    }
  };

  return (
    <GlobalBackground>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 items-center justify-start px-5 py-8">
              <Text className="text-2xl font-bold text-blue-700 mb-3">Alumnos</Text>
              <Text className="text-gray-400 text-center mt-1 mb-6">
                Ingrese el RUT para buscar al Alumno
              </Text>

              <View className="space-y-4 w-full">
                <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">RUT</Text>
                <TextInput
                  value={rut}
                  onChangeText={setRut}
                  placeholder="12.345.678-9"
                  className="bg-white p-4 rounded-lg border border-gray-200"
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errorMessage !== '' && (
                  <Text className="text-red-500 text-sm mt-2">{errorMessage}</Text>
                )}
              </View>

              {studentData && parentData && (
                <View className="w-full mt-6">
                  <InspectorStudentCard student={studentData} parent={parentData} />
                </View>
              )}
            </View>
          </ScrollView>

          <View className="p-4 border-t border-gray-200 bg-white">
            <PrimaryButton
              title="Buscar"
              onPress={handleSearch}
              disabled={!rut.trim()}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GlobalBackground>
  );
}
