import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
}

export default function TextLinkButton({ title, onPress }: Props) {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.link}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  link: {
    color: '#007bff',
    textDecorationLine: 'underline',
    fontSize: 14,
    marginVertical: 4,
  },
});
