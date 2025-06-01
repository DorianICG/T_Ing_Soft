import Course, { CourseAttributes, CourseCreationAttributes } from '../../models/Course';
import Organization from '../../models/Organization';
import Student from '../../models/Student';
import { AuthenticatedAdminUser } from '../middlewares/admin.auth.middleware';
import sequelize from '../../config/database';
import { Op } from 'sequelize';

class AdminCourseService {

  // CREAR CURSO
  async createCourse(data: {
    name: string;
    organizationId: number;
  }): Promise<Course> {
    const t = await sequelize.transaction();
  
    try {
      const { name, organizationId } = data;
  
      // Validación básica
      if (!name || name.trim() === '') {
        throw new Error('El nombre del curso es obligatorio.');
      }
  
      if (!organizationId || organizationId <= 0) {
        throw new Error('ID de organización inválido.');
      }
  
      // Verificar que la organización existe
      const organization = await Organization.findByPk(organizationId, { transaction: t });
      if (!organization) {
        throw new Error(`La organización con ID ${organizationId} no existe.`);
      }
  
      // Verificar unicidad del nombre del curso en la organización
      const existingCourse = await Course.findOne({
        where: {
          name: name.trim().toUpperCase(),
          organizationId
        },
        transaction: t
      });
  
      if (existingCourse) {
        throw new Error(`Ya existe un curso con el nombre "${name.trim()}" en esta organización.`);
      }
  
      // Crear el curso
      const courseData: CourseCreationAttributes = {
        name: name.trim().toUpperCase(),
        organizationId
      };
  
      const newCourse = await Course.create(courseData, { transaction: t });
      await t.commit();
  
      return newCourse;
  
    } catch (error: any) {
      await t.rollback();
      console.error('Error creando curso:', error);
      throw new Error(error.message || 'Error al crear el curso.');
    }
  }

  // CREAR CURSOS MASIVO (método básico)
  async createCoursesBulk(coursesData: any[], adminUser: AuthenticatedAdminUser, organizationId: number): Promise<any[]> {
    const results: any[] = [];
    const t = await sequelize.transaction();

    try {
      for (const courseData of coursesData) {
        try {
          if (!courseData.name || courseData.name.trim() === '') {
            throw new Error('Nombre de curso requerido.');
          }

          const newCourse = await this.createCourse({
            name: courseData.name.trim(),
            organizationId
          });

          results.push({
            status: 'success',
            courseName: courseData.name,
            message: 'Curso creado exitosamente.'
          });

        } catch (error: any) {
          results.push({
            status: 'error',
            courseName: courseData.name || 'Sin nombre',
            message: error.message
          });
        }
      }

      await t.commit();
      return results;

    } catch (error: any) {
      await t.rollback();
      console.error('Error en carga masiva de cursos:', error);
      throw new Error('Error en la carga masiva de cursos.');
    }
  }

  // OBTENER CURSOS
  async getCourses(filters: {
    page: number;
    limit: number;
    search: string;
    organizationId?: number;
    adminOrganizations: Array<{ id: number; name: string }>;
  }): Promise<{
    courses: Array<any>;
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const { page, limit, search, organizationId, adminOrganizations } = filters;
      
      const allowedOrgIds = adminOrganizations.map(org => org.id);
      const whereClause: any = {
        organizationId: { [Op.in]: allowedOrgIds }
      };
  
      if (organizationId) {
        whereClause.organizationId = organizationId;
      }
  
      if (search && search.trim()) {
        whereClause.name = { [Op.iLike]: `%${search.trim()}%` };
      }
      
      const offset = (page - 1) * limit;
  
      const { count, rows: courses } = await Course.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name']
          }
        ],
        order: [['name', 'ASC']],
        limit,
        offset
      });
  
      const formattedCourses = courses.map(course => ({
        id: course.id,
        name: course.name,
        organization: course.organization ? {
          id: course.organization.id,
          name: course.organization.name
        } : null,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      }));
  
      return {
        courses: formattedCourses,
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      };
  
    } catch (error: any) {
      console.error('Error obteniendo cursos:', error);
      throw new Error('Error al obtener la lista de cursos.');
    }
  }

  // OBTENER CURSO POR ID
  async getCourse(courseId: number, adminOrganizations: Array<{ id: number; name: string }>): Promise<any | null> {
    try {
      const allowedOrgIds = adminOrganizations.map(org => org.id);

      const course = await Course.findOne({
        where: {
          id: courseId,
          organizationId: { [Op.in]: allowedOrgIds }
        },
        include: [
          {
            model: Organization,
            as: 'organization',
            attributes: ['id', 'name']
          }
        ]
      });

      if (!course) {
        return null;
      }

      return {
        id: course.id,
        name: course.name,
        organization: course.organization ? {
          id: course.organization.id,
          name: course.organization.name
        } : null,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt
      };

    } catch (error: any) {
      console.error('Error obteniendo curso:', error);
      throw new Error('Error al obtener el curso.');
    }
  }

  // ACTUALIZAR CURSO
  async updateCourse(courseId: number, updateData: { name?: string }, adminUser: AuthenticatedAdminUser): Promise<any> {
    const t = await sequelize.transaction();

    try {
      const allowedOrgIds = adminUser.adminOrganizations?.map(org => org.id) || [];
      
      const existingCourse = await Course.findOne({
        where: {
          id: courseId,
          organizationId: { [Op.in]: allowedOrgIds }
        },
        transaction: t
      });

      if (!existingCourse) {
        throw new Error('Curso no encontrado o no tiene permisos para editarlo.');
      }

      if (updateData.name !== undefined) {
        const trimmedName = updateData.name.trim().toUpperCase();
        
        // Verificar unicidad
        const duplicateCourse = await Course.findOne({
          where: {
            name: trimmedName,
            organizationId: existingCourse.organizationId,
            id: { [Op.ne]: courseId }
          },
          transaction: t
        });

        if (duplicateCourse) {
          throw new Error(`Ya existe otro curso con el nombre "${updateData.name.trim()}" en esta organización.`);
        }

        await existingCourse.update({ name: trimmedName }, { transaction: t });
      }

      await t.commit();
      return await this.getCourse(courseId, adminUser.adminOrganizations || []);

    } catch (error: any) {
      await t.rollback();
      console.error('Error actualizando curso:', error);
      throw new Error(error.message || 'Error al actualizar el curso.');
    }
  }

  // ELIMINAR CURSO
  async deleteCourse(courseId: number, adminUser: AuthenticatedAdminUser): Promise<void> {
    const t = await sequelize.transaction();

    try {
      const allowedOrgIds = adminUser.adminOrganizations?.map(org => org.id) || [];
      
      const existingCourse = await Course.findOne({
        where: {
          id: courseId,
          organizationId: { [Op.in]: allowedOrgIds }
        },
        transaction: t
      });

      if (!existingCourse) {
        throw new Error('Curso no encontrado o no tiene permisos para eliminarlo.');
      }

      // Verificar si tiene estudiantes asignados
      const studentCount = await Student.count({
        where: { courseId },
        transaction: t
      });

      if (studentCount > 0) {
        throw new Error(`No se puede eliminar el curso porque tiene ${studentCount} estudiante(s) asignado(s).`);
      }

      await existingCourse.destroy({ transaction: t });
      await t.commit();

    } catch (error: any) {
      await t.rollback();
      console.error('Error eliminando curso:', error);
      throw new Error(error.message || 'Error al eliminar el curso.');
    }
  }

  

}

export default new AdminCourseService();