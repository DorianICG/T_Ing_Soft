import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  name: string;
  rut: string;
  phone: string;
  email: string;
}

export default function ProfileCard({ name, rut, phone, email }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.info}>RUT: {rut}</Text>
      <Text style={styles.info}>Teléfono: {phone}</Text>
      <Text style={styles.info}>Correo: {email}</Text>
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
