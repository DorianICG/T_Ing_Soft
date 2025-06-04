import React, { useState, useEffect } from 'react';
import { View, Text, Alert, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native';
import { useAppContext } from '@/context/AppContext'; // Importar el contexto
import { useRouter } from 'expo-router';

import RutInput from '@/components/ui/input/RutInput'; // Componente de RUT
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';
import GlobalBackground from '@/components/layout/GlobalBackground'; // Fondo común

import { searchStudentByRut, getWithdrawalReasons } from '@/services/withdrawals/inspector'; // APIs

import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton'; // Componente de opción de selección

export default function ManualEntryScreen() {
  const router = useRouter();
  const { setData } = useAppContext();  
  const [rut, setRut] = useState('');
  const [studentInfo, setStudentInfo] = useState<any>(null); 
  const [reasons, setReasons] = useState<any[]>([]); 
  const [loadingReasons, setLoadingReasons] = useState<boolean>(true); 
  const [selectedReasonId, setSelectedReasonId] = useState<number | null>(null);
  const [customReason, setCustomReason] = useState(''); 

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        const reasonsData = await getWithdrawalReasons();
        if (reasonsData && Array.isArray(reasonsData)) {
          setReasons(reasonsData); // Asignamos los datos si todo es correcto
        } else {
          Alert.alert('Error', 'No se pudieron obtener los motivos de retiro');
          setReasons([]); // Limpiamos el estado si la respuesta no es correcta
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudieron obtener los motivos de retiro');
        setReasons([]); // Limpiamos el estado si hubo un error en la solicitud
      } finally {
        setLoadingReasons(false); // Cambiamos el estado de carga a false
      }
    };

    fetchReasons(); // Ejecutamos la llamada a la API al montar el componente

    // Cleanup cuando el componente se desmonte (limpiamos los estados)
    return () => {
      setRut(''); // Limpiar el RUT
      setSelectedReasonId(null); // Limpiar el motivo seleccionado
      setCustomReason(''); // Limpiar el motivo personalizado
      setReasons([]); // Limpiar los motivos
    };
  }, []); // Al montar el componente, hacemos fetch de los motivos

  // Lógica para buscar el estudiante por RUT
  const handleSearchStudent = async () => {
    if (!rut) {
      Alert.alert('Error', 'Por favor ingrese el RUT del estudiante');
      return;
    }

    try {
      const response = await searchStudentByRut(rut);

      if (!response.success) {
        Alert.alert('Error', response.message || 'Estudiante no encontrado');
        return;
      }

      // Si es exitoso, guarda los datos en el contexto
      const withdrawalData = {
        student: response.data.student,
        authorizedParent: response.data.authorizedParent,
        withdrawalReason: {
          reasonId: selectedReasonId,
          reasonName: reasons.find((reason) => reason.id === selectedReasonId)?.name || '',
          customReason: selectedReasonId && reasons.find((reason) => reason.id === selectedReasonId)?.name.startsWith('OTRO')
            ? customReason
            : ''
        }
      };

      setData(withdrawalData); // Guardar los datos en el contexto

      // Redirigir a la pantalla de autorización
      router.push('/autorizacionRetiroManual');

    } catch (error) {
      Alert.alert('Error', 'Hubo un error al buscar el estudiante');
      console.error('Error en la búsqueda del estudiante:', error); // Log del error
    }
  };

  // Lógica para seleccionar un motivo
  const handleSelectReason = (id: number, name: string) => {
    setSelectedReasonId(id);
    if (name.startsWith('OTRO')) {
      setCustomReason(''); // Limpiar el campo de texto cuando se selecciona 'OTRO'
    }
  };

  // Validación para habilitar el botón "Continuar"
  const isContinueButtonDisabled = () => {
    return !rut.trim() || !selectedReasonId || (selectedReasonId && reasons.find(reason => reason.id === selectedReasonId)?.name.startsWith('OTRO') && !customReason.trim());
  };

  return (
    <GlobalBackground>
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 items-center justify-start px-5 py-8">

            <Text className="text-2xl font-bold text-blue-700 mb-3">Retiro manual</Text>
            <Text className="text-gray-400 text-center mt-1 mb-6">Ingrese los siguientes datos para realizar la autorización</Text>

            {/* Sección de Inputs */}
            <View className="space-y-4 w-full">
               {/* Input de RUT */}
              <Text className="text-xs font-semibold text-gray-500 mb-1 ml-1">RUT</Text>
              <RutInput
                value={rut}
                onChangeText={setRut}
                placeholder="12.345.678-9"
                className="bg-white p-4 rounded-lg border border-gray-200"
              />

            {/* Mostrar las opciones de motivo de retiro */}
            <View className="mt-6 w-full">
              <Text className="text-xs font-semibold text-gray-500 mb-2">Motivos de Retiro</Text>

              {/* Comprobación de carga */}
              {loadingReasons ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {/* Comprobamos que `reasons` esté inicializado y tenga datos antes de usar `map` */}
                  {Array.isArray(reasons) && reasons.length > 0 ? (
                    reasons.map((reason) => {
                      return (
                        <View key={reason.id} className="mr-4">
                          <SelectOptionButton
                            label={reason.name || 'Motivo no disponible'}
                            isSelected={selectedReasonId === reason.id}
                            onPress={() => handleSelectReason(reason.id, reason.name || 'Motivo desconocido')}
                          />
                        </View>
                      );
                    })
                  ) : (
                    <Text className="text-gray-500">No hay motivos disponibles</Text>
                  )}
                </ScrollView>
              )}
            </View>

            {/* Mostrar el input de "OTRO" si se selecciona esa opción */}
              {selectedReasonId && reasons.find(reason => reason.id === selectedReasonId)?.name?.startsWith('OTRO') && (
                <View className="w-full mt-4 px-4">
                  <TextInput
                    placeholder="Escriba el motivo aquí..."
                    value={customReason}
                    onChangeText={setCustomReason}
                    className="border p-4 rounded-lg"
                    multiline
                  />
                </View>
              )}

              {/* Botón para buscar al estudiante */}
              <View className="flex-1 justify-center items-center p-4">
                <View className="w-1/2">
                  <PrimaryButton
                    title="Continuar"
                    onPress={handleSearchStudent}
                    disabled={isContinueButtonDisabled()}  // Habilitar/deshabilitar el botón
                  />
                </View>
              </View>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </GlobalBackground>
  );
}
