import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon: string;
  message: string;
  date: string;
}

export default function NotificationCard({ icon, message, date }: Props) {
  return (
    <View style={styles.card}>
      <Ionicons name={icon as any} size={24} color="#007bff" style={styles.icon} />
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
});
