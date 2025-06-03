import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

interface Field {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'email'; // Puedes extender con más tipos si lo necesitas
  editable?: boolean; // Para controlar campos solo lectura si quisieras
}

interface Props {
  fields: Field[];
  values: { [key: string]: string };
  onChange: (key: string, value: string) => void;
  editableKeys?: string[]; // Para limitar qué campos se editan (por ejemplo, en modo edición)
}

export default function DynamicForm({ fields, values, onChange, editableKeys }: Props) {
  return (
    <View>
      {fields
        .filter((field) =>
          editableKeys ? editableKeys.includes(field.key) : true
        )
        .map((field) => (
          <View key={field.key} style={styles.fieldContainer}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              style={styles.input}
              value={values[field.key] || ''}
              onChangeText={(text) => onChange(field.key, text)}
              placeholder={field.label}
              keyboardType={getKeyboardType(field.type)}
              editable={field.editable !== false}
            />
          </View>
        ))}
    </View>
  );
}

function getKeyboardType(type?: string) {
  switch (type) {
    case 'number':
      return 'numeric';
    case 'email':
      return 'email-address';
    default:
      return 'default';
  }
}

const styles = StyleSheet.create({
  fieldContainer: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
  },
});
