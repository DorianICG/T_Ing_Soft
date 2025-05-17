import GlobalBackground from '@/components/layout/GlobalBackground';
import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';

export default function ValidarQRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const isPermissionGranted = Boolean(permission?.granted);

  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Evento para forzar activacion / desactivacion de camara si se cambia de pestaña
  useFocusEffect(
    useCallback(() => {
      setShowCamera(true);
      return () => setShowCamera(false);
    }, [])
  );

  return (
    <GlobalBackground>
        {/*Contenedor Vista*/}
        <View className="flex-1 items-center justify-center">
            <Text className="text-2xl font-bold text-blue-700 mb-3">Validar Retiro</Text>

            {/*Elementos (Permisos sin conceder)*/}
            {!isPermissionGranted && (
            <Pressable onPress={() => requestPermission()} style={styles.permissionButton}>
                <Text style={{ color: 'white' }}>Dar permiso de cámara</Text>
            </Pressable>
            )}

            {/*Elementos (permisos concedidos)*/}
            {isPermissionGranted && showCamera && (
            <>
                <Text style={styles.permissionGrantedText}>Permiso de cámara otorgado ✅</Text>

                {/*Contenedor camara*/}
                <View style={styles.fullCameraArea}>
                <CameraView
                    style={StyleSheet.absoluteFill}
                    facing="back"
                    onBarcodeScanned={({ data }) => {
                        //LOGICA DE ESCANEO
                        console.log('QR DATA:', data);
                        setScannedData(data);
                    }}
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                />

                {/*Overlay de escaneo*/}
                <View style={styles.guideBox}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
                </View>

                {/*DEBUG*/}
                {scannedData && (
                <Text style={styles.debugText}>
                    📦 Código escaneado: {scannedData}
                </Text>
                )}
            </>
            )}
        </View>
    </GlobalBackground>
  );
}

const GUIDE_BOX_SIZE = 250; //TAMAÑO MAX DE CODIGO QR

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
  debugText: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
    width: '90%',
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
