//AQUI SE ALOJAN TODOS LAS APIS QUE UTILIZA PARENT PARA RECOLECCION DE DATOS
import { API_BASE_URL } from './api'; // Importacion para obtener IP a utilizar
import { getToken } from './authStorage'; // Importracion para envio de token al backend

// Funcion para enviar datos
const getAuthHeaders = async () => {
  const token = await getToken('user-permanent-token');
  //console.log('[TOKEN ENVIADO]', token);  //DEBUG ACTIVAR SOLO SI HAY ERROR
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Funcion para obtener todos los estudaintes de un usuario
export const fetchParentStudents = async () => {
  const response = await fetch(`${API_BASE_URL}/withdrawals/parent/students`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Error al obtener estudiantes');
  return json.data;
};

export const fetchWithdrawalReasons = async () => {
  const response = await fetch(`${API_BASE_URL}/withdrawals/parent/reasons`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Error al obtener motivos');
  return json.data;
};

export const generateQrCode = async (studentId: number, reasonId: number, customReason?: string) => {
  const response = await fetch(`${API_BASE_URL}/withdrawals/parent/generate-qr`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ studentId, reasonId, customReason }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Error al generar QR');
  return json.data;
};

export const fetchWithdrawalHistory = async (filters: {
  studentId?: number;
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const params = new URLSearchParams();
  if (filters.studentId) params.append('studentId', filters.studentId.toString());
  if (filters.status) params.append('status', filters.status);
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.offset) params.append('offset', filters.offset.toString());

  const response = await fetch(`${API_BASE_URL}/withdrawals/parent/history?${params.toString()}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.message || 'Error al obtener historial');
  return json.data;
};
