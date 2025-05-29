import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

type SelectOptionProps = {
  label: string;
  sublabel?: string;
  isSelected: boolean;
  onPress: () => void;
};

const SelectOptionButton = ({ label, sublabel, isSelected, onPress }: SelectOptionProps) => {
  return (
<TouchableOpacity
  onPress={onPress}
  className={`flex-row items-center p-4 rounded-lg border border-gray-300 ${
    isSelected ? 'bg-blue-100' : 'bg-white'
  }`}
>
  <View
    className={`ml-4 flex-1 justify-center ${sublabel ? 'justify-start h-12' : 'justify-center'}`}
  >
    <Text numberOfLines={1} className="text-base font-medium">
      {label}
    </Text>
    {sublabel && (
      <Text numberOfLines={1} className="text-sm text-gray-500 mt-1">
        {sublabel}
      </Text>
    )}
  </View>
</TouchableOpacity>

  );
};

export default SelectOptionButton;