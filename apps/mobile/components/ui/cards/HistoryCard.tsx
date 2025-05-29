import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  date: string;
  time: string;
  student: string;
  validator: string;
  method: string;
}

export default function HistoryCard({ date, time, student, validator, method }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{student}</Text>
      <Text style={styles.info}>Fecha: {date} - Hora: {time}</Text>
      <Text style={styles.info}>Autorizado por: {validator}</Text>
      <Text style={styles.info}>Tipo Validación: {method}</Text>
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
  info: {
    fontSize: 14,
    color: '#555',
  },
});
