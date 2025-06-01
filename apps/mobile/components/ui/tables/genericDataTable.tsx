import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  LayoutChangeEvent,
} from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';

// Interfaz para describir un campo de la tabla
interface Field {
  key: string;           // clave del campo, debe coincidir con la propiedad del objeto
  label: string;         // etiqueta visible del campo
  visible?: boolean;     // si el campo debe mostrarse o no (opcional)
}

// Props genéricas del componente
interface GenericTableProps<T> {
  data: T[];                   // lista de objetos a mostrar
  fields: Field[];            // definición de columnas (campos visibles)
  onEdit?: (item: T) => void; // función opcional para editar un ítem
  onDelete?: (item: T) => void; // función opcional para eliminar un ítem
}

// Componente principal
function GenericTable<T extends object>({
  data,
  fields,
  onEdit,
  onDelete,
}: GenericTableProps<T>) {
  // Estado animado para manejar el scroll vertical
  const scrollY = useRef(new Animated.Value(0)).current;

  // Altura total del contenido de la lista
  const [contentHeight, setContentHeight] = useState(1);

  // Altura del contenedor visible de la lista
  const [containerHeight, setContainerHeight] = useState(1);

  // Renderiza cada fila de datos
  const renderItem = ({ item, index }: { item: T; index: number }) => (
    <View style={styles.row}>
      {/* Columna número de fila */}
      <View style={[styles.cell, styles.cellNum]}>
        <Text>{index + 1}</Text>
      </View>

      {/* Columna de datos */}
      <View style={[styles.cell, styles.cellData]}>
        <View style={styles.card}>
          {fields
            .filter((f) => f.visible !== false) // Solo muestra los campos visibles
            .map((field) => (
              <Text key={field.key}>
                <Text style={styles.label}>{field.label}:</Text>{' '}
                {/* @ts-ignore para evitar error de acceso dinámico */}
                {item[field.key]?.toString() || ''}
              </Text>
            ))}
        </View>
      </View>

      {/* Columna de acciones (editar/eliminar) */}
      <View style={[styles.cell, styles.cellActions]}>
        {onEdit && (
          <TouchableOpacity onPress={() => onEdit(item)}>
            <MaterialIcons name="edit" size={24} color="#2196F3" />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(item)} style={{ marginTop: 12 }}>
            <FontAwesome name="trash" size={20} color="#F44336" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // Cálculo de la altura de la barra de scroll personalizada
  const scrollBarHeight =
    contentHeight > containerHeight
      ? (containerHeight * containerHeight) / contentHeight
      : containerHeight;

  // Cálculo de la posición vertical de la barra de scroll
  const scrollBarTranslateY = scrollY.interpolate({
    inputRange: [0, Math.max(1, contentHeight - containerHeight)],
    outputRange: [0, Math.max(1, containerHeight - scrollBarHeight)],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        {/* Encabezado de la tabla */}
        <View style={[styles.row, styles.headerRow]}>
          <View style={[styles.cell, styles.cellNum]}>
            <Text style={styles.headerText}>N°</Text>
          </View>
          <View style={[styles.cell, styles.cellData]}>
            <Text style={styles.headerText}>Datos</Text>
          </View>
          <View style={[styles.cell, styles.cellActions]}>
            <Text style={styles.headerText}>Acciones</Text>
          </View>
        </View>

        {/* Lista de datos */}
        <View
          style={styles.listContainer}
          onLayout={(e: LayoutChangeEvent) =>
            setContainerHeight(e.nativeEvent.layout.height)
          }
        >
          <FlatList
            data={data}
            keyExtractor={(_, index) => index.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={(_, height) => setContentHeight(height)}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={16}
          />

          {/* Barra de scroll personalizada */}
          {contentHeight > containerHeight && (
            <Animated.View
              style={[
                styles.scrollIndicator,
                {
                  height: scrollBarHeight,
                  transform: [{ translateY: scrollBarTranslateY }],
                },
              ]}
            />
          )}
        </View>
      </View>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, maxWidth: '100%' },
  table: {
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    width: '100%',
    flex: 1,
  },
  listContainer: {
    flex: 1,
    position: 'relative',
  },
  headerRow: { backgroundColor: '#e0e0e0' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ddd' },
  cell: { padding: 12, justifyContent: 'center' },
  cellNum: { width: 30, alignItems: 'center' },
  cellData: { flex: 1 },
  cellActions: { width: 60, alignItems: 'center' },
  headerText: { fontWeight: 'bold' },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#eee',
  },
  label: { fontWeight: 'bold' },
  scrollIndicator: {
    position: 'absolute',
    width: 6,
    right: 2,
    top: 0,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export default GenericTable;
