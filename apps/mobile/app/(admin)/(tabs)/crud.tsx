import { Text, View, StyleSheet } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { useRouter } from 'expo-router';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import GenericDataTable from '@/components/ui/tables/genericDataTable';
import RoundedIconButton from '@/components/ui/buttons/IconButtonSimple';

export default function CRUDScreen() {
  const router = useRouter();

  //datos de prueba
const data = [
  {
    nombre: 'Alexxx',
    apellido: 'Tintor',
    rut: '1111111-1',
    telefono: '912345678',
    password: 'pepito123',
  },
  {
    nombre: 'Camila',
    apellido: 'Rojas',
    rut: '2222222-2',
    telefono: '987654321',
    password: 'camila456',
  },
  {
    nombre: 'Alexxx',
    apellido: 'Tintor',
    rut: '1111111-1',
    telefono: '912345678',
    password: 'pepito123',
  },
  {
    nombre: 'Camila',
    apellido: 'Rojas',
    rut: '2222222-2',
    telefono: '987654321',
    password: 'camila456',
  },
];

const fields = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
  { key: 'rut', label: 'RUT' },
  { key: 'telefono', label: 'Teléfono' },
];

  return (
<GlobalBackground>
  <View style={styles.container}>

    {/* Sección superior: título + botones */}
    <View style={styles.topSection}>
      <Text style={styles.title}>Gestión de datos</Text>

      {/* Fila de botones funcionales */}
      <View style={styles.buttonRow}>
        <View style={styles.buttonWrapper}>
          <SecondaryButton title="Estudiantes" onPress={() => router.push('/home')} />
        </View>
        <View style={styles.buttonWrapper}>
          <SecondaryButton title="--" onPress={() => router.push('/home')} disabled />
        </View>
        <View style={styles.buttonWrapper}>
          <SecondaryButton title="--" onPress={() => router.push('/home')} disabled />
        </View>
        <View style={styles.buttonWrapper}>
          <SecondaryButton title="--" onPress={() => router.push('/home')} disabled />
        </View>
      </View>
    </View>

    {/* Sección inferior: tabla + botones icono */}
    <View style={styles.bottomSection}>
      
      {/* Tabla */}
      <View style={styles.tableSection}>
        <GenericDataTable
          data={data}
          fields={fields}
          onEdit={(item) => alert('Editar: ' + item.nombre)}
          onDelete={(item) => alert('Eliminar: ' + item.nombre)}
        />
      </View>

      {/* IconButtons con texto */}
      <View style={styles.buttonRowBottom}>
        <View style={styles.buttonItem}>
          <RoundedIconButton icon="document-outline" onPress={() => alert('Inicio')} />
          <Text style={styles.buttonText}>Cargar Archivo</Text>
        </View>
        <View style={styles.buttonItem}>
          <RoundedIconButton icon="add-outline" onPress={() => alert('Perfil')} />
          <Text style={styles.buttonText}>Añadir Dato</Text>
        </View>
        <View style={styles.buttonItem}>
          <RoundedIconButton icon="server-outline" onPress={() => alert('Ajustes')} />
          <Text style={styles.buttonText}>Carga Masiva</Text>
        </View>
      </View>
    </View>

  </View>
</GlobalBackground>

  );
}

//estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Contenedor superior: título + botones de acción
  topSection: {
    paddingTop: 32,
    paddingBottom: 16,
    alignItems: 'center',
  },

  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 8,
    paddingHorizontal: 8,
  },

  buttonWrapper: {
    flex: 1,
  },

  // Contenedor inferior: tabla + botones de iconos
  bottomSection: {
    flex: 1,
    justifyContent: 'space-between',

  },

  tableSection: {
    flex: 1,
    maxHeight: 400,
    justifyContent: 'center',
    overflow: 'hidden',
  },

  buttonRowBottom: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    padding: 2,

  },

  buttonItem: {
    alignItems: 'center',
    flex: 1,
  },

  buttonText: {
    marginTop: 6,
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

