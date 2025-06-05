import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StudentData {
  fullName: string;
  rut: string;
  courseName: string;
}

interface ParentData {
  fullName: string;
  rut: string;
  phone: string;
}

interface Props {
  student: StudentData;
  parent: ParentData;
}

export default function InspectorStudentCard({ student, parent }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{student.fullName}</Text>
      <Text style={styles.info}>RUT: {student.rut}</Text>
      <Text style={styles.info}>Curso: {student.courseName}</Text>

      <View style={styles.separator} />

      <Text style={styles.subtitle}>Apoderado autorizado</Text>
      <Text style={styles.info}>Nombre: {parent.fullName}</Text>
      <Text style={styles.info}>RUT: {parent.rut}</Text>
      <Text style={styles.info}>Teléfono: {parent.phone}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    marginTop: 8,
    color: '#1D4ED8',
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
});
