import React from 'react';
import { View, TextInput, TextInputProps, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmailInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({
  value,
  onChangeText,
  placeholder = "correo@ejemplo.com",
  className,
  ...rest
}) => {
  return (
    <View style={[styles.container, className ? {} : null]}>
      <Ionicons name="mail-outline" size={24} color="#374151" style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        {...rest}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#374151',
    fontSize: 16,
  },
});

export default EmailInput;
