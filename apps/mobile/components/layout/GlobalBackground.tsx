import React from 'react';
import { View, Dimensions, Image, StyleSheet, ImageSourcePropType, Text  } from 'react-native';
import images from '@/constants/images';

//Constantes
const isLoggedIn = true; //PARA DEBUG, ADAPTAR UNA VEZ SISTEMA DE TOKENS ESTE LISTO!!

const { height, width } = Dimensions.get('window');
const topBlueAreaHeight = height / 6;
const imageHeight = 170;

const logoImage = images.logoBlack;
const avatarImage =   {uri: 'https://s3.amazonaws.com/37assets/svn/765-default-avatar.png'};


interface GlobalBackgroundProps {
  children: React.ReactNode;
  imageSource?: ImageSourcePropType; // Source de logo | avatar
  isLogo?: boolean //Flag para aplicar estilos
}

const GlobalBackground: React.FC<GlobalBackgroundProps> = ({ children}) => {
  return (
    <View style={styles.topContainer}> 
      {/* Contenedor Superior*/}
      {isLoggedIn && (
        <View style={styles.topContent}>
          <Text style={styles.topText}>
            NOMBRE
          </Text>
        </View>
      )}

      {/* Imagen*/}
      <Image
        source={isLoggedIn ? avatarImage : logoImage}
        style={isLoggedIn ? styles.avatar : styles.logo}
        resizeMode="cover"
      />

      {/* Contenedor Inferior */}
      <View style={[styles.bottomContainer, { top: topBlueAreaHeight }]}>
        {children}
      </View>
    </View>
  );
};


//Estilos
const styles = StyleSheet.create({
  //Contenedor de arriba
  topContainer: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },

  //Contenedor de abajo
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    paddingTop: 100, // Agrega espacio interno superior al contenedor
    paddingHorizontal: 20, // Espaciado horizontal opcional
    borderTopLeftRadius: 80,
    borderTopRightRadius: 80,
  },

  //Estilo avatar
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

  //Estilo Logo (WIP)
  logo: {
    position: 'absolute',
    top: topBlueAreaHeight - 50, 
    left: width / 2 - 50,        
    width: 100,
    height: 100,
    resizeMode: 'contain',
    zIndex: 2,
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
