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
          throw new Error('El RUT del padre no es válido o tiene un formato incorrecto.');
        }
        const formattedParentRut = formatearRut(parentRut);
        const parentUser = await User.findOne({
          where: { rut: formattedParentRut },
          include: [{
            model: UserOrganizationRole,
            as: 'organizationRoleEntries',
            where: { organizationId: organizationId },
            required: true,
          }],
          transaction: t,
        });
        if (!parentUser) {
          throw new Error(
            `El padre con el RUT ${formattedParentRut} no se encuentra registrado en la organización con ID ${organizationId} o no tiene un rol asignado en ella.`
          );
        }
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
              where: { rut: formattedParentRut },
              include: [{
                model: UserOrganizationRole,
                as: 'organizationRoleEntries',
                where: { organizationId }, 
                required: true
              }],
              transaction
            });
            if (!parent) {
              throw new Error(`Apoderado con RUT ${formattedParentRut} no encontrado o no pertenece a la organización ID ${organizationId}.`);
            }
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
        await transaction.rollback();
         console.log('Errores encontrados en la carga masiva de estudiantes. Realizando rollback.');
         const finalResults = results.map(r => {
            if (r.status === 'success') {
                return { ...r, status: 'error' as 'error', message: 'La creación fue revertida debido a otros errores en el lote.' };
            }
            return r;
         });
        return finalResults;
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

}


export default new AdminStudentService();