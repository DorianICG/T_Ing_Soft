import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  name: string;
  rut?: string;
  phone?: string;
  relation?: string;
  grade?: string;
}

export default function PickupInfoCard({ name, rut, phone, relation, grade }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      {rut && <Text style={styles.info}>RUT: {rut}</Text>}
      {phone && <Text style={styles.info}>Teléfono: {phone}</Text>}
      {relation && <Text style={styles.info}>Relación: {relation}</Text>}
      {grade && <Text style={styles.info}>Curso: {grade}</Text>}
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
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
});