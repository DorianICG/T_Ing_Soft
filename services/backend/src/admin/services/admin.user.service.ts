import bcrypt from 'bcrypt';
import { User, Role, Organization, UserOrganizationRole } from '../../models';
import { UserAttributes, UserCreationAttributes } from '../../models/User';
import { AuthenticatedAdminUser } from '../middlewares/admin.auth.middleware'; 
import sequelize from '../../config/database';
import { FindOptions, Op } from 'sequelize';
import { validarRut, formatearRut } from '../../utils/rutValidator';

export interface UserCreationRequestData {
  rut: string;
  email?: string;
  password?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roleName: string; 
  organizationId?: number;
  isActive?: boolean;
}

interface UserDataFromCSV {
  rut?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleName?: string;
}

interface UserUpdateRequestData {
  firstName?: string;
  lastName?: string;
  rut?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleName?: string;
  isActive?: boolean;
}

interface ListUsersFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  roleName?: string;
  isActive?: boolean;
  search?: string;
}

export type ReturnedUserAttributes = Omit<UserAttributes, 'passwordHash'>;

class AdminUserService {
  // CREAR USUARIO
  async createUser(data: UserCreationRequestData, adminUser: AuthenticatedAdminUser): Promise<ReturnedUserAttributes> {
    const allowedRoles = ['PARENT', 'INSPECTOR'];
    if (!allowedRoles.includes(data.roleName)) {
      throw new Error(`Los administradores solo pueden crear usuarios con roles: ${allowedRoles.join(', ')}.`);
    }

    if (!adminUser || !adminUser.adminOrganizations || adminUser.adminOrganizations.length === 0) {
        throw new Error("El usuario administrador no tiene organizaciones válidas asignadas o no se pudieron determinar.");
    }

    let targetOrganizationId: number;

    if (adminUser.adminOrganizations.length === 1) {
        targetOrganizationId = adminUser.adminOrganizations[0].id;
    } else { 
        if (data.organizationId === undefined || data.organizationId === null) {
            throw new Error("El administrador pertenece a múltiples organizaciones. Debe especificar un 'organizationId' para el nuevo usuario.");
        }
        const isValidOrgForAdmin = adminUser.adminOrganizations.some(org => org.id === data.organizationId);
        if (!isValidOrgForAdmin) {
            throw new Error(`El 'organizationId' (${data.organizationId}) proporcionado no corresponde a una organización válida para el administrador.`);
        }
        targetOrganizationId = data.organizationId;
    }

    const rutFromPayload = data.rut;

    if (!rutFromPayload || typeof rutFromPayload !== 'string') {
      console.error(`[AdminUserService.createUser] RUT inválido recibido: '${rutFromPayload}'`);
      throw new Error(`El RUT recibido es inválido: '${rutFromPayload}'. Debe ser una cadena de texto válida.`);
    }

    let formattedRut = rutFromPayload.trim();
    
    if (!formattedRut.includes('-')) {
      formattedRut = formatearRut(formattedRut);
      
      if (!formattedRut) {
        throw new Error(`El RUT '${rutFromPayload}' no se pudo formatear correctamente.`);
      }
    }

    if (!validarRut(formattedRut)) {
      throw new Error(`El RUT '${formattedRut}' no es válido (dígito verificador incorrecto).`);
    }

    
    const existingUserByRut = await User.findOne({ where: { rut: formattedRut } });
    if (existingUserByRut) {
      throw new Error(`El RUT '${formattedRut}' ya está registrado.`);
    }

    let passwordToHash = data.password;
    if (!passwordToHash) {
      const rutParts = formattedRut.split('-');
      if (rutParts.length > 0 && rutParts[0]) {
        passwordToHash = rutParts[0];
      } else {
        throw new Error('Formato de RUT inválido para generar contraseña por defecto.');
      }
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordToHash, saltRounds);

    const roleForNewUser = await Role.findOne({ where: { name: data.roleName } });
    if (!roleForNewUser) {
      throw new Error(`Rol '${data.roleName}' para el nuevo usuario no encontrado.`);
    }

    const organizationInstanceForNewUser = await Organization.findByPk(targetOrganizationId);
    if (!organizationInstanceForNewUser) {
        throw new Error(`Organización con ID '${targetOrganizationId}' no encontrada.`);
    }

    const creationAttributes: UserCreationAttributes = {
      rut: formattedRut,
      email: (data.email && data.email.trim() !== '') ? data.email.trim() : 'NO TIENE',
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: (data.phone && data.phone.trim() !== '') ? data.phone.trim() : 'NO TIENE',
      isActive: data.isActive !== undefined ? data.isActive : true,
      failedLoginAttempts: 0,
      accountLocked: false,
    };


    const t = await sequelize.transaction();

  try {
    const newUser = await User.create(creationAttributes, { transaction: t });
    
    const existingRole = await UserOrganizationRole.findOne({
      where: {
        userId: newUser.id,
        organizationId: targetOrganizationId
      },
      transaction: t
    });

    if (existingRole) {
      await existingRole.update({
        roleId: roleForNewUser.id
      }, { transaction: t });
    } else {
      await UserOrganizationRole.create({
        userId: newUser.id,
        organizationId: targetOrganizationId, 
        roleId: roleForNewUser.id,
      }, { transaction: t });
    }

    await t.commit();

    const userToReturn = newUser.toJSON() as UserAttributes;
    const { passwordHash: omitPassword, ...returnedUser } = userToReturn; 

    return returnedUser as ReturnedUserAttributes;

  } catch (error: any) {
      await t.rollback();
      console.error('Error al crear usuario y asignar rol/organización:', error);
      
      if (error.message.includes('ya está registrado')) {
        throw new Error(`El RUT ${formattedRut} ya está registrado en el sistema.`);
      } else if (error.message.includes('no encontrado')) {
        throw error;
      } else if (error.message.includes('organización') || error.message.includes('Rol')) {
        throw error; 
      } else {
        console.error('Error interno completo:', error);
        throw new Error('Error interno al crear el usuario en la base de datos.');
      }
    }
  }

