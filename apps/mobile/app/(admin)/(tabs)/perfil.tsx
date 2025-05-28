import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../../../context/AuthContext'; 
import GlobalBackground from '@/components/layout/GlobalBackground'; 

export default function PerfilScreen() {
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres cerrar sesión?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sí, Salir", 
          onPress: async () => {
            try {
              await logout();
              // La redirección a login es manejada por AuthContext
              // Si quisieras forzar aquí: router.replace('/(auth)/login');
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
              Alert.alert("Error", "No se pudo cerrar la sesión. Inténtalo de nuevo.");
            }
          },
          style: "destructive" 
        }
      ]
    );
  };

  return (
    <GlobalBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil del Usuario</Text>
        {user && (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>Nombre: {user.firstName} {user.lastName}</Text>
            <Text style={styles.userInfoText}>RUT: {user.rut}</Text>
            <Text style={styles.userInfoText}>Email: {user.email}</Text>
            <Text style={styles.userInfoText}>Rol: {user.role}</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogout}
          disabled={isLoading}
        >
          <Text style={styles.logoutButtonText}>
            {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Text>
        </TouchableOpacity>
      </View>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a', // text-blue-800
    marginBottom: 20,
  },
  userInfoContainer: {
    marginBottom: 30,
    alignItems: 'flex-start',
    width: '100%',
    padding: 15,
    backgroundColor: '#f9fafb', // bg-gray-50
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb', // border-gray-200
  },
  userInfoText: {
    fontSize: 16,
    color: '#374151', // text-gray-700
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#dc2626', // bg-red-600
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#ffffff', // text-white
    fontSize: 16,
    fontWeight: 'semibold',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});