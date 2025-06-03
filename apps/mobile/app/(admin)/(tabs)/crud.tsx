import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import GlobalBackground from '@/components/layout/GlobalBackground';
import { useRouter } from 'expo-router';
import SecondaryButton from '@/components/ui/buttons/SecondaryButton';
import GenericDataTable from '@/components/ui/tables/genericDataTable';
import RoundedIconButton from '@/components/ui/buttons/IconButtonSimple';
import ConfirmModal from '@/components/ui/alerts/ConfirmModal';
import FormModal from '@/components/ui/alerts/FormModal';
import DynamicForm from '@/components/ui/input/DynamicForm';

export default function CRUDScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'alumnos' | 'usuarios' | 'cursos'>('alumnos');

  // Set de modal eliminar
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const handleDeletePress = (item: any) => {
    setItemToDelete(item);
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      console.log('Eliminar:', itemToDelete);
      // Aquí va la lógica real de eliminación, como actualizar el estado o llamar a la API
      setDeleteModalVisible(false);
      setItemToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  // set modal editar
  const [isEditMode, setIsEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<any>(null);
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});

const handleEditPress = (item: any) => {
  setIsEditMode(true);
  setItemToEdit(item);
  setFormValues({ ...item });
  setEditModalVisible(true);
};

  const handleFormChange = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

const handleAddPress = () => {
  setIsEditMode(false);
  setItemToEdit(null);
  
  // Crear objeto vacío según los campos visibles
  const emptyValues: { [key: string]: string } = {};
  currentData.fields.forEach((field) => {
    emptyValues[field.key] = '';
  });

  setFormValues(emptyValues);
  setEditModalVisible(true);
};


  const sectionsData = {
    alumnos: {
      data: [
        {
          rut: '41198621-7',
          firstName: 'ELENA',
          lastName: 'REBOLLEDO',
          birthDate: '2012-04-03',
          courseId: '1',
          parentRut: '20963471-6',
        },
        {
          rut: '22222222-2',
          firstName: 'ALEX',
          lastName: 'PÉREZ',
          birthDate: '2011-06-15',
          courseId: '2',
          parentRut: '19384756-9',
        },
      ],
      fields: [
        { key: 'rut', label: 'RUT' },
        { key: 'firstName', label: 'Nombre' },
        { key: 'lastName', label: 'Apellido' },
        { key: 'birthDate', label: 'Fecha de nacimiento' },
        { key: 'courseId', label: 'ID del Curso' },
        { key: 'parentRut', label: 'RUT Apoderado' },
      ],
      onEdit: handleEditPress,
      onDelete: handleDeletePress,
    },
    usuarios: {
      data: [
        { nombre: 'Admin', rol: 'Administrador', correo: 'admin@demo.com' },
      ],
      fields: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'rol', label: 'Rol' },
        { key: 'correo', label: 'Correo' },
      ],
      onEdit: handleEditPress,
      onDelete: handleDeletePress,
    },
    cursos: {
      data: [
        { curso: 'Matemáticas', codigo: 'MAT101', profesor: 'Juan Pérez' },
      ],
      fields: [
        { key: 'curso', label: 'Curso' },
        { key: 'codigo', label: 'Código' },
        { key: 'profesor', label: 'Profesor' },
      ],
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
            <View style={styles.buttonWrapper}>
              <SecondaryButton
                title="Alumnos"
                onPress={() => setActiveSection('alumnos')}
                disabled={activeSection === 'alumnos'}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <SecondaryButton
                title="Usuarios"
                onPress={() => setActiveSection('usuarios')}
                disabled={activeSection === 'usuarios'}
              />
            </View>
            <View style={styles.buttonWrapper}>
              <SecondaryButton
                title="Cursos"
                onPress={() => setActiveSection('cursos')}
                disabled={activeSection === 'cursos'}
              />
            </View>
          </View>
        </View>

        {/* Contenido */}
        <View style={styles.bottomSection}>
          <View style={styles.tableSection}>
            <GenericDataTable
              data={currentData.data}
              fields={currentData.fields}
              onEdit={currentData.onEdit}
              onDelete={currentData.onDelete}
            />
          </View>

          <View style={styles.buttonRowBottom}>
            {activeSection === 'alumnos' && (
              <>
                <View style={styles.buttonItem}>
                  <RoundedIconButton icon="document-outline" onPress={() => alert('Cargar archivo de alumnos')} />
                  <Text style={styles.buttonText}>Cargar Archivo</Text>
                </View>
                <View style={styles.buttonItem}>
                  <RoundedIconButton icon="add-outline" onPress={handleAddPress}  />
                  <Text style={styles.buttonText}>Agregar Alumno</Text>
                </View>
                <View style={styles.buttonItem}>
                  <RoundedIconButton icon="server-outline" onPress={() => alert('Carga masiva')} />
                  <Text style={styles.buttonText}>Carga Masiva</Text>
                </View>
              </>
            )}

            {activeSection === 'usuarios' && (
              <View style={styles.buttonItem}>
                <RoundedIconButton icon="add-outline" onPress={handleAddPress}  />
                <Text style={styles.buttonText}>Añadir Usuario</Text>
              </View>
            )}

            {activeSection === 'cursos' && (
              <View style={styles.buttonItem}>
                <RoundedIconButton icon="add-outline" onPress={handleAddPress}  />
                <Text style={styles.buttonText}>Añadir Curso</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Sección modales */}

      {/* ConfirmModal */}
        <ConfirmModal
          visible={deleteModalVisible}
          message={`¿Estás seguro de que deseas eliminar a ${itemToDelete?.nombre || 'este elemento'}?`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />

      {/* ConfirmModal */}
<FormModal
  visible={editModalVisible}
  title={isEditMode ? `Editar ${itemToEdit?.firstName || 'registro'}` : 'Añadir nuevo'}
  footer={
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
      <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCancel}>
        <Text>Cancelar</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          if (isEditMode) {
            console.log('Guardando edición:', formValues);
            // lógica de edición real aquí
          } else {
            console.log('Añadiendo nuevo dato:', formValues);
            // lógica de creación real aquí
          }
          setEditModalVisible(false);
          setItemToEdit(null);
        }}
        style={styles.modalConfirm}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          {isEditMode ? 'Guardar' : 'Añadir'}
        </Text>
      </TouchableOpacity>
    </View>
  }
>
  <DynamicForm
    fields={currentData.fields}
    values={formValues}
    onChange={handleFormChange}
    editableKeys={
      isEditMode && activeSection === 'alumnos'
        ? ['firstName', 'lastName', 'courseId'] // los únicos permitidos para edición de alumnos
        : undefined // todos los campos para nuevo registro
    }
  />
</FormModal>




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
  buttonWrapper: {
    flex: 1,
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

modalCancel: {
  padding: 10,
  backgroundColor: '#ccc',
  borderRadius: 8,
  marginRight: 8,
},
modalConfirm: {
  padding: 10,
  backgroundColor: '#007bff',
  borderRadius: 8,
},
input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 6,
  padding: 8,
  marginTop: 4,
},

});
