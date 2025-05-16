import bcrypt from 'bcrypt';
import { User, Role, Organization, UserOrganizationRole } from '../../models';
import { UserAttributes, UserCreationAttributes } from '../../models/User';
import { AuthenticatedAdminUser } from '../middlewares/admin.auth.middleware'; 
import sequelizeInstance from '../../config/database';
import { FindOptions, Op } from 'sequelize';
import { formatearRut } from '../../utils/rutValidator';

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
  async createUser(data: UserCreationRequestData, adminUser: AuthenticatedAdminUser): Promise<ReturnedUserAttributes> {
    if (!adminUser || !adminUser.adminOrganizations || adminUser.adminOrganizations.length === 0) {
        throw new Error("El usuario administrador no tiene organizaciones válidas asignadas o no se pudieron determinar.");
    }

    let targetOrganizationId: number;

    if (adminUser.adminOrganizations.length === 1) {
        targetOrganizationId = adminUser.adminOrganizations[0].id;
        if (data.organizationId !== undefined && data.organizationId !== targetOrganizationId) {
            throw new Error(`El administrador pertenece a una única organización (ID: ${targetOrganizationId}). El ID de organización proporcionado (${data.organizationId}) es incorrecto o no necesario.`);
        }
        console.log(`Administrador pertenece a una organización. Creando usuario en organización ID: ${targetOrganizationId}`);
    } else { 
        if (data.organizationId === undefined || data.organizationId === null) {
            throw new Error("El administrador pertenece a múltiples organizaciones. Debe especificar un 'organizationId' para el nuevo usuario.");
        }
        const isValidOrgForAdmin = adminUser.adminOrganizations.some(org => org.id === data.organizationId);
        if (!isValidOrgForAdmin) {
            throw new Error(`El 'organizationId' (${data.organizationId}) proporcionado no corresponde a una organización válida para el administrador.`);
        }
        targetOrganizationId = data.organizationId;
        console.log(`Administrador pertenece a múltiples organizaciones. Creando usuario en organización ID seleccionada: ${targetOrganizationId}`);
    }

    const formattedRut = formatearRut(data.rut);
    if (!formattedRut.includes('-')) { 
        throw new Error('El RUT proporcionado no tiene el formato esperado después de la normalización (ej: 12345678-9).');
    }

    console.log(`Validando RUT formateado: ${formattedRut}`);
    const existingUserByRut = await User.findOne({ where: { rut: formattedRut } }); // Use formattedRut for check
    if (existingUserByRut) {
      console.log(`RUT encontrado: ${existingUserByRut.rut}, ID: ${existingUserByRut.id}`);
      throw new Error(`El RUT '${formattedRut}' ya está registrado.`);
    }
    console.log(`RUT ${formattedRut} es único, procediendo...`);

    let passwordToHash = data.password;
    if (!passwordToHash) {
      const rutParts = formattedRut.split('-');
      if (rutParts.length > 0 && rutParts[0]) {
        passwordToHash = rutParts[0];
      } else {
        throw new Error('Formato de RUT inválido para generar contraseña por defecto después de la normalización.');
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
        throw new Error(`Organización con ID '${targetOrganizationId}' no encontrada. Esto no debería ocurrir si la validación previa fue correcta.`);
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

    const t = await sequelizeInstance.transaction();

    try {
      const newUser = await User.create(creationAttributes, { transaction: t });
      
      await UserOrganizationRole.create({
          userId: newUser.id,
          organizationId: targetOrganizationId,
          roleId: roleForNewUser.id,
      }, { transaction: t });

      await t.commit();

      const userToReturn = newUser.toJSON() as UserAttributes;
      const { passwordHash: omitPassword, ...returnedUser } = userToReturn; 
      return returnedUser as ReturnedUserAttributes;


    } catch (error: any) {
      await t.rollback();
      console.error('Error al crear usuario y asignar rol/organización:', error);
      if (error.message.includes('ya está registrado') || error.message.includes('no encontrado') || error.message.includes('organización') || error.message.includes('RUT') || error.message.includes('Rol')) {
        throw error;
      }
      throw new Error('Error interno al crear el usuario.');
    }
  
  }

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
}



export default new AdminUserService();