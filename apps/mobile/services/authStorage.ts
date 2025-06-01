/* ESTE ARCHIVO SIRVE PARA CENTRALIZAR EL GUARDADO Y MANEJO DEL TOKEN DEL USUARIO,
DE MODO QUE OTRAS APIS PUEDAN UTILIZAR ESTAS FUNCIONES EN CASO DE SER
NECESARIO PARA ALGUNA CONSULTA AL BACKEND*/

//IMPORTANTE, TECNICAMENTE DEBERIA DE FUNCIONAR TAMBIEN EN ANDROID, PERO DEBE SER TESTEADO!!!
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

//Funcion para obtener el token
export const getToken = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error al leer el token desde localStorage', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

//Funcion para guardar el token
export const storeToken = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Error al guardar token en localStorage', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

//Funcion para eliminar el token
export const deleteToken = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error al eliminar token de localStorage', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
