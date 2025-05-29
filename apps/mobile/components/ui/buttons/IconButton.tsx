import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
}

export default function IconButton({ icon, onPress, size = 24, color = '#333' }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Ionicons name={icon as any} size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
