import React, { useState } from 'react';
import { View, Text, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

type DatePickerProps = {
  label: string;
  value: string; // fecha en formato 'YYYY-MM-DD'
  onChange: (date: string) => void;
};

export default function DatePicker({ label, value, onChange }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  // Convierte el string 'YYYY-MM-DD' a Date
  const dateValue = value ? new Date(value) : new Date();

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false); // en Android se oculta al seleccionar

    if (selectedDate) {
      // Formatear a 'YYYY-MM-DD'
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      onChange(`${year}-${month}-${day}`);
    }
  };

  return (
    <View className="w-full mb-4">
      <Text className="text-sm font-medium text-gray-600 mb-1">{label}</Text>

      <TouchableOpacity
        className="border border-gray-300 rounded-md p-3"
        onPress={() => setShowPicker(true)}
      >
        <Text>{value || 'Selecciona una fecha'}</Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()} // No permite fechas futuras
        />
      )}
    </View>
  );
}
