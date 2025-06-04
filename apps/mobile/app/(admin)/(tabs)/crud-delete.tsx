import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '@/context/AppContext';
import { useRouter } from 'expo-router';
import { deleteCourse } from '@/services/CRUD/adminCourses';
import { deleteStudent } from '@/services/CRUD/adminStudents';
import { deleteUser } from '@/services/CRUD/adminUsers';
import AlertModal from '@/components/ui/alerts/AlertModal';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

export default function CRUDDeleteScreen() {
  const { data, setData } = useAppContext();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const noData = !data?.rawData;

  const getSingularSection = (section: string) => {
    switch (section?.toLowerCase()) {
      case 'alumnos':
        return 'alumno';
      case 'usuarios':
        return 'usuario';
      case 'cursos':
        return 'curso';
      default:
        return section?.toLowerCase() ?? 'elemento';
    }
  };

  const singularSection = getSingularSection(data?.section);

  const handleDelete = async () => {
    const id = data?.rawData?.id;
    if (!id) {
      setModalTitle('Error');
      setModalMessage('No se encontró el ID para eliminar.');
      setModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      switch (singularSection) {
        case 'curso':
          await deleteCourse(id);
          break;
        case 'alumno':
          await deleteStudent(id);
          break;
        case 'usuario':
          await deleteUser(id);
          break;
        default:
          throw new Error('Sección no soportada para eliminación.');
      }

      setModalTitle('Éxito');
      setModalMessage(`${singularSection.charAt(0).toUpperCase() + singularSection.slice(1)} eliminado correctamente.`);
      setModalVisible(true);
    } catch (error: any) {
      setModalTitle('Error');
      setModalMessage(error.message || 'Error al eliminar el elemento.');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/crud');
    setData(null);
  };

  return (
    <GlobalBackground>
      {noData ? (
        <View style={styles.centered}>
          <Text style={styles.message}>No hay datos para eliminar.</Text>
        </View>
      ) : (
        <View style={styles.screenContainer}>
          <View style={styles.contentContainer}>
            <View style={styles.iconWrapper}>
              <Ionicons name="trash-outline" size={48} color="#dc2626" />
            </View>
            <Text style={styles.title}>Eliminar {singularSection}</Text>
            <Text style={styles.subtitle}>
              Confirma que quieres eliminar al {singularSection}. Esta acción no se puede deshacer.
            </Text>

            {loading && (
              <View style={{ marginTop: 12, alignItems: 'center' }}>
                <ActivityIndicator size="small" color="#dc2626" />
              </View>
            )}
          </View>

          <View className="flex-row justify-between items-center p-4 w-full">
            <View className="w-1/3">
              <SecondaryButton title="Cancelar" onPress={handleCancel} disabled={loading} />
            </View>
            <View className="w-1/3 ml-2">
              <PrimaryButton title="Eliminar" onPress={handleDelete} disabled={loading} />
            </View>
          </View>

          <AlertModal
            visible={modalVisible}
            title={modalTitle}
            message={modalMessage}
            onClose={() => {
              setModalVisible(false);
              if (modalTitle === 'Éxito') {
                setData(null);
                router.push('/crud');
              }
            }}
          />
        </View>
      )}
    </GlobalBackground>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    marginHorizontal: 16,
    marginVertical: 32,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fefefe',
    borderRadius: 12,
    elevation: 3,
    padding: 16,
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    color: '#444',
  },
});
