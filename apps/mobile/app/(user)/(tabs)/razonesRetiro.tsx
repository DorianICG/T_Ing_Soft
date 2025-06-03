import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';

import GlobalBackground from '@/components/layout/GlobalBackground'; 
import SelectOptionButton from '@/components/ui/buttons/SelectOptionButton'; 
import PrimaryButton from '@/components/ui/buttons/PrimaryButton';

import { useAppContext } from '@/context/AppContext';
import { router } from 'expo-router';

import { fetchWithdrawalReasons } from '@/services/withdrawals/parent';

import { useFocusEffect } from '@react-navigation/native';  // <-- Importar

export default function razonesRetiroScreen() {
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [reasons, setReasons] = useState<{ id: number; name: string; description: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const { setData } = useAppContext();

  useEffect(() => {
    const loadReasons = async () => {
      try {
        const data = await fetchWithdrawalReasons();
        setReasons(data);
      } catch (error) {
        console.error('Error al cargar razones de retiro:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReasons();
  }, []);

  // Limpiar selección y texto cuando se pierde el foco
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setSelectedReason(null);
        setCustomReason('');
      };
    }, [])
  );

  const handleContinue = () => {
    if (selectedReason) {
      const selected = reasons.find(r => r.name === selectedReason);

      if (selectedReason.startsWith('OTRO')) {
        if (!customReason.trim()) return;

        const otro = reasons.find(r => r.name.startsWith('OTRO'));
        setData((prevData: any) => ({
          ...prevData,
          razonSeleccionada: {
            id: otro?.id ?? 0,
            descripcion: customReason.trim(),
          },
        }));
      } else if (selected) {
        setData((prevData: any) => ({
          ...prevData,
          razonSeleccionada: {
            id: selected.id,
            descripcion: selected.name,
          },
        }));
      }

      router.push('/generarRetiro');
    }
  };

  return (
    <GlobalBackground>
      <View className="flex-1 justify-center items-center px-5 max-w-[400px] mx-auto w-full">
        <Text className="text-xl font-bold text-blue-600 mb-4 text-center">
          ¿Por qué se retirará al alumno?
        </Text>

        <View className="w-full mb-4 max-h-56">
          {loading ? (
            <Text className="text-center text-gray-500">Cargando razones...</Text>
          ) : reasons.length === 0 ? (
            <Text className="text-center text-red-500">Ha ocurrido un error, inténtelo más tarde.</Text>
          ) : (
            <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
              {reasons.map((razon, index) => (
                <View key={razon.id} style={{ marginBottom: index === reasons.length - 1 ? 0 : 16 }}>
                  <SelectOptionButton
                    label={razon.name}
                    isSelected={selectedReason === razon.name}
                    onPress={() => {
                      setSelectedReason(razon.name);
                      if (!razon.name.startsWith('OTRO')) setCustomReason('');
                    }}
                  />
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {selectedReason?.startsWith('OTRO') && (
          <View className="w-full mb-4 px-2">
            <TextInput
              className="border border-gray-300 rounded-md p-2 text-base"
              placeholder="Escriba la razón aquí..."
              value={customReason}
              onChangeText={setCustomReason}
              multiline
              numberOfLines={2}
              autoFocus
              style={{ maxHeight: 60 }}
            />
          </View>
        )}

        <View className="w-full px-4">
          <View className="max-w-[320px] w-full mx-auto">
            <PrimaryButton
              title="Continuar"
              disabled={
                !selectedReason || 
                (selectedReason?.startsWith('OTRO') && customReason.trim() === '')
              }
              onPress={handleContinue}
            />
          </View>
        </View>
      </View>
    </GlobalBackground>
  );
}
