import { validarRut, formatearRut } from '../../utils/rutValidator';
import { parseFlexibleDateToObject } from '../../utils/flexibleDates';
import Student, { StudentAttributes, StudentCreationAttributes } from '../../models/Student'; 
import Role from '../../models/Role';
import User from '../../models/User';
import Organization from '../../models/Organization';
import Course from '../../models/Course';
import UserOrganizationRole from '../../models/UserOrganizationRole';
import { AuthenticatedAdminUser } from '../middlewares/admin.auth.middleware'; 
import sequelize from '../../config/database';
import { Op } from 'sequelize';

export interface CreateStudentData {
  rut: string;
  firstName: string;
  lastName: string;
  birthDate?: string | null;
  courseId: number;
  parentRut?: string | null;
  organizationId: number;
}

export interface RawStudentDataBulk {
  rut?: string;
  firstName?: string;
  lastName?: string;
  courseName?: string;
  birthDateRaw?: string;
  parentRut?: string;
  originalRowNumber: number;
}

class AdminStudentService {

  // CREAR ESTUDIANTE
  async createStudent(data: CreateStudentData): Promise<Student> {
    const t = await sequelize.transaction();

    try {
      const { rut, firstName, lastName, birthDate, courseId, parentRut, organizationId } = data;

      // 0. Verificar que la organización exista
      const organization = await Organization.findByPk(organizationId, { transaction: t });
      if (!organization) {
        throw new Error(`La organización con ID ${organizationId} no existe.`);
      }

      // 1. Validaciones de campos obligatorios
      if (!rut) throw new Error('El RUT del estudiante es obligatorio.');
      if (!firstName) throw new Error('El nombre del estudiante es obligatorio.');
      if (!lastName) throw new Error('El apellido del estudiante es obligatorio.');
      if (courseId === undefined || courseId === null) throw new Error('El ID del curso es obligatorio.');

      // 2. Validación y formateo del RUT del estudiante
      if (!validarRut(rut)) {
        throw new Error('El RUT del estudiante no es válido o tiene un formato incorrecto.');
      }
      const formattedStudentRut = formatearRut(rut);

      // 3. Verificar unicidad del RUT del estudiante en tablas User y Student
      const existingUser = await User.findOne({ where: { rut: formattedStudentRut }, transaction: t });
      if (existingUser) {
        throw new Error('El RUT del estudiante ya está registrado como usuario.');
      }
      const existingStudent = await Student.findOne({ where: { rut: formattedStudentRut, organizationId }, transaction: t }); 
      if (existingStudent) {
        throw new Error(`El RUT del estudiante ya está registrado como estudiante en la organización ID ${organizationId}.`);
      }

      // 4. Verificar que el curso exista y pertenezca a la organización
      const course = await Course.findByPk(courseId, { transaction: t });
      if (!course) {
        throw new Error(`El curso con ID ${courseId} no existe.`);
      }
      if (course.organizationId !== organizationId) {
          throw new Error(`El curso con ID ${courseId} no pertenece a la organización especificada (ID ${organizationId}).`);
      }

      // 5. Preparar datos para la creación (parentId se establece después)
      const studentDataToCreate: StudentCreationAttributes = {
        rut: formattedStudentRut,
        firstName,
        lastName,
        courseId,
        parentId: null, 
        organizationId,
      };
      
      // 6. Manejo del RUT del padre
      if (parentRut && parentRut.trim() !== '') {
        if (!validarRut(parentRut)) {
          throw new Error('El RUT del apoderado no es válido o tiene un formato incorrecto.');
        }
        const formattedParentRut = formatearRut(parentRut);
        const parentUser = await User.findOne({
          where: { 
            rut: formattedParentRut,
            isActive: true
          },
          include: [{
            model: UserOrganizationRole,
            as: 'organizationRoleEntries',
            where: { organizationId: organizationId },
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['name']
              }
            ],
            required: true,
          }],
          transaction: t,
        });
        
        if (!parentUser) {
          throw new Error(
            `El usuario con RUT ${formattedParentRut} no se encuentra registrado en la organización con ID ${organizationId}, no tiene un rol asignado en ella, o está inactivo.`
          );
        }

        const parentRoles = parentUser.organizationRoleEntries?.map(entry => entry.role?.name) || [];
        console.log(`Asignando como apoderado a: ${parentUser.firstName} ${parentUser.lastName} (${formattedParentRut}) con rol(es): ${parentRoles.join(', ')}`);

        studentDataToCreate.parentId = parentUser.id; 
      }