  // CREAR USUARIOS BULK
  async createUsersBulk(usersData: UserDataFromCSV[], adminUser: AuthenticatedAdminUser, selectedOrganizationId: number): Promise<any[]> {
    const results = [];

    if (!selectedOrganizationId) {
        throw new Error("No se proporcionó un ID de organización para la carga masiva.");
    }
    
    const isValidOrgForAdmin = adminUser.adminOrganizations?.some(org => org.id === selectedOrganizationId);
    if (!isValidOrgForAdmin && adminUser.adminOrganizations && adminUser.adminOrganizations.length > 0) {
        throw new Error(`La organización seleccionada (ID: ${selectedOrganizationId}) no es válida para el administrador actual.`);
    }

    for (const [index, userData] of usersData.entries()) {
      try {
        if (!userData.rut || !userData.firstName || !userData.lastName || !userData.roleName) {
          results.push({ 
            row: index + 2,
            status: 'error', 
            message: 'Faltan campos requeridos en el CSV (rut, firstName, lastName, roleName).',
            data: userData 
          });
          continue;
        }

        const creationData: UserCreationRequestData = {
          rut: String(userData.rut),
          email: userData.email || undefined, 
          password: undefined,
          firstName: String(userData.firstName),
          lastName: String(userData.lastName),
          phone: userData.phone || undefined,
          roleName: String(userData.roleName),
          isActive: true,
          organizationId: selectedOrganizationId, 
        };

        const newUser = await this.createUser(creationData, adminUser);
        results.push({ row: index + 2, status: 'success', userId: newUser.id, rut: newUser.rut });

      } catch (error: any) {
        results.push({ 
          row: index + 2, 
          status: 'error', 
          message: error.message || 'Error desconocido al procesar esta fila.',
          data: userData 
        });
      }
    }
    return results;
  }

