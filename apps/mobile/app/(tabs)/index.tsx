import OptionButton from '@/components/ui/HomeButtons';
import { ScrollView, Text } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { useRouter } from 'expo-router';



export default function HomeScreen() {
  const router = useRouter();
  return (
    <GlobalBackground>
      {/*Contenedor Principal tipo Scroll*/}
      <ScrollView className="flex-1 p-6 pt-10">

        {/*Sección principal*/}
        <Text className="text-2xl font-bold text-blue-700 mb-3">Principal</Text>

        <OptionButton
          title="Generar QR"
          onPress={() => router.navigate('/generarRetiro')}
        />
        <OptionButton
          title="Validar Retiro"
          onPress={() => router.navigate('/validarRetiro')}
        />
        
        {/*Sección Opciones*/}
        <Text className="text-2xl font-bold text-blue-700 mb-3 mt-6">Opciones</Text>

        <OptionButton
          title="Mis Alumnos"
          onPress={() => router.navigate('/misAlumnos')}
        />
        <OptionButton
          title="Mis Delegados" 
          onPress={() => router.navigate('/misDelegados')}
        />
        <OptionButton
          title="Historial de Retiros"
          onPress={() => router.navigate('/historialRetiros')}
        />
        <OptionButton
          title="Notificaciones"
          onPress={() => router.navigate('/notificaciones')}
          containerClassName="mb-0" 
        />

        <OptionButton
          title="Generar Retiro"
          onPress={() => router.navigate('/retiro')}
          containerClassName="mb-0" 
        />
      </ScrollView>
    </GlobalBackground>
  );
}
