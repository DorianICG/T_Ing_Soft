import React from 'react';
import { View, Dimensions, Image, StyleSheet, Text } from 'react-native';
import image from '@/constants/images';
import { useAuth } from '@/context/AuthContext';


// Dimensiones y constantes
const { height, width } = Dimensions.get('window');
const topBlueAreaHeight = height / 6;
const imageHeight = 170;
const avatarImage = image.defaultImage.avatar; //IMAGEN DEFAULT, CAMBIAR CON APIS SI SE DESEA

interface GlobalBackgroundProps {
  children: React.ReactNode;
}

const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children }) => {
  const { user } = useAuth(); 
  //console.log('Usuario en GlobalBackground:', user);
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'Usuario';
  
  return (
    <View style={styles.topContainer}>
      {/* Contenido superior */}
      <View style={styles.topContent}>
        <Text style={styles.topText}>{fullName}</Text>
      </View>

      {/* Imagen del avatar */}
      <Image
        source={avatarImage}
        style={styles.avatar}
        resizeMode="cover"
      />

      {/* Contenedor inferior */}
      <View style={[styles.bottomContainer, { top: topBlueAreaHeight }]}>
        {children}
      </View>
    </View>
  );
};

// Estilos
const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#EFF3F5',
    paddingTop: 100,
    paddingHorizontal: 20,
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },
  avatar: {
    position: 'absolute',
    top: topBlueAreaHeight - imageHeight / 2,
    left: width / 2 - imageHeight / 2,
    width: imageHeight,
    height: imageHeight,
    borderRadius: imageHeight / 2,
    zIndex: 2,
    backgroundColor: 'white',
  },
  topContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: topBlueAreaHeight / 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  topText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});

export default GlobalBackground;
