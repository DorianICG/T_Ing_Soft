//AQUI SE ALOJAN TODAS LAS APIS QUE UTILIZA ADMIN PARA GESTIÓN DE ESTUDIANTES
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

//Obtener estudiantes (Filtros por default)
export const getStudents = async ({
  page = 1,
  limit = 20,
  search,
  courseId,
  organizationId,
  hasParent,
}: {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: number;
  organizationId?: number;
  hasParent?: boolean;
}) => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) params.append('search', search);
  if (courseId !== undefined) params.append('courseId', String(courseId));
  if (organizationId !== undefined) params.append('organizationId', String(organizationId));
  if (hasParent !== undefined) params.append('hasParent', String(hasParent));

  console.log(' Params enviados a /admin/students:', {
    page, limit, search, courseId, organizationId, hasParent,
  });
  console.log(' URL:', `${API_BASE_URL}/admin/students?${params.toString()}`);

  const response = await fetch(`${API_BASE_URL}/admin/students?${params.toString()}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al obtener estudiantes', json.code, response.status);
  }

  return json;
};

// Actualizar estudiante por ID
export const updateStudent = async (
  studentId: number,
  updateData: {
    firstName?: string;
    lastName?: string;
    birthDate?: string; // Formato ISO 'YYYY-MM-DD'
    courseId?: number;
    parentRut?: string;
  }
) => {
  console.log(' Enviando datos para actualizar estudiante:', updateData);

  const response = await fetch(`${API_BASE_URL}/admin/students/${studentId}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  const json = await response.json();

  if (!response.ok) {
    console.error(' Error al actualizar estudiante:', json);
    throw new ApiError(json.error || 'Error al actualizar el estudiante', json.code, response.status);
  }

  console.log(' Estudiante actualizado con éxito:', json);
  return json;
};


//Eliminar por id
export const deleteStudent = async (studentId: number) => {
  const response = await fetch(`${API_BASE_URL}/admin/students/${studentId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al eliminar el estudiante', json.code, response.status);
  }

  return json; // { message: 'Estudiante eliminado exitosamente.' }
};

// Crear estudiante
export const createStudent = async ({
  rut,
  firstName,
  lastName,
  birthDate,       // string: 'YYYY-MM-DD'
  courseId,
  parentRut,
}: {
  rut: string;
  firstName: string;
  lastName: string;
  birthDate?: string | null; // formato 'YYYY-MM-DD'
  courseId: number;
  parentRut?: string | null;
}) => {
  const payload = {
    rut,
    firstName,
    lastName,
    birthDate: birthDate ?? null,
    courseId,
    parentRut: parentRut ?? null,
  };

  const response = await fetch(`${API_BASE_URL}/admin/students`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al crear estudiante', json.code, response.status);
  }

  return json;
};

// Cargar estudiantes de forma masiva mediante CSV
export const createStudentsBulk = async ({
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

  const response = await fetch(`${API_BASE_URL}/admin/students/bulk`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al cargar estudiantes masivamente', json.code, response.status);
  }

  return json; // { message, results }
};
