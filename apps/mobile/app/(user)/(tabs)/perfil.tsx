import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../../../context/AuthContext'; 
import GlobalBackground from '@/components/layout/GlobalBackground'; 
import { useAppContext } from '@/context/AppContext';
import { fetchUserProfile } from '@/services/controllers/user';
import ConfirmModal from '@/components/ui/alerts/ConfirmModal';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import { useRouter } from 'expo-router';

interface UserProfile {
  id: number;
  rut: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export default function PerfilScreen() {
  const { logout, isLoading } = useAuth();
  const { setData } = useAppContext();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const user = await fetchUserProfile();
        console.log('Perfil del usuario:', user);
        setProfileData(user);
        setData((prev: any) => ({
          ...prev,
          userIdPadre: user.id,
        }));
      } catch (err: any) {
        console.error('Error al obtener perfil del usuario:', err.message);
      }
    };

    loadUserProfile();
  }, []);

  const handleLogoutPress = () => {
    setModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setModalVisible(false);
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleCancelLogout = () => {
    setModalVisible(false);
  };

  // Navegar a la pantalla de editar perfil con router.push
  const handleEditProfile = () => {
    router.push('/change-password'); // Ajusta el path según tu estructura de rutas
  };

  return (
    <GlobalBackground>
      <View style={styles.container}>
        <Text style={styles.title}>Mi Perfil</Text>

        {/* Datos perfil arriba */}
        {profileData ? (
          <View style={styles.userInfoContainer}>
            <Text style={styles.userInfoText}>Nombre: {profileData.firstName} {profileData.lastName}</Text>
            <Text style={styles.userInfoText}>RUT: {profileData.rut}</Text>
            <Text style={styles.userInfoText}>Email: {profileData.email}</Text>
            <Text style={styles.userInfoText}>Rol: {profileData.roles[0]}</Text>
          </View>
        ) : (
          <Text style={styles.userInfoText}>Cargando perfil...</Text>
        )}

        {/* Botones abajo */}
        <View style={styles.buttonsContainer}>
          <SecondaryButton
            title="Cambiar Contraseña"
            onPress={handleEditProfile}
            disabled={isLoading}
          />

          <TouchableOpacity
            style={[styles.logoutButton, isLoading && styles.buttonDisabled]}
            onPress={handleLogoutPress}
            disabled={isLoading}
          >
            <Text style={styles.logoutButtonText}>
              {isLoading ? 'Cerrando sesión...' : 'Cerrar Sesión'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Modal confirmación */}
        <ConfirmModal
          visible={modalVisible}
          message="¿Estás seguro de que quieres cerrar sesión?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      </View>
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 20,
    textAlign: 'center', // Centra el texto
  },
  userInfoContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  userInfoText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  buttonsContainer: {
    paddingBottom: 40,
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
