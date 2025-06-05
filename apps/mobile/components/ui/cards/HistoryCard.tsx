import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface Props {
  dateTime: string;
  student: string;
  validator: string;
  method: string;
  status: string;
  customReason?: string | null;
  expiresAt?: string;
  onPressButton?: () => void;
}

export default function HistoryCard({
  dateTime,
  student,
  validator,
  method,
  status,
  customReason,
  expiresAt,
  onPressButton,
}: Props) {
  const date = new Date(dateTime);
  const dateStr = date.toLocaleDateString('es-CL');
  const timeStr = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  const isExpired = status === 'EXPIRED';
  const isActive = status === 'ACTIVE';
  const isCompleted = status === 'COMPLETED';

  // Expiration date formatting (same as dateTime)
  const expDateStr = expiresAt
    ? new Date(expiresAt).toLocaleDateString('es-CL')
    : '';
  const expTimeStr = expiresAt
    ? new Date(expiresAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{student}</Text>

      {!isExpired && (
        <Text style={styles.info}>Fecha: {dateStr} - Hora: {timeStr}</Text>
      )}

      <Text style={styles.info}>Autorizado por: {validator}</Text>
      <Text style={styles.info}>Tipo Validación: {method}</Text>
      <Text style={styles.info}>Estado: {status}</Text>

      {customReason && (
        <Text style={styles.info}>Motivo: {customReason}</Text>
      )}

      {(isExpired || isActive) && expiresAt && (
        <Text style={styles.info}>
          {isExpired ? 'Expiró' : 'Expira'}: {expDateStr} - {expTimeStr}
        </Text>
      )}

      {isActive && onPressButton && (
        <View style={styles.buttonContainer}>
          <Pressable style={styles.button} onPress={onPressButton}>
            <Text style={styles.buttonText}>Ver</Text>
          </Pressable>
        </View>
      )}
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
  },
  button: {
    backgroundColor: '#1D4ED8',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
