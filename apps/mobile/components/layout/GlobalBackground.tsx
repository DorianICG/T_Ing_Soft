import React from 'react';
import { View, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');

const topBlueAreaHeight = height / 6;

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  return (
    <View className="flex-1 bg-blue-900">
      <View style={{ height: topBlueAreaHeight }} />
      <View
        className="absolute left-0 right-0 bottom-0 bg-white rounded-t-3xl pt-8"
        style={{ top: topBlueAreaHeight }}
      >
        {children}
      </View>
    </View>
  );
};
export default GlobalBackground;