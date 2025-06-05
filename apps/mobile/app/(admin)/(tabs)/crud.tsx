
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import GenericDataTable from '@/components/ui/tables/genericDataTable';
import RoundedIconButton from '@/components/ui/buttons/IconButtonSimple';
import { getUsers } from '@/services/CRUD/adminUsers';
import { getStudents } from '@/services/CRUD/adminStudents';
import { getCourses } from '@/services/CRUD/adminCourses';
import { useRouter } from 'expo-router';
import { useAppContext } from '@/context/AppContext';
import { useRef } from 'react';
import { useFiltersContext } from '@/context/FiltersContext';


export default function CRUDScreen() {
  const [activeSection, setActiveSection] = useState<'alumnos' | 'usuarios' | 'cursos'>('alumnos');
const hasFetchedOnFocus = useRef(false);
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  const router = useRouter();
const cleanedFilters = useRef(false);

const { data, setData } = useAppContext();

const { filters, setFilters } = useFiltersContext();


  // Estado para datos a cargar
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [usuariosData, setUsuariosData] = useState<any[]>([]);
  const [cursosData, setCursosData] = useState<any[]>([]);

  // Estados de carga
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extrae la función de fetch para reutilizarla
const fetchData = async (customFilters: any = null) => {
  setIsLoading(true);
  setError(null);

  const appliedFilters = customFilters || filters || { page: 1, limit: 100 };

  try {
    if (activeSection === 'usuarios') {
      const response = await getUsers(appliedFilters);
      const datosTabla = response.users.map((usuario: any) => ({
        id: usuario.id,
        nombreCompleto: `${usuario.firstName} ${usuario.lastName}`,
        rut: usuario.rut,
        email: usuario.email,
        telefono: usuario.phone,
        estado: usuario.isActive ? 'Activo' : 'Inactivo',
        rol: usuario.roles?.[0]?.name || 'Sin rol',
        organizacion: usuario.roles?.[0]?.organizationName || 'Sin organización',
        rawData: usuario,
      }));
      setUsuariosData(datosTabla);
    } else if (activeSection === 'alumnos') {
      const response = await getStudents(appliedFilters);
      const datosTabla = response.students.map((student: any) => ({
        id: student.id,
        rut: student.rut,
        nombreCompleto: `${student.firstName} ${student.lastName}`,
        birthDate: student.birthDate,
        curso: student.course?.name || 'Sin curso',
        rutApoderado: student.parent?.rut || 'Sin RUT',
        nombreApoderado: student.parent
          ? `${student.parent.firstName} ${student.parent.lastName}`
          : 'Sin apoderado',
        telefonoApoderado: student.parent?.phone || 'Sin teléfono',
        emailApoderado: student.parent?.email || 'Sin email',
        organizacion: student.organization?.name || 'Sin organización',
        rawData: student,
      }));
      setStudentsData(datosTabla);
    } else if (activeSection === 'cursos') {
      const response = await getCourses(appliedFilters);
      const datosTabla = response.courses.map((curso: any) => ({
        id: curso.id,
        nombre: curso.name,
        organizacion: curso.organization?.name || 'Sin organización',
        rawData: curso,
      }));
      setCursosData(datosTabla);
    }
  } catch (err: any) {
    console.error(` Error al cargar ${activeSection}:`, err);
    setError(err.message || 'Error desconocido');
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    // Limpia filtros al cambiar sección
    setFilters({});
  }, [activeSection]);


useEffect(() => {
  if (data && data.filters && Object.keys(data.filters).length > 0) {
    setFilters(data.filters);
  }
}, [data?.filters]);


  // Al usar useFocusEffect, se ejecuta cada vez que la pantalla se enfoca
useFocusEffect(
  useCallback(() => {
    const cargarDatos = async () => {
      setIsReadyToRender(false);

      if (filters && Object.keys(filters).length > 0) {
        console.log('Ejecutando búsqueda personalizada con filtros:', filters);
        await fetchData(filters);
      } else {
        console.log('Cargando datos normalmente (sin filtros).');
        await fetchData();
      }

      setIsReadyToRender(true);
    };

    cargarDatos();
  }, [activeSection, filters])
);






const handleDeletePress = (item: any) => {
  setData({
    rawData: item.rawData,
    section: activeSection,  
  });
  router.push('/crud-delete');
};



  
const handleEditPress = (item: any) => {
  setData(item.rawData);

    // Redireccionar según sección activa
    if (activeSection === 'alumnos') {
      router.push('/crud-edit-student');
    } else if (activeSection === 'usuarios') {
      router.push('/crud-edit-user');
    } else if (activeSection === 'cursos') {
      router.push('/crud-edit-course');
    }
  };

  const handleBulkUploadPress = () => {
    setData({ section: activeSection }); // guardamos sección para saber qué CSV se subirá
    router.push('/crud-add-bulk'); // ruta donde estará la pantalla CSVUploadScreen
  };

  // Datos de configuración por sección
  const sectionsData = {
    alumnos: {
      tableFields: [
        { key: 'nombreCompleto', label: 'Nombre completo' },
        { key: 'curso', label: 'Curso' },
        { key: 'rut', label: 'RUT' },
        { key: 'nombreApoderado', label: 'Nombre Apoderado' },
        { key: 'rutApoderado', label: 'RUT Apoderado' },
      ],
      data: studentsData,
      onEdit: handleEditPress,
      onDelete: handleDeletePress,
    },
    usuarios: {
      tableFields: [
        { key: 'nombreCompleto', label: 'Nombre completo' },
        { key: 'rut', label: 'RUT' },
        { key: 'email', label: 'Email' },
        { key: 'telefono', label: 'Teléfono' },
        { key: 'estado', label: 'Estado' },
        { key: 'rol', label: 'Rol' },
        { key: 'organizacion', label: 'Organización' },
      ],
      data: usuariosData,
      onEdit: handleEditPress,
      onDelete: handleDeletePress,
    },
    cursos: {
      tableFields: [
        { key: 'nombre', label: 'Nombre' },
      ],
      data: cursosData,
      onEdit: handleEditPress,
      onDelete: handleDeletePress,
    },
  };

  const currentData = sectionsData[activeSection];

  return (
    <GlobalBackground>
      <View style={styles.container}>
        {/* Encabezado */}
        <View style={styles.topSection}>
          <Text style={styles.title}>Gestión de datos</Text>
          <View style={styles.buttonRow}>
            <SecondaryButton
              title="Alumnos"
              onPress={() => setActiveSection('alumnos')}
              disabled={activeSection === 'alumnos'}
            />
            <SecondaryButton
              title="Usuarios"
              onPress={() => setActiveSection('usuarios')}
              disabled={activeSection === 'usuarios'}
            />
            <SecondaryButton
              title="Cursos"
              onPress={() => setActiveSection('cursos')}
              disabled={activeSection === 'cursos'}
            />
          </View>
        </View>

        {/* Contenido */}
        <View style={styles.bottomSection}>
          <View style={styles.tableSection}>
          {isReadyToRender ? (
            <GenericDataTable
              fields={sectionsData[activeSection].tableFields}
              data={sectionsData[activeSection].data}
              onEdit={sectionsData[activeSection].onEdit}
              onDelete={sectionsData[activeSection].onDelete}
            />
          ) : (
            <Text className="text-center mt-10 text-gray-500">Cargando datos...</Text>
          )}

          </View>

          {!isLoading && !error && (
            <View style={styles.buttonRowBottom}>
              {activeSection === 'alumnos' && (
                <>
                  <View style={styles.buttonItem}>
                    <RoundedIconButton icon="search-outline" onPress={() => router.push('/crud-search-student')} />
                    <Text style={styles.buttonText}>Buscar Alumno</Text>
                  </View>
                  <View style={styles.buttonItem}>
                    <RoundedIconButton icon="add-outline" onPress={() => router.push('/crud-add-student')} />
                    <Text style={styles.buttonText}>Agregar Alumno</Text>
                  </View>
                  <View style={styles.buttonItem}>
                    <RoundedIconButton icon="server-outline" onPress={handleBulkUploadPress} />
                    <Text style={styles.buttonText}>Carga Masiva</Text>
                  </View>
                </>
              )}

              {activeSection === 'usuarios' && (
              <>
                  <View style={styles.buttonItem}>
                    <RoundedIconButton icon="search-outline" onPress={() => router.push('/crud-search-user')} />
                    <Text style={styles.buttonText}>Buscar Usuario</Text>
                  </View>
                <View style={styles.buttonItem}>
                  <RoundedIconButton icon="add-outline" onPress={() => router.push('/crud-add-user')} />
                  <Text style={styles.buttonText}>Añadir Usuario</Text>
                </View>
                  <View style={styles.buttonItem}>
                    <RoundedIconButton icon="server-outline" onPress={handleBulkUploadPress} />
                    <Text style={styles.buttonText}>Carga Masiva</Text>
                  </View>                
              </>
              )}

              {activeSection === 'cursos' && (
              <>
                  <View style={styles.buttonItem}>
                    <RoundedIconButton icon="search-outline" onPress={() => router.push('/crud-search-course')} />
                    <Text style={styles.buttonText}>Buscar Curso</Text>
                  </View>
                <View style={styles.buttonItem}>
                  <RoundedIconButton icon="add-outline" onPress={() => router.push('/crud-add-course')} />
                  <Text style={styles.buttonText}>Añadir Curso</Text>
                </View>
                  <View style={styles.buttonItem}>
                    <RoundedIconButton icon="server-outline" onPress={handleBulkUploadPress} />
                    <Text style={styles.buttonText}>Carga Masiva</Text>
                  </View>      
              </>
              )}
            </View>
          )}
        </View>
      </View>
    </GlobalBackground>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
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
