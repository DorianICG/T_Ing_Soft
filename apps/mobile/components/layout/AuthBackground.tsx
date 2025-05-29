import React from 'react';
import { View, Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import images from '@/constants/images';

// Dimensiones y constantes
const { height, width } = Dimensions.get('window');
const topBlueAreaHeight = height / 6;

// Tamaño dinámico del logo con máximo absoluto
const maxLogoWidth = 250;
const logoWidth = Math.min(width * 0.5, maxLogoWidth);
const logoHeight = logoWidth * 0.6;

interface AuthBackgroundProps {
  children: React.ReactNode;
}

const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
  return (
    <View style={styles.topContainer}>
      {/* Contenido superior */}
      <View style={styles.topContent}>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <Image
            source={images.logos.logoWhite}
            resizeMode="contain"
            style={{ width: logoWidth, height: logoHeight }}
          />
        </TouchableOpacity>
      </View>

      {/* Contenedor inferior */}
      <View style={[styles.bottomContainer, { top: topBlueAreaHeight }]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  topContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: topBlueAreaHeight,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    paddingTop: 100,
    paddingHorizontal: 20,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
});

export default AuthBackground;