      // 7. Manejo de fecha de nacimiento (lógica original para "YYYY-MM-DD")
      if (birthDate && birthDate.trim() !== '') {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
            throw new Error('El formato de la fecha de nacimiento debe ser YYYY-MM-DD.');
        }
        // Convertir la cadena YYYY-MM-DD a un objeto Date.
        const dateObj = new Date(birthDate + "T00:00:00Z");
        if (isNaN(dateObj.getTime())) { 
            throw new Error('La fecha de nacimiento proporcionada no es válida.');
        }
        studentDataToCreate.birthDate = dateObj;
      } else {
        studentDataToCreate.birthDate = null; 
      }

      // 8. Crear el estudiante
      const newStudent = await Student.create(studentDataToCreate, { transaction: t });

      await t.commit();
      return newStudent;

    } catch (error: any) {
      await t.rollback();
      console.error("Error al crear estudiante:", error.message, error.stack);
      throw new Error(error.message || 'Ocurrió un error al crear el estudiante.');
    }
  }

  // CREAR ESTUDIANTES MASIVO
  async createStudentsBulk(
    studentsData: RawStudentDataBulk[],
    adminUser: AuthenticatedAdminUser,
    organizationId: number
  ): Promise<Array<{ status: 'success' | 'error'; studentRut?: string; message: string; rowNumber: number }>> {
    const results: Array<{ status: 'success' | 'error'; studentRut?: string; message: string; rowNumber: number }> = [];
    const transaction = await sequelize.transaction();

    try {
      const organization = await Organization.findByPk(organizationId, { transaction });
      if (!organization) {
        await transaction.rollback();
        const errorMessage = `La organización con ID ${organizationId} no existe. No se pueden procesar los estudiantes.`;
        console.error(errorMessage);
        return studentsData.map(studentRaw => ({
            status: 'error',
            studentRut: studentRaw.rut,
            message: errorMessage,
            rowNumber: studentRaw.originalRowNumber
        }));
      }

      for (const studentRaw of studentsData) {
        const { rut, firstName, lastName, courseName, birthDateRaw, parentRut, originalRowNumber } = studentRaw;
        let formattedStudentRut: string | undefined;

        try {
          if (!rut || rut.trim() === '') {
            throw new Error('RUT del estudiante no proporcionado o está vacío.');
          }
          if (!validarRut(rut)) {
            throw new Error(`RUT del estudiante '${rut}' no es válido o tiene un formato incorrecto.`);
          }
          formattedStudentRut = formatearRut(rut);

          const existingUser = await User.findOne({ where: { rut: formattedStudentRut }, transaction });
          if (existingUser) {
            throw new Error(`El RUT del estudiante ${formattedStudentRut} ya está registrado como usuario.`);
          }
          const existingStudent = await Student.findOne({ where: { rut: formattedStudentRut, organizationId }, transaction });
          if (existingStudent) {
            throw new Error(`Estudiante con RUT ${formattedStudentRut} ya existe en la organización ID ${organizationId}.`);
          }
          
          if (!firstName || firstName.trim() === '') throw new Error('Nombre del estudiante no proporcionado.');
          if (!lastName || lastName.trim() === '') throw new Error('Apellido del estudiante no proporcionado.');
          
          if (!courseName || courseName.trim() === '') { 
            throw new Error('Nombre del curso no proporcionado.');
          }

          const birthDateObject = parseFlexibleDateToObject(birthDateRaw);
          if (birthDateRaw && birthDateRaw.trim() !== '' && !birthDateObject) {
            throw new Error(`Formato de fecha de nacimiento '${birthDateRaw}' no válido. Usar DD-MM-YYYY o DD/MM/YYYY.`);
          }

          const courseNameUpper = courseName.trim().toUpperCase(); 

          const course = await Course.findOne({ 
            where: { 
              name: courseNameUpper,
              organizationId 
            }, 
            transaction 
          });

          if (!course) {
            throw new Error(`Curso '${courseName.trim()}' no encontrado en la organización ID ${organizationId} (buscado como '${courseNameUpper}').`);
          }
          const courseId = course.id;

          let parentUserId: number | null = null;
          if (parentRut && parentRut.trim() !== '') {
            if (!validarRut(parentRut)) {
              throw new Error(`RUT del apoderado '${parentRut}' inválido.`);
            }
            const formattedParentRut = formatearRut(parentRut);
            const parent = await User.findOne({
              where: { 
                rut: formattedParentRut,
                isActive: true 
              },
              include: [{
                model: UserOrganizationRole,
                as: 'organizationRoleEntries',
                where: { organizationId }, 
                include: [
                  {
                    model: Role,
                    as: 'role',
                    attributes: ['name']
                  }
                ],
                required: true
              }],
              transaction
            });

            if (!parent) {
              throw new Error(`Usuario con RUT ${formattedParentRut} no encontrado, no pertenece a la organización ID ${organizationId}, o está inactivo.`);
            }
            const parentRoles = parent.organizationRoleEntries?.map(entry => entry.role?.name) || [];
            console.log(`Bulk - Asignando apoderado: ${parent.firstName} ${parent.lastName} (${formattedParentRut}) - Roles: ${parentRoles.join(', ')}`);
          
            parentUserId = parent.id;
          }

          const studentDataToCreate: StudentCreationAttributes = {
            rut: formattedStudentRut,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            birthDate: birthDateObject,
            courseId,
            parentId: parentUserId,
            organizationId,
          };

          await Student.create(studentDataToCreate, { transaction });
          results.push({ status: 'success', studentRut: formattedStudentRut, message: 'Estudiante creado exitosamente.', rowNumber: originalRowNumber });

        } catch (error: any) {
          results.push({ status: 'error', studentRut: formattedStudentRut || rut, message: error.message, rowNumber: originalRowNumber });
        }
      }

      const hasErrors = results.some(r => r.status === 'error');
      if (hasErrors) {
        await transaction.commit();

        return results;
      } else {
        await transaction.commit();
      }
      return results;
    } catch (batchError: any) {
      await transaction.rollback();
      console.error('Error catastrófico durante la carga masiva de estudiantes, rollback realizado:', batchError.message, batchError.stack);
      const errorMessage = `Error mayor durante el proceso de carga masiva: ${batchError.message}. Se revirtieron todas las operaciones.`;
      if (results.length > 0) {
        const finalResultsWithError = results.map(r => {
            if (r.status === 'success') {
                return { ...r, status: 'error' as 'error', message: `La creación fue revertida debido a un error mayor en el lote: ${batchError.message}` };
            }
            return r;
        });
        return finalResultsWithError;
      } else {
        return studentsData.map(studentRaw => ({
            status: 'error',
            studentRut: studentRaw.rut,
            message: errorMessage,
            rowNumber: studentRaw.originalRowNumber
        }));
      }
    }
  }

  // OBTENER APODERADOS DISPOBIBLES
  async getAvailableParents(organizationId: number): Promise<any[]> {
    try {
      const availableUsers = await User.findAll({
        where: { isActive: true },
        include: [
          {
            model: UserOrganizationRole,
            as: 'organizationRoleEntries',
            where: { organizationId },
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['name']
              },
              {
                model: Organization,
                as: 'organization',
                attributes: ['name']
              }
            ],
            required: true
          }
        ],
        order: [['lastName', 'ASC'], ['firstName', 'ASC']]
      });

      return availableUsers.map(user => {
        const userJson = user.toJSON() as any;
        const roles = userJson.organizationRoleEntries?.map((entry: any) => entry.role?.name) || [];

        return {
          id: userJson.id,
          rut: userJson.rut,
          firstName: userJson.firstName,
          lastName: userJson.lastName,
          fullName: `${userJson.firstName} ${userJson.lastName}`,
          email: userJson.email,
          phone: userJson.phone,
          roles: roles,
          isActive: userJson.isActive,
          displayText: `${userJson.firstName} ${userJson.lastName} (${userJson.rut}) - ${roles.join(', ')}`,
          roleDisplay: roles.join(', ')
        };
      });

    } catch (error: any) {
      console.error('Error obteniendo usuarios disponibles como apoderados:', error);
      throw new Error('Error al obtener la lista de usuarios disponibles.');
    }
  }

  // OBTENER ESTUDIANTES CON FILTROS Y PAGINACIÓN
  async getStudents(filters: {
    page: number;
    limit: number;
    search: string;
    courseId?: number;
    organizationId?: number;
    hasParent?: boolean;
    adminOrganizations: Array<{ id: number; name: string }>;
  }): Promise<{
    students: Array<any>;
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const { page, limit, search, courseId, organizationId, hasParent, adminOrganizations } = filters;
      
      // Construir filtros de organización
      const allowedOrgIds = adminOrganizations.map(org => org.id);
      const whereClause: any = {
        organizationId: { [Op.in]: allowedOrgIds }
      };
    
      // Filtro por organización específica
      if (organizationId) {
        whereClause.organizationId = organizationId;
      }
    
      // Filtro por curso
      if (courseId) {
        whereClause.courseId = courseId;
      }
    
      // Filtro por si tiene apoderado
      if (hasParent !== undefined) {
        whereClause.parentId = hasParent ? { [Op.not]: null } : null;
      }
    
      // Filtro de búsqueda por nombre o RUT
      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${searchTerm}%` } },
          { lastName: { [Op.iLike]: `%${searchTerm}%` } },
          { rut: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
    
      const offset = (page - 1) * limit;
    
      const { count, rows: students } = await Student.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name'] 
          },
          {
            model: User,
            as: 'parent',
            attributes: ['id', 'rut', 'firstName', 'lastName', 'phone', 'email'],
            include: [
              {
                model: UserOrganizationRole,
                as: 'organizationRoleEntries',
                include: [
                  {
                    model: Role,
                    as: 'role',
                    attributes: ['name']
                  }
                ],
                required: false
              }
            ],
            required: false
          },
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name']
          }
        ],
        order: [['lastName', 'ASC'], ['firstName', 'ASC']],
        limit,
        offset
      });

      const formattedStudents = students.map(student => {
        let parentInfo = null;
        if (student.parent) {
          const parentRoles = student.parent.organizationRoleEntries?.map((entry: any) => entry.role?.name) || [];
          parentInfo = {
            id: student.parent.id,
            rut: student.parent.rut,
            firstName: student.parent.firstName,
            lastName: student.parent.lastName,
            fullName: `${student.parent.firstName} ${student.parent.lastName}`,
            phone: student.parent.phone,
            email: student.parent.email,
            roles: parentRoles,
            roleDisplay: parentRoles.join(', ')
          };
        }

        return {
          id: student.id,
          rut: student.rut,
          firstName: student.firstName,
          lastName: student.lastName,
          fullName: `${student.firstName} ${student.lastName}`,
          birthDate: student.birthDate,
          course: student.course ? {
            id: student.course.id,
            name: student.course.name
          } : null,
          parent: parentInfo,
          organization: student.organization ? {
            id: student.organization.id,
            name: student.organization.name
          } : null,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt
        };
      });

      return {
        students: formattedStudents,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      };

    } catch (error: any) {
      console.error('Error obteniendo estudiantes:', error);
      throw new Error('Error al obtener la lista de estudiantes.');
    }
  }
  
  // OBTENER ESTUDIANTE POR ID
  async getStudent(studentId: number, adminOrganizations: Array<{ id: number; name: string }>): Promise<any | null> {
    try {
      const allowedOrgIds = adminOrganizations.map(org => org.id);

      const student = await Student.findOne({
        where: {
          id: studentId,
          organizationId: { [Op.in]: allowedOrgIds }
        },
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'parent',
            attributes: ['id', 'rut', 'firstName', 'lastName', 'phone', 'email'],
            include: [
              {
                model: UserOrganizationRole,
                as: 'organizationRoleEntries',
                include: [
                  {
                    model: Role,
                    as: 'role',
                    attributes: ['name']
                  }
                ],
                required: false
              }
            ],
            required: false
          },
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!student) {
        return null;
      }

      let parentInfo = null;
      if (student.parent) {
        const parentRoles = student.parent.organizationRoleEntries?.map((entry: any) => entry.role?.name) || [];
        parentInfo = {
          id: student.parent.id,
          rut: student.parent.rut,
          firstName: student.parent.firstName,
          lastName: student.parent.lastName,
          fullName: `${student.parent.firstName} ${student.parent.lastName}`,
          phone: student.parent.phone,
          email: student.parent.email,
          roles: parentRoles,
          roleDisplay: parentRoles.join(', ')
        };
      }

      return {
        id: student.id,
        rut: student.rut,
        firstName: student.firstName,
        lastName: student.lastName,
        fullName: `${student.firstName} ${student.lastName}`,
        birthDate: student.birthDate,
        course: student.course ? {
          id: student.course.id,
          name: student.course.name
        } : null,
        parent: parentInfo,
        organization: student.organization ? {
          id: student.organization.id,
          name: student.organization.name
        } : null,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt
      };

    } catch (error: any) {
      console.error('Error obteniendo estudiante:', error);
      throw new Error('Error al obtener el estudiante.');
    }
  }
  
  // ACTUALIZAR ESTUDIANTE
  async updateStudent(
    studentId: number, 
    updateData: {
      firstName?: string;
      lastName?: string;
      birthDate?: string | null;
      courseId?: number;
      parentRut?: string | null;
    },
    adminUser: AuthenticatedAdminUser
  ): Promise<any> {
    const t = await sequelize.transaction();
  
    try {
      // Verificar que el estudiante existe y el admin tiene permisos
      const allowedOrgIds = adminUser.adminOrganizations?.map(org => org.id) || [];
      
      const existingStudent = await Student.findOne({
        where: {
          id: studentId,
          organizationId: { [Op.in]: allowedOrgIds }
        },
        transaction: t
      });
    
      if (!existingStudent) {
        throw new Error('Estudiante no encontrado o no tiene permisos para editarlo.');
      }
    
      const updatePayload: any = {};
    
      // Actualizar nombres
      if (updateData.firstName !== undefined) {
        if (!updateData.firstName || updateData.firstName.trim() === '') {
          throw new Error('El nombre del estudiante no puede estar vacío.');
        }
        updatePayload.firstName = updateData.firstName.trim();
      }
    
      if (updateData.lastName !== undefined) {
        if (!updateData.lastName || updateData.lastName.trim() === '') {
          throw new Error('El apellido del estudiante no puede estar vacío.');
        }
        updatePayload.lastName = updateData.lastName.trim();
      }
    
      // Actualizar fecha de nacimiento
      if (updateData.birthDate !== undefined) {
        if (updateData.birthDate && updateData.birthDate.trim() !== '') {
          if (!/^\d{4}-\d{2}-\d{2}$/.test(updateData.birthDate)) {
            throw new Error('El formato de la fecha de nacimiento debe ser YYYY-MM-DD.');
          }
          const dateObj = new Date(updateData.birthDate + "T00:00:00Z");
          if (isNaN(dateObj.getTime())) {
            throw new Error('La fecha de nacimiento proporcionada no es válida.');
          }
          updatePayload.birthDate = dateObj;
        } else {
          updatePayload.birthDate = null;
        }
      }
    
      // Actualizar curso
      if (updateData.courseId !== undefined) {
        const course = await Course.findOne({
          where: {
            id: updateData.courseId,
            organizationId: existingStudent.organizationId
          },
          transaction: t
        });
      
        if (!course) {
          throw new Error(`El curso con ID ${updateData.courseId} no existe o no pertenece a la organización del estudiante.`);
        }
        updatePayload.courseId = updateData.courseId;
      }
    
      // Actualizar apoderado
      if (updateData.parentRut !== undefined) {
        if (updateData.parentRut && updateData.parentRut.trim() !== '') {
          if (!validarRut(updateData.parentRut)) {
            throw new Error('El RUT del apoderado no es válido.');
          }
          
          const formattedParentRut = formatearRut(updateData.parentRut);
          const parentUser = await User.findOne({
            where: { 
              rut: formattedParentRut,
              isActive: true 
            },
            include: [{
              model: UserOrganizationRole,
              as: 'organizationRoleEntries',
              where: { organizationId: existingStudent.organizationId },
              include: [
                {
                  model: Role,
                  as: 'role',
                  attributes: ['name']
                }
              ],
              required: true
            }],
            transaction: t
          });
        
          if (!parentUser) {
            throw new Error(`El usuario con RUT ${formattedParentRut} no está registrado en la organización, no tiene rol asignado, o está inactivo.`);
          }

          const parentRoles = parentUser.organizationRoleEntries?.map(entry => entry.role?.name) || [];
          console.log(`Actualizando apoderado a: ${parentUser.firstName} ${parentUser.lastName} (${formattedParentRut}) - Roles: ${parentRoles.join(', ')}`);

          updatePayload.parentId = parentUser.id;
        } else {
          console.log(`Removiendo apoderado del estudiante ID ${studentId}`);
          updatePayload.parentId = null;
        }
      }
    
      // Realizar la actualización
      await existingStudent.update(updatePayload, { transaction: t });
    
      // Obtener el estudiante actualizado con todas las relaciones
      const updatedStudent = await Student.findByPk(studentId, {
        include: [
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'parent',
            attributes: ['id', 'rut', 'firstName', 'lastName', 'phone'],
            required: false
          },
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name']
          }
        ],
        transaction: t
      });
    
      await t.commit();
    
      return {
        id: updatedStudent!.id,
        rut: updatedStudent!.rut,
        firstName: updatedStudent!.firstName,
        lastName: updatedStudent!.lastName,
        fullName: `${updatedStudent!.firstName} ${updatedStudent!.lastName}`,
        birthDate: updatedStudent!.birthDate,
        course: updatedStudent!.course ? {
          id: updatedStudent!.course.id,
          name: updatedStudent!.course.name
        } : null,
        parent: updatedStudent!.parent ? {
          id: updatedStudent!.parent.id,
          rut: updatedStudent!.parent.rut,
          fullName: `${updatedStudent!.parent.firstName} ${updatedStudent!.parent.lastName}`,
          phone: updatedStudent!.parent.phone
        } : null,
        organization: updatedStudent!.organization ? {
          id: updatedStudent!.organization.id,
          name: updatedStudent!.organization.name
        } : null,
        updatedAt: updatedStudent!.updatedAt
      };
    
    } catch (error: any) {
      await t.rollback();
      console.error('Error actualizando estudiante:', error);
      throw new Error(error.message || 'Error al actualizar el estudiante.');
    }
  }
  
  // ELIMINAR ESTUDIANTE
  async deleteStudent(studentId: number, adminUser: AuthenticatedAdminUser): Promise<void> {
    const t = await sequelize.transaction();
  
    try {
      const allowedOrgIds = adminUser.adminOrganizations?.map(org => org.id) || [];
      
      const existingStudent = await Student.findOne({
        where: {
          id: studentId,
          organizationId: { [Op.in]: allowedOrgIds }
        },
        transaction: t
      });
    
      if (!existingStudent) {
        throw new Error('Estudiante no encontrado o no tiene permisos para eliminarlo.');
      }
    
      await existingStudent.destroy({ transaction: t });
      await t.commit();
    
    } catch (error: any) {
      await t.rollback();
      console.error('Error eliminando estudiante:', error);
      throw new Error(error.message || 'Error al eliminar el estudiante.');
    }
  }

}

export default new AdminStudentService();