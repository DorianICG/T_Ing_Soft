import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  dateTime: string;
  student: string;
  validator: string;
  method: string;
  status: string;
  customReason?: string | null;
}

export default function WithdrawalHistoryCard({
  dateTime,
  student,
  validator,
  method,
  status,
  customReason,
}: Props) {
  const date = new Date(dateTime);
  const dateStr = date.toLocaleDateString('es-CL');
  const timeStr = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  const isManual = method.toLowerCase() === 'manual';
  const iconName = isManual ? 'pencil-outline' : 'qr-code-outline';

  const statusColor = status === 'APPROVED' ? '#22C55E' : status === 'DENIED' ? '#EF4444' : '#D1D5DB';

  return (
    <View style={styles.card}>
      {/* Icono método en esquina superior derecha */}
      <View style={styles.iconContainer}>
        <Ionicons name={iconName as any} size={20} color="#1D4ED8" />
      </View>

      <Text style={styles.title}>{student}</Text>
      <Text style={styles.info}>Fecha: {dateStr} - Hora: {timeStr}</Text>
      <Text style={styles.info}>Autorizado por: {validator}</Text>
      <Text style={styles.info}>Método: {method}</Text>
      <Text style={styles.info}>Estado: {status}</Text>
      {customReason && <Text style={styles.info}>Motivo: {customReason}</Text>}

      {/* Punto de estado en esquina inferior derecha */}
      <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
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
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  statusDot: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
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
