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

//Obtener todos los cursos
export const getCourses = async ({
  page = 1,
  limit = 20,
  search,
  organizationId,
}: {
  page?: number;
  limit?: number;
  search?: string;
  organizationId?: number;
}) => {
  const params = new URLSearchParams();
  params.append('page', String(page));
  params.append('limit', String(limit));
  if (search) params.append('search', search);
  if (organizationId !== undefined) params.append('organizationId', String(organizationId));

  console.log(' Params enviados a /admin/courses:', {
    page, limit, search, organizationId,
  });
  console.log(' URL:', `${API_BASE_URL}/admin/courses?${params.toString()}`);

  const response = await fetch(`${API_BASE_URL}/admin/courses?${params.toString()}`, {
    method: 'GET',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al obtener cursos', json.code, response.status);
  }

  return json;
};

// Actualizar Curso por ID
export const updateCourse = async (courseId: number, updateData: { name: string }) => {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: JSON.stringify(updateData),
  });

  const json = await response.json();

  if (!response.ok) {
    // Lanzar error personalizado para control en el frontend
    throw new ApiError(json.error || 'Error al actualizar el curso', json.code, response.status);
  }

  return json;
};

// Eliminar curso por ID
export const deleteCourse = async (courseId: number) => {
  const response = await fetch(`${API_BASE_URL}/admin/courses/${courseId}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al eliminar el curso', json.code, response.status);
  }

  return json; // { message: 'Curso eliminado exitosamente.' }
};


// Crear curso
export const createCourse = async ({
  name,
}: {
  name: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/admin/courses`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ name }),
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al crear curso', json.code, response.status);
  }

  return json;
};

// Cargar cursos de forma masiva mediante CSV
export const createCoursesBulk = async ({
  file,
}: {
  file: File;
}) => {
  const token = await getToken('user-permanent-token');

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/admin/courses/bulk`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new ApiError(json.error || 'Error al cargar cursos masivamente', json.code, response.status);
  }

  return json; // { message, results }
};
