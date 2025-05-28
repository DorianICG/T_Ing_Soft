import OptionButton from '@/components/ui/HomeButtons';
import { ScrollView, Text } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  return (
    <GlobalBackground>
      <ScrollView className="flex-1 p-6 pt-10">
        <Text className="text-2xl font-bold text-blue-700 mb-3 mt-6">Opciones</Text>
        <OptionButton
          title="Generar Retiro"
          onPress={() => router.navigate('/manual-entry')}
        />
        <OptionButton
          title="Mis Alumnos"
          onPress={() => router.navigate('/scanner')}
        />
      </ScrollView>
    </GlobalBackground>
  );
}
