import React, { useState } from 'react';
import { View, TextInput, TextInputProps, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

interface PasswordInputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  value: string;
  onChangeText: (text: string) => void;
  className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChangeText,
  className,
  placeholder,
  ...rest
}) => {
  const [secure, setSecure] = useState(true);

  return (
    <View style={[styles.container, className ? {  } : null]}>
      <Ionicons name="lock-closed-outline" size={24} color="#374151" style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secure}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
        {...rest}
      />
      <Pressable onPress={() => setSecure(!secure)}>
        <Ionicons
          name={secure ? 'eye-off-outline' : 'eye-outline'}
          size={22}
          color="gray"
        />
      </Pressable>
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

export default PasswordInput;