    // OBTENER USUARIOS CON FILTROS Y PAGINACIÓN
  async getUsers(filters: {
    page: number;
    limit: number;
    search: string;
    roleFilter: string;
    organizationId?: number;
    isActive?: boolean;
    adminOrganizations: Array<{ id: number; name: string }>;
  }): Promise<{
    users: Array<any>;
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const { page, limit, search, roleFilter, organizationId, isActive, adminOrganizations } = filters;
      
      // Construir filtros de organización
      const allowedOrgIds = adminOrganizations.map(org => org.id);
      const whereClause: any = {};
  
      // Filtro por estado activo
      if (isActive !== undefined) {
        whereClause.isActive = isActive;
      }
  
      if (search && search.trim()) {
        const searchTerm = search.trim();
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${searchTerm}%` } },
          { lastName: { [Op.iLike]: `%${searchTerm}%` } },
          { rut: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }
  
      const offset = (page - 1) * limit;
  
      const includeWhere: any = { 
        organizationId: { [Op.in]: allowedOrgIds } 
      };
  
      if (organizationId) {
        includeWhere.organizationId = organizationId;
      }
  
      const roleWhere: any = {};
      if (roleFilter) {
        roleWhere.name = roleFilter;
      }
  
      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: UserOrganizationRole,
            as: 'organizationRoleEntries',
            where: includeWhere,
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['id', 'name'],
                where: Object.keys(roleWhere).length > 0 ? roleWhere : undefined
              },
              {
                model: Organization,
                as: 'organization',
                attributes: ['id', 'name']
              }
            ],
            required: true 
          }
        ],
        order: [['lastName', 'ASC'], ['firstName', 'ASC']],
        limit,
        offset,

      });
  
  
      const formattedUsers = users.map(user => {
        const userJson = user.toJSON() as any;
        
        const roles = userJson.organizationRoleEntries?.map((entry: any) => ({
          id: entry.role?.id,
          name: entry.role?.name,
          organizationId: entry.organizationId,
          organizationName: entry.organization?.name
        })) || [];
  
        return {
          id: userJson.id,
          rut: userJson.rut,
          firstName: userJson.firstName,
          lastName: userJson.lastName,
          email: userJson.email,
          phone: userJson.phone,
          isActive: userJson.isActive,
          createdAt: userJson.createdAt,
          updatedAt: userJson.updatedAt,
          roles: roles
        };
      });
  
      const totalPages = Math.ceil(count / limit);
  
      return {
        users: formattedUsers,
        total: count,
        totalPages,
        currentPage: page,
      };
  
    } catch (error: any) {
      console.error('Error en getUsers:', error);
      console.error('SQL Query:', error.sql);
      console.error('Error completo:', JSON.stringify(error, null, 2));
      throw new Error('Error al obtener la lista de usuarios.');
    }
  }
  
  // OBTENER USUARIO POR ID
  async getUser(userId: number, adminOrganizations: Array<{ id: number; name: string }>): Promise<any | null> {
    try {
      const allowedOrgIds = adminOrganizations.map(org => org.id);
  
      const user = await User.findOne({
        where: { id: userId },
        include: [
          {
            model: UserOrganizationRole,
            as: 'organizationRoleEntries',
            where: { organizationId: { [Op.in]: allowedOrgIds } },
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['id', 'name']
              },
              {
                model: Organization,
                as: 'organization',
                attributes: ['id', 'name']
              }
            ],
            required: true
          }
        ]
      });
  
      if (!user) {
        return null;
      }
  
      return {
        id: user.id,
        rut: user.rut,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        roles: user.organizationRoleEntries?.map(entry => ({
          roleName: entry.role?.name,
          organization: {
            id: entry.organization?.id,
            name: entry.organization?.name
          }
        })) || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
  
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      throw new Error('Error al obtener el usuario.');
    }
  }
  
  // ACTUALIZAR USUARIO
  async updateUser(
    userId: number,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      isActive?: boolean;
      roleName?: string;
      organizationId?: number;
    },
    adminUser: AuthenticatedAdminUser
  ): Promise<any> {
    const t = await sequelize.transaction();
  
    try {
      const allowedOrgIds = adminUser.adminOrganizations?.map(org => org.id) || [];
      
      const existingUser = await User.findOne({
        where: { id: userId },
        include: [
          {
            model: UserOrganizationRole,
            as: 'organizationRoleEntries',
            where: { organizationId: { [Op.in]: allowedOrgIds } },
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['name']
              }
            ],
            required: true
          }
        ],
        transaction: t
      });
  
      if (!existingUser) {
        throw new Error('Usuario no encontrado o no tiene permisos para editarlo.');
      }
  
      const currentRoles = existingUser.organizationRoleEntries?.map(entry => entry.role?.name) || [];
      const isCurrentlyAdmin = currentRoles.includes('ADMIN');
      
      if (isCurrentlyAdmin) {
        throw new Error('No se puede modificar usuarios con rol de administrador.');
      }
  
      if (updateData.roleName) {
        const allowedRoles = ['PARENT', 'INSPECTOR'];
        if (!allowedRoles.includes(updateData.roleName)) {
          throw new Error(`Solo se pueden asignar los roles: ${allowedRoles.join(', ')}.`);
        }
      }
  
      const updatePayload: any = {};
  
      if (updateData.firstName !== undefined) {
        updatePayload.firstName = updateData.firstName.trim();
      }
      if (updateData.lastName !== undefined) {
        updatePayload.lastName = updateData.lastName.trim();
      }
      if (updateData.email !== undefined) {
        updatePayload.email = updateData.email || 'NO TIENE';
      }
      if (updateData.phone !== undefined) {
        updatePayload.phone = updateData.phone || 'NO TIENE';
      }
      if (updateData.isActive !== undefined) {
        updatePayload.isActive = updateData.isActive;
      }
  
      if (Object.keys(updatePayload).length > 0) {
        await existingUser.update(updatePayload, { transaction: t });
      }
  
      if (updateData.roleName) {
        const newRole = await Role.findOne({ 
          where: { name: updateData.roleName },
          transaction: t 
        });
        
        if (!newRole) {
          throw new Error(`Rol '${updateData.roleName}' no encontrado.`);
        }
      
        let targetOrgId = updateData.organizationId;
        if (!targetOrgId && allowedOrgIds.length === 1) {
          targetOrgId = allowedOrgIds[0];
        } else if (!targetOrgId) {
          throw new Error('Debe especificar organizationId para cambiar el rol.');
        }
      
        const existingOrgRoles = await UserOrganizationRole.findAll({
          where: {
            userId: userId,
            organizationId: targetOrgId
          },
          transaction: t
        });
      
        console.log(`🔍 DEBUGGING ESPECÍFICO:`);
        console.log(`- userId: ${userId}`);
        console.log(`- targetOrgId: ${targetOrgId}`);
        console.log(`- newRole.id: ${newRole.id}`);
        console.log(`- existingOrgRoles.length: ${existingOrgRoles.length}`);
        
        if (existingOrgRoles.length > 0) {
          console.log(`- roleToUpdate.roleId ACTUAL: ${existingOrgRoles[0].roleId}`);
          console.log(`- ¿Necesita cambio? ${existingOrgRoles[0].roleId !== newRole.id}`);
          
          // ✅ ACTUALIZAR ROL EXISTENTE (no crear)
          const roleToUpdate = existingOrgRoles[0];
          await roleToUpdate.update({
            roleId: newRole.id
          }, { transaction: t });
          
          console.log(`✅ Rol actualizado de ${roleToUpdate.roleId} a ${newRole.id}`);
          
          // ✅ LIMPIAR roles duplicados si existen
          if (existingOrgRoles.length > 1) {
            console.log(`🧹 Eliminando ${existingOrgRoles.length - 1} roles duplicados`);
            for (let i = 1; i < existingOrgRoles.length; i++) {
              await existingOrgRoles[i].destroy({ transaction: t });
            }
          }
        } else {
          // ❌ No debería pasar si el usuario ya existe
          throw new Error(`Usuario no tiene rol asignado en la organización ${targetOrgId}.`);
        }
        
        console.log(`🎯 Cambio de rol completado: ${updateData.roleName}`);
      }
      
      await t.commit();
      
      return await this.getUser(userId, adminUser.adminOrganizations || []);
  
    } catch (error: any) {
      await t.rollback();
      console.error('Error actualizando usuario:', error);
      throw new Error(error.message || 'Error al actualizar el usuario.');
    }
  }
  
  // ELIMINAR USUARIO
  async deleteUser(userId: number, adminUser: AuthenticatedAdminUser): Promise<void> {
    const t = await sequelize.transaction();
  
    try {
      const allowedOrgIds = adminUser.adminOrganizations?.map(org => org.id) || [];
      
      const existingUser = await User.findOne({
        where: { id: userId },
        include: [
          {
            model: UserOrganizationRole,
            as: 'organizationRoleEntries',
            where: { organizationId: { [Op.in]: allowedOrgIds } },
            include: [
              {
                model: Role,
                as: 'role',
                attributes: ['name']
              }
            ],
            required: true
          }
        ],
        transaction: t
      });
  
      if (!existingUser) {
        throw new Error('Usuario no encontrado o no tiene permisos para eliminarlo.');
      }
  
      const currentRoles = existingUser.organizationRoleEntries?.map(entry => entry.role?.name) || [];
      const isCurrentlyAdmin = currentRoles.includes('ADMIN');
      
      if (isCurrentlyAdmin) {
        throw new Error('No se puede eliminar usuarios con rol de administrador.');
      }
  
      await UserOrganizationRole.destroy({
        where: {
          userId: userId,
          organizationId: { [Op.in]: allowedOrgIds }
        },
        transaction: t
      });
  
      const remainingRoles = await UserOrganizationRole.count({
        where: { userId },
        transaction: t
      });
  
      if (remainingRoles === 0) {
        await existingUser.destroy({ transaction: t });
      }
  
      await t.commit();
  
    } catch (error: any) {
      await t.rollback();
      console.error('Error eliminando usuario:', error);
      throw new Error(error.message || 'Error al eliminar el usuario.');
    }
  }
  
  // TOGGLE ESTADO USUARIO
  async toggleUserStatus(userId: number, isActive: boolean, adminUser: AuthenticatedAdminUser): Promise<any> {
    const t = await sequelize.transaction();
  
    try {
      const allowedOrgIds = adminUser.adminOrganizations?.map(org => org.id) || [];
      
      const existingUser = await User.findOne({
        where: { id: userId },
        include: [
          {
            model: UserOrganizationRole,
            as: 'organizationRoleEntries',
            where: { organizationId: { [Op.in]: allowedOrgIds } },
            required: true
          }
        ],
        transaction: t
      });
  
      if (!existingUser) {
        throw new Error('Usuario no encontrado o no tiene permisos para modificarlo.');
      }
  
      await existingUser.update({ isActive }, { transaction: t });
      await t.commit();
  
      return await this.getUser(userId, adminUser.adminOrganizations || []);
  
    } catch (error: any) {
      await t.rollback();
      console.error('Error cambiando estado de usuario:', error);
      throw new Error(error.message || 'Error al cambiar el estado del usuario.');
    }
  }

}



export default new AdminUserService();