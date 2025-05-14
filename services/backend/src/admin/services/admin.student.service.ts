import Student, { StudentAttributes, StudentCreationAttributes } from '../../models/Student'; 
import Role from '../../models/Role';
import User from '../../models/User';
import { Op } from 'sequelize';

export interface ListStudentsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string; 
}

export interface PaginatedStudentResponse {
  students: Student[]; 
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

class AdminStudentService {
  /**
   * Crea un nuevo alumno.
   * @param studentData Datos del alumno a crear.
   * @returns El alumno creado.
   * @throws Error si el RUT ya está registrado, el apoderado no existe o no es apoderado.
   */
  async createStudent(studentData: StudentCreationAttributes): Promise<Student> {
    // 1. Validar que el RUT del alumno no esté ya registrado (si es único)
    if (studentData.rut) {
      const existingStudent = await Student.findOne({ where: { rut: studentData.rut } });
      if (existingStudent) {
        throw new Error(`El RUT de alumno '${studentData.rut}' ya está registrado.`);
      }
    }

    // 2. Validar que el apoderado (parentId) se proporcione y sea válido
    if (!studentData.parentId) {
      throw new Error(`El ID del apoderado (parentId) es requerido para crear un alumno.`);
    }

    const parent = await User.findByPk(studentData.parentId, {
      include: [{ model: Role, as: 'role' }]
    });

    if (!parent) {
      throw new Error(`Apoderado con ID '${studentData.parentId}' no encontrado.`);
    }
    if ((parent.role as any)?.name !== 'PARENT') { 
      throw new Error(`El usuario con ID '${studentData.parentId}' no es un PARENT.`);
    }

    // Crear el alumno
    const newStudent = await Student.create(studentData);
    return newStudent;
  }

  /**
   * Actualiza los datos de un alumno existente.
   * @param studentId ID del alumno a actualizar.
   * @param studentData Datos a actualizar.
   * @returns El alumno actualizado o null si no se encuentra.
   * @throws Error si se intenta cambiar el RUT a uno ya existente o el apoderado no es válido.
   */
  async updateStudent(studentId: number, studentData: Partial<StudentAttributes>): Promise<Student | null> {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return null;
    }

    // Validar unicidad del RUT si se cambia
    if (studentData.rut && studentData.rut !== student.rut) {
      const existingStudent = await Student.findOne({ where: { rut: studentData.rut, id: { [Op.ne]: studentId } } });
      if (existingStudent) {
        throw new Error(`El RUT de alumno '${studentData.rut}' ya está registrado por otro alumno.`);
      }
    }

    // Validar nuevo apoderado si se cambia el parentId directamente
    if (studentData.parentId && studentData.parentId !== student.parentId) {
      const parent = await User.findByPk(studentData.parentId, {
        include: [{ model: Role, as: 'role' }]
      });
      if (!parent) {
        throw new Error(`Nuevo apoderado con ID '${studentData.parentId}' no encontrado.`);
      }
      if ((parent.role as any)?.name !== 'PARENT') { 
        throw new Error(`El usuario con ID '${studentData.parentId}' no es un PARENT.`); 
      }
    }

    await student.update(studentData);
    return student.reload({
      include: [{ model: User, as: 'parent' }]
    });
  }

  /**
   * Asigna un apoderado a un alumno utilizando el RUT del apoderado.
   * @param studentId ID del alumno.
   * @param parentRut RUT del apoderado a asignar.
   * @returns El alumno actualizado.
   * @throws Error si el alumno no se encuentra, el apoderado no se encuentra por RUT,
   *         o el usuario encontrado no es un Apoderado.
   */
  async assignParentToStudentByRut(studentId: number, parentRut: string): Promise<Student> {
    const student = await Student.findByPk(studentId);
    if (!student) {
      throw new Error(`Alumno con ID '${studentId}' no encontrado.`);
    }

    if (!parentRut || parentRut.trim() === '') {
        throw new Error('El RUT del apoderado es requerido.');
    }

    const parentUser = await User.findOne({
      where: { rut: parentRut },
      include: [{ model: Role, as: 'role' }] 
    });

    if (!parentUser) {
      throw new Error(`Usuario (apoderado) con RUT '${parentRut}' no encontrado.`);
    }

    if ((parentUser.role as any)?.name !== 'PARENT') { 
      throw new Error(`El usuario con RUT '${parentRut}' (ID: ${parentUser.id}) no tiene el rol de PARENT.`); 
    }

    student.parentId = parentUser.id;
    await student.save();

    return student.reload({
      include: [{ model: User, as: 'parent' }]
    });
  }

  /**
   * Obtiene un alumno por su ID.
   * @param studentId ID del alumno.
   * @returns El alumno o null si no se encuentra.
   */
  async getStudentById(studentId: number): Promise<Student | null> {
    return Student.findByPk(studentId, {
      include: [
        { model: User, as: 'parent' },
      ]
    });
  }

  /**
   * Obtiene todos los alumnos con paginación y filtros.
   * @param query Parámetros de consulta para paginación y filtro.
   * @returns Un objeto con las filas de alumnos y el conteo total.
   */
  async getAllStudents(options: ListStudentsQuery): Promise<PaginatedStudentResponse> {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'lastNameStudent', 
      sortOrder = 'ASC', 
      search,
    } = options;

    const offset = (page - 1) * limit;
    const whereConditions: any = {}; 


    if (search) {
      whereConditions[Op.or] = [
        { firstNameStudent: { [Op.iLike]: `%${search}%` } },
        { lastNameStudent: { [Op.iLike]: `%${search}%` } },
        { rutStudent: { [Op.iLike]: `%${search}%` } },
        { '$user.firstName$': { [Op.iLike]: `%${search}%` } }, 
        { '$user.lastName$': { [Op.iLike]: `%${search}%` } },
      ];
    }

    try {
      const { count, rows } = await Student.findAndCountAll({ 
        where: whereConditions,
        include: [
          { 
            model: User,
            as: 'user', 
            attributes: ['id', 'firstName', 'lastName', 'rut', 'email'] 
          },
        ],
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        distinct: true, 
      });

      return {
        students: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error('Error al obtener todos los alumnos en el servicio:', error);
      throw new Error('Error interno al obtener la lista de alumnos.');
    }
  }

  /**
   * Elimina un alumno por su ID.
   * @param studentId ID del alumno a eliminar.
   * @returns true si se eliminó, false si no se encontró.
   */
  async deleteStudent(studentId: number): Promise<boolean> {
    const student = await Student.findByPk(studentId);
    if (!student) {
      return false;
    }
    await student.destroy();
    return true;
  }
}

export default new AdminStudentService();