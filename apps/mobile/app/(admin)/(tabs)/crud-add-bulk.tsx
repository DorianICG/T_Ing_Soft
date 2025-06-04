import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { Ionicons } from '@expo/vector-icons';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import { useAppContext } from '@/context/AppContext';

import * as DocumentPicker from 'expo-document-picker';
import { createUsersBulk } from '@/services/CRUD/adminUsers';
import { createStudentsBulk } from '@/services/CRUD/adminStudents';
import { createCoursesBulk } from '@/services/CRUD/adminCourses';
import AlertModal from '@/components/ui/alerts/AlertModal';
import { router } from 'expo-router';



export default function CSVUploadScreen() {
  const { data, setData } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileUri, setFileUri] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleCloseModal = () => setModalVisible(false);

  // Asumo que `data.section` define la sección activa
  const activeSection = data?.section?.toLowerCase() || '';

function isSuccess(result: DocumentPicker.DocumentPickerResult): result is DocumentPicker.DocumentPickerSuccessResult {
  return result.canceled === false && Array.isArray(result.assets) && result.assets.length > 0;
}

const handlePickFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    console.log('DocumentPicker result:', result);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setFileName(asset.name);
      setFileUri(asset.uri);
    } else if (result.canceled) {
      // Usuario canceló
    } else {
      throw new Error('No se pudo seleccionar el archivo');
    }
  } catch (error: any) {
    setModalTitle('Error al seleccionar archivo');
    setModalMessage(error.message || 'Error desconocido');
    setModalVisible(true);
  }
};



  const handleUploadCSV = async () => {
    if (!fileUri) {
      setModalTitle('Archivo no seleccionado');
      setModalMessage('Por favor, selecciona un archivo CSV primero.');
      setModalVisible(true);
      return;
    }

    setLoading(true);

    try {
      let file: File | null = null;

      if (Platform.OS === 'web') {
        // En web, fetch para convertir URI a File
        const fetched = await fetch(fileUri);
        const blob = await fetched.blob();
        file = new File([blob], fileName ?? 'file.csv', { type: 'text/csv' });
      } else {
        // En móvil, el backend debería aceptar el archivo vía URI, para FormData se usa uri, type y name
        // Crearemos un objeto tipo "file" con las propiedades necesarias para FormData en RN:
        // @ts-ignore
        file = {
          uri: fileUri,
          name: fileName ?? 'file.csv',
          type: 'text/csv',
        } as any;
      }

      let response;
      if (activeSection === 'usuarios') {
        response = await createUsersBulk({ file });
      } else if (activeSection === 'alumnos') {
        response = await createStudentsBulk({ file});
      } else if (activeSection === 'cursos') {
        response = await createCoursesBulk({ file });
      } else {
        throw new Error('Sección no válida');
      }

        setModalTitle('Carga masiva exitosa');
        setModalMessage('Se han subido los datos con éxito.');
        setModalVisible(true);


      // Limpiar estado y recargar datos
      setFileName(null);
      setFileUri(null);
      setData(null);
    } catch (error: any) {
      setModalTitle('Error en carga masiva');
      setModalMessage(error.message || 'Error desconocido');
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  // Extraer la sección y mostrar en singular (igual que en delete)
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

  const singularSection = getSingularSection(data?.section ?? '');

  return (
    <GlobalBackground>
      <View style={styles.screenContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.iconWrapper}>
            <Ionicons name="document-text-outline" size={48} color="#2563eb" />
          </View>
          <Text style={styles.title}>Subir CSV para {singularSection}</Text>
          <Text style={styles.subtitle}>
            Selecciona un archivo CSV para importar datos a la sección {singularSection}.
          </Text>

          <TouchableOpacity
            style={styles.uploadArea}
            activeOpacity={0.7}
            onPress={handlePickFile}
          >
            <Ionicons name="cloud-upload-outline" size={40} color="#2563eb" />
            <Text style={styles.uploadText}>
              {fileName ? fileName : 'Toca aquí para seleccionar un archivo'}
            </Text>
          </TouchableOpacity>

          {loading && (
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <ActivityIndicator size="small" color="#2563eb" />
            </View>
          )}
        </View>

        <View style={styles.buttonsContainer}>
          <View style={styles.buttonWrapper}>
            <SecondaryButton title="Cancelar" onPress={() => {
              // Limpiar selección y modal
              setFileName(null);
              setFileUri(null);
            router.push('/crud'); // Va a la ruta /crud
            }} disabled={loading} />
          </View>
          <View style={[styles.buttonWrapper, { marginLeft: 8 }]}>
            <PrimaryButton
              title={loading ? 'Subiendo...' : 'Subir CSV'}
              onPress={handleUploadCSV}
              disabled={loading || !fileName}
            />
          </View>
        </View>

        <AlertModal
          visible={modalVisible}
          title={modalTitle}
          message={modalMessage}
          onClose={handleCloseModal}
        />
      </View>
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
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: '#2563eb',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  uploadText: {
    marginTop: 10,
    color: '#2563eb',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  buttonWrapper: {
    flex: 1,
  },
});
