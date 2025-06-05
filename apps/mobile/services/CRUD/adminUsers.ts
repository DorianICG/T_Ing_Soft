//AQUI SE ALOJAN TODAS LAS APIS QUE UTILIZA ADMIN PARA GESTIÓN DE USUARIOS
import { API_BASE_URL } from '../api';
import { getToken } from '../authStorage';

// Clase para representar errores personalizados de API
export class ApiError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

// Obtener headers con token
const getAuthHeaders = async () => {
  const token = await getToken('user-permanent-token');
  console.log(' Token para la autorización:', token);
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Obtener un solo usuario por ID
export const getUserById = async (userId: number) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(json.error || 'Error al obtener el usuario');
  return json;
};

// Obtener usuarios filtros default
export const getUsers = async ({
  page = 1,
  limit = 20,
  search,
  role,
  organizationId,
  isActive,
}: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  organizationId?: number;
  isActive?: boolean;
}) => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) params.append('search', search);
  if (role) params.append('role', role);
  if (organizationId !== undefined) params.append('organizationId', String(organizationId));
  if (isActive !== undefined) params.append('isActive', String(isActive));

    // Aquí agregás el debug para ver qué se está enviando
  console.log(' Params enviados a /admin/users:', {
    page, limit, search, role, organizationId, isActive,
  });
  console.log(' URL:', `${API_BASE_URL}/admin/users?${params.toString()}`);


  const response = await fetch(`${API_BASE_URL}/admin/users?${params.toString()}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    // Lanzar error personalizado con código y status
    throw new ApiError(json.error || 'Error al obtener usuarios', json.code, response.status);
  }

  return json;
};


// Actualizar Usuario por ID
export const updateUser = async (
  userId: number,
  updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
    roleName?: string;
    organizationId?: number;
  }
) => {
  console.log(' Enviando datos para actualizar usuario:', updateData);
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  const json = await response.json();

  if (!response.ok) {
    console.error(' Error al actualizar usuario:', json);
    throw new ApiError(json.error || 'Error al actualizar el usuario', json.code, response.status);
  }

  console.log(' Usuario actualizado con éxito:', json);
  return json;
};

//Eliminar por id
export const deleteUser = async (userId: number) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al eliminar el usuario', json.code, response.status);
  }

  return json; // { message: 'Usuario eliminado exitosamente.' }
};

//Crear usuario
export const createUser = async ({
  rut,
  firstName,
  lastName,
  email,
  phone,
  password,
  roleName,
  isActive = true,
}: {
  rut: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  password: string;
  roleName: string;
  isActive?: boolean;
}) => {
  const payload = {
    rut,
    firstName,
    lastName,
    email: email || 'NO TIENE',
    phone: phone || 'NO TIENE',
    password,
    roleName,
    isActive,
  };

  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al crear usuario', json.code, response.status);
  }

  return json;
};

// Cargar usuarios de forma masiva mediante CSV
export const createUsersBulk = async ({
  file,
  organizationId,
}: {
  file: File;
  organizationId?: number;
}) => {
  const token = await getToken('user-permanent-token');

  const formData = new FormData();
  formData.append('file', file);
  if (organizationId !== undefined) {
    formData.append('organizationId', String(organizationId));
  }

  const response = await fetch(`${API_BASE_URL}/admin/users/bulk`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al cargar usuarios masivamente', json.code, response.status);
  }

  return json; // Puede contener resultados parciales (HTTP 207)
};

// Cambiar estado activo/inactivo de un usuario
export const toggleUserStatus = async (
  userId: number,
  isActive: boolean
) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/toggle-status`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ isActive }),
  });

  const json = await response.json();

  if (!response.ok) {
    console.error(' Error al cambiar estado de usuario:', json);
    throw new ApiError(json.error || 'Error al cambiar estado del usuario', json.code, response.status);
  }

  console.log(' Estado del usuario actualizado con éxito:', json);
  return json;
};
