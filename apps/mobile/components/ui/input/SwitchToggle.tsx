import React from 'react';
import { View, Text, Switch } from 'react-native';

interface SwitchToggleProps {
  label: string;
  value: boolean;
  onValueChange: (newValue: boolean) => void;
  disabled?: boolean;
}

export default function SwitchToggle({
  label,
  value,
  onValueChange,
  disabled = false,
}: SwitchToggleProps) {
  return (
    <View className="flex-row items-center justify-between w-full py-2">
      <Text className="text-gray-700">{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#ccc', true: '#4f46e5' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );
}
