import GlobalBackground from '@/components/layout/GlobalBackground';
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';  

import { useAppContext } from '@/context/AppContext';
import { getQrInfo } from '@/services/withdrawals/inspector';

export default function ValidarQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setData } = useAppContext();
  const router = useRouter();  

useFocusEffect(
    useCallback(() => {
      console.log('[ValidarQRScreen] Cámara visible: true');
      setShowCamera(true);
      return () => {
        console.log('[ValidarQRScreen] Cámara visible: false');
        setShowCamera(false);
      };
    }, [])
  );

const handleBarcodeScanned = async (data: string) => {
  if (loading) {
    console.log('[ValidarQRScreen] Escaneo ignorado, proceso en curso...');
    return; // Evitar llamadas múltiples
  }
  console.log('[ValidarQRScreen] QR escaneado:', data);
  setLoading(true);

  try {
    const qrInfo = await getQrInfo(data);
    console.log('[ValidarQRScreen] Info del QR recibida:', qrInfo);
    console.log('[ValidarQRScreen] Info del QR:', qrInfo);
    setData({ ...qrInfo, qrCode: data });
    router.push('/autorizacionRetiro');
  } catch (error: any) {
    console.error('[ValidarQRScreen] Error al validar QR:', error.message);

    // Aquí interpretamos mensajes comunes para mostrar alertas claras:
    if (
      error.message.includes('no encontrado') ||
      error.message.includes('inválido') ||
      error.message.includes('expirado')
    ) {
      Alert.alert('Código inválido', error.message);
    } else if (error.message.includes('Error interno')) {
      Alert.alert('Error del servidor', 'Hubo un problema con el servidor, por favor intenta más tarde.');
    } else {
      Alert.alert('Error', error.message || 'No se pudo validar el código QR');
    }
  } finally {
    setLoading(false);
  }
};


  console.log(`[ValidarQRScreen] Permiso cámara: ${isPermissionGranted}, showCamera: ${showCamera}, loading: ${loading}`);

  return (
    <GlobalBackground>
      <View className="flex-1 items-center justify-center">
        <Text className="text-2xl font-bold text-blue-700 mb-3">Validar Retiro</Text>

        {!isPermissionGranted && (
          <Pressable onPress={() => requestPermission()} style={styles.permissionButton}>
            <Text style={{ color: 'white' }}>Dar permiso de cámara</Text>
          </Pressable>
        )}

        {isPermissionGranted && showCamera && (
          <>
            <Text style={styles.permissionGrantedText}>
              Permiso de cámara otorgado {loading ? '⌛ Validando...' : '✅'}
            </Text>

            <View style={styles.fullCameraArea}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={({ data }) => {
                  console.log('[ValidarQRScreen] onBarcodeScanned evento recibido');
                  handleBarcodeScanned(data);
                }}
                barcodeScannerSettings={{ barcodeTypes: ['qr', 'ean13', 'code128'] }}
              />

              <View style={styles.guideBox}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </View>
          </>
        )}
      </View>
    </GlobalBackground>
  );
}

const GUIDE_BOX_SIZE = 250;

const styles = StyleSheet.create({
  fullCameraArea: {
    flex: 1,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideBox: {
    width: GUIDE_BOX_SIZE,
    height: GUIDE_BOX_SIZE,
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -GUIDE_BOX_SIZE / 2,
    marginTop: -GUIDE_BOX_SIZE / 2,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#FFFFFF',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  permissionButton: {
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  permissionGrantedText: {
    color: 'green',
    marginTop: 20,
  },
});
