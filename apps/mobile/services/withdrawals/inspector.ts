//AQUI SE ALOJAN TODOS LAS APIS QUE UTILIZA INSPECTOR PARA RECOLECCION DE DATOS
import { API_BASE_URL } from '../api';
import { getToken } from '../authStorage';

const getAuthHeaders = async () => {
  const token = await getToken('user-permanent-token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Función Obtener la info de un qr
export const getQrInfo = async (qrCode: string) => {
  const response = await fetch(`${API_BASE_URL}/withdrawals/inspector/qr/${encodeURIComponent(qrCode)}/info`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Error al obtener información del QR');
  return json.data;
};

// Función para procesar un QR
export const processQrDecision = async (qrCode: string, action: 'APPROVE' | 'DENY') => {
  const response = await fetch(`${API_BASE_URL}/withdrawals/inspector/qr/process`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ qrCode, action }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Error procesando la decisión del QR');
  return json.data;
};

// Función para autorizar manualmente un retiro sin QR
export const authorizeManualWithdrawal = async (
  studentId: string,
  reasonId: string,
  customReason: string | null
) => {
  const response = await fetch(`${API_BASE_URL}/withdrawals/inspector/authorize-manual`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({
      studentId,
      reasonId,
      customReason,
    }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Error autorizando el retiro manual');
  return json.data;
};

// Función para obtener la información del estudiante por RUT
export const searchStudentByRut = async (rut: string) => {
  const response = await fetch(`${API_BASE_URL}/withdrawals/inspector/student/${encodeURIComponent(rut)}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();

  // Si la respuesta no es exitosa, lanza un error con el mensaje
  if (!response.ok) throw new Error(json.message || 'Error al buscar el estudiante');
  
  // Retornar la respuesta completa para acceder a todos los datos
  return json;
};


// Función para obtener los motivos de retiro
export const getWithdrawalReasons = async () => {
  const response = await fetch(`${API_BASE_URL}/withdrawals/inspector/reasons`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();
  
  // Si la respuesta no es exitosa o no tiene datos, lanzamos un error
  if (!response.ok || !json.data || json.data.length === 0) {
    throw new Error(json.message || 'No se encontraron motivos de retiro');
  }
  
  return json.data;
};


// Función para obtener datos historial
export const fetchInspectorWithdrawalHistory = async (filters: {
  studentId?: number;
  studentRut?: string;
  status?: string;
  method?: string;
  approverId?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}) => {
  const params = new URLSearchParams();

  if (filters.studentId) params.append('studentId', filters.studentId.toString());
  if (filters.studentRut) params.append('studentRut', filters.studentRut);
  if (filters.status) params.append('status', filters.status);
  if (filters.method) params.append('method', filters.method);
  if (filters.approverId) params.append('approverId', filters.approverId.toString());
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`${API_BASE_URL}/withdrawals/inspector/history?${params.toString()}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Error al obtener historial de retiros');
  }

  return json.data;
};
