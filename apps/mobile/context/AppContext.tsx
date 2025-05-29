// Contexto para almacenado de datos custom dentro de la app
import React, { createContext, useState, useContext } from 'react';

// Interfaz del contexto
interface AppContextProps {
  data: any; //Recibe cualquier tipo de dato
  setData: (data: any) => void;
}

// Creado de contexto
export const AppContext = createContext<AppContextProps | undefined>(undefined);

// Proveedor del contexto
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<any>({});

  return (
    <AppContext.Provider value={{ data, setData }}>
      {children}
    </AppContext.Provider>
  );
}

// Uso de contexto
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de un AppProvider');
  }
  return context;
}