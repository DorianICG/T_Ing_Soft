import OptionButton from '@/components/ui/HomeButtons';
import { ScrollView, Text } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <GlobalBackground>
      <ScrollView className="flex-1 p-6 pt-10">
        <Text className="text-2xl font-bold text-blue-700 mb-3">Principal</Text>
        <OptionButton
          title="Generar Retiro"
          onPress={() => router.push('/generarRetiro')}
        />
        <Text className="text-2xl font-bold text-blue-700 mb-3 mt-6">Opciones</Text>
        <OptionButton
          title="Mis Alumnos"
          onPress={() => router.push('/misAlumnos')}
        />
        <OptionButton
          title="Mis Delegados" 
          onPress={() => router.push('/misDelegados')}
        />
        <OptionButton
          title="Historial de Retiros"
          onPress={() => router.push('/historialRetiros')}
        />
        <OptionButton
          title="Notificaciones"
          onPress={() => router.push('/notificaciones')}
          containerClassName="mb-0" 
        />
      </ScrollView>
    </GlobalBackground>
  );
}
