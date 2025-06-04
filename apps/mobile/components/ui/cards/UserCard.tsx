import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import IconButton from '../buttons/IconButton';

interface Props {
  name: string;
  role: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function UserCard({ name, role, onEdit, onDelete }: Props) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>
      <View style={styles.actions}>
        {onEdit && <IconButton icon="create-outline" onPress={onEdit} />}
        {onDelete && <IconButton icon="trash-outline" onPress={onDelete} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  role: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
  },
});
