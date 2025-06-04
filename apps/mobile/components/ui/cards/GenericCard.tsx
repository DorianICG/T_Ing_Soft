import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GenericCardProps {
  data: { label: string; value: any }[];
}

export default function GenericCard({ data }: GenericCardProps) {
  return (
    <View style={styles.card}>
      {data.map(({ label, value }) => (
        <View key={label} style={styles.row}>
          <Text style={styles.key}>{label}:</Text>
          <Text style={styles.value}>
            {typeof value === 'object' && value !== null
              ? JSON.stringify(value, null, 2)
              : String(value)}
          </Text>
        </View>
      ))}
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  key: {
    fontWeight: '600',
    marginRight: 6,
    color: '#1e40af',
  },
  value: {
    flexShrink: 1,
    color: '#333',
  },
});
