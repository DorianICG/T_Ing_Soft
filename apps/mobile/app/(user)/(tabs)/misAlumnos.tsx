import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { fetchParentStudents } from '@/services/withdrawals/parent';
import MyStudentCard from '@/components/ui/cards/MyStudentCard';

export default function MisAlumnosScreen() {
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const getStudents = async () => {
      try {
        const data = await fetchParentStudents();
        console.log('Estudiantes:', data);
        setStudents(data);
      } catch (error: any) {
        console.error('Error al obtener estudiantes:', error.message);
      }
    };

    getStudents();
  }, []);

  return (
    <GlobalBackground>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-blue-700 mb-4 text-center">
          Mis alumnos
        </Text>

        {students.map((student) => (
          <MyStudentCard
            key={student.id}
            firstName={student.firstName}
            lastName={student.lastName}
            rut={student.rut}
            courseName={student.courseName}
            activeQr={student.activeQr}
          />
        ))}
      </ScrollView>
    </GlobalBackground>
  );
}
