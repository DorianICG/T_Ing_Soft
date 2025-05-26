import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Props {
  label: string;
  code: string;
  onChange: (text: string) => void;
  maxLength?: number;
}

export default function CodeInput({ label, code, onChange, maxLength = 6 }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={maxLength}
        value={code}
        onChangeText={onChange}
        placeholder={"_ ".repeat(maxLength).trim()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    backgroundColor: '#fff',
    letterSpacing: 12,
    textAlign: 'center',
  },
});