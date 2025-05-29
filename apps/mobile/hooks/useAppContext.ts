import { useContext } from 'react';
import { AppContext } from '@/context/AppContext';

//Hook para utilizar contexto (datos)
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider');
  }
  return context;
}