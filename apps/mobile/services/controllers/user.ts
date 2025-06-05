// AQUI SE ALOJAN TODAS LAS APIS QUE UTILIZA EL USUARIO PARA SU PERFIL
import { API_BASE_URL } from '../api'; // Importación para obtener IP a utilizar
import { getToken } from '../authStorage'; // Importación para envío de token al backend

// Función para obtener headers de autorización
const getAuthHeaders = async () => {
  const token = await getToken('user-permanent-token');
  // console.log('[TOKEN ENVIADO]', token); // DEBUG ACTIVAR SOLO SI HAY ERROR
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Función para obtener el perfil del usuario autenticado
export const fetchUserProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  let json;
  try {
    json = await response.json();
    console.log('[Respuesta cruda del perfil]', json);
  } catch (e) {
    throw new Error('La respuesta del servidor no es un JSON válido.');
  }

  if (!response.ok) {
    throw new Error(json?.message || 'Error al obtener el perfil del usuario');
  }

  // Si json tiene data, devolverla; sino devolver json entero
  return json.data ?? json;
};

// Función para actualizar el perfil del usuario autenticado
export const updateUserProfile = async ({
  email,
  phone,
}: {
  email?: string;
  phone?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ email, phone }),
  });

  const json = await response.json();

  if (!response.ok) throw new Error(json.message || 'Error al actualizar el perfil');
  return json.user; // Retorna el perfil actualizado
};

// Función para cambiar la contraseña del usuario autenticado
export const changeUserPassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
}: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/user/password`, { 
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  const json = await response.json();

  if (!response.ok) throw new Error(json.message || 'Error al cambiar la contraseña');
  return json.message; // Devuelve mensaje de éxito
};

