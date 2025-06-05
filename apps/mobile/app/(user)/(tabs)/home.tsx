import OptionButton from '@/components/ui/HomeButtons';
import { ScrollView, Text } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import { FontAwesome5 } from '@expo/vector-icons';



export default function HomeScreen() {
  const router = useRouter();
  return (
    <GlobalBackground>
      {/*Contenedor Principal tipo Scroll*/}
      <ScrollView className="flex-1 p-6 pt-10">

        {/*Sección principal*/}
        <Text className="text-2xl font-bold text-blue-700 mb-3">Principal</Text>

      <OptionButton
        title="Generar Retiro"
        onPress={() => router.navigate('/retiro')}
        icon={<Ionicons name="qr-code-outline" size={30} color="#1D4ED8" />}
      />

        
        {/*Sección Opciones*/}
        <Text className="text-2xl font-bold text-blue-700 mb-3 mt-6">Opciones</Text>

        <OptionButton
          title="Mi perfil" 
          onPress={() => router.navigate('/perfil')}
          icon={<Ionicons name="person" size={30} color="#1D4ED8" />} 
        />

        <OptionButton
          title="Mis Alumnos"
          onPress={() => router.navigate('/misAlumnos')}
          icon={<FontAwesome5 name="graduation-cap" size={30} color="#1D4ED8" />}
        />


        <OptionButton
          title="Historial de Retiros"
          onPress={() => router.navigate('/historialRetiros')}
          icon={<Ionicons name="time-outline" size={30} color="#1D4ED8" />}
        />


      </ScrollView>
    </GlobalBackground>
  );
}
