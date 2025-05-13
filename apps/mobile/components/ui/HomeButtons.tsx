import React from 'react';
import { TouchableOpacity, Text, View, TouchableOpacityProps } from 'react-native';

interface OptionButtonProps extends TouchableOpacityProps {
  title: string;
  icon?: React.ReactNode; 
  containerClassName?: string;
  iconContainerClassName?: string;
  textClassName?: string;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  title,
  icon,
  onPress,
  containerClassName = '',
  iconContainerClassName = '',
  textClassName = '',
  ...props
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-white flex-row items-center p-4 rounded-2xl shadow-md mb-4 ${containerClassName}`.trim()}
      activeOpacity={0.7}
      {...props}
    >
      {icon && (
        <View className={`mr-4 ${iconContainerClassName}`.trim()}>
          {icon}
        </View>
      )}
      <Text className={`text-gray-800 text-base font-semibold ${textClassName}`.trim()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default OptionButton;