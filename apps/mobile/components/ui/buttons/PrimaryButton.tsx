import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface Props {
  title: string;
  onPress?: () => void; // Ahora es opcional
  icon?: React.ReactNode;
}

export default function PrimaryButton({ title, onPress, icon }: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        !onPress && styles.buttonDisabled, // Estilo deshabilitado si no hay onPress
      ]}
      onPress={onPress}
      disabled={!onPress} // Desactiva el botón si no hay onPress
    >
      <Text style={styles.text}>{title}</Text>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ec1cf', // Color grisáceo u otro que indique "desactivado"
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  iconContainer: {
    marginLeft: 8,
  },
});