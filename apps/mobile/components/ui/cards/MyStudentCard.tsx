import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  firstName: string;
  lastName: string;
  rut: string;
  courseName: string;
  activeQr: boolean;
}

export default function MyStudentCard({
  firstName,
  lastName,
  rut,
  courseName,
  activeQr,
}: Props) {
  return (
    <View style={styles.card}>
      {activeQr && (
        <View style={styles.iconContainer}>
          <Ionicons name="qr-code-outline" size={24} color="#1D4ED8" />
        </View>
      )}

      <Text style={styles.title}>{`${firstName} ${lastName}`}</Text>
      <Text style={styles.info}>RUT: {rut}</Text>
      <Text style={styles.info}>Curso: {courseName}</Text>
      <Text style={styles.info}>QR Activo: {activeQr ? 'Sí' : 'No'}</Text>
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
    position: 'relative', // Necesario para posicionar el icono
  },
  iconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
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
