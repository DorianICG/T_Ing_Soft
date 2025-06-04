import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  icon: string;
  onPress: () => void;
  size?: number;
  backgroundColor?: string;
  iconColor?: string;
}

export default function RoundedIconButton({ icon, onPress, size = 24, backgroundColor = '#007bff', iconColor = '#fff' }: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.button, { backgroundColor }]}> 
      <Ionicons name={icon as any} size={size} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
});