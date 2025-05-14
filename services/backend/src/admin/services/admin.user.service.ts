import bcrypt from 'bcrypt';
import User, { UserCreationAttributes, UserAttributes } from '../../models/User'; 
import Role from '../../models/Role';
import { Op, FindOptions } from 'sequelize';

interface UserCreationRequestData {
  firstName: string;
  lastName: string;
  rut: string;
  email?: string; 
  phone?: string; 
  password?: string;
  roleName: string;
  isActive?: boolean;
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

class AdminUserService {
  async createUser(data: UserCreationRequestData): Promise<User> {
    console.log(`Validando RUT: ${data.rut}`); 
    const existingUserByRut = await User.findOne({ where: { rut: data.rut } });
    if (existingUserByRut) {
      console.log(`RUT encontrado: ${existingUserByRut.rut}, ID: ${existingUserByRut.id}`);
      throw new Error(`El RUT '${data.rut}' ya está registrado.`); 
    }
    console.log(`RUT ${data.rut} es único, procediendo...`);

    let passwordToHash = data.password;
    if (!passwordToHash) {
      const rutWithoutDV = data.rut.split('-')[0];
      if (!rutWithoutDV) {
        throw new Error('Formato de RUT inválido para generar contraseña por defecto.');
      }
      passwordToHash = rutWithoutDV;
    }
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(passwordToHash, saltRounds);

    const role = await Role.findOne({ where: { name: data.roleName } });
    if (!role) {
      throw new Error(`Rol '${data.roleName}' no encontrado.`);
    }

    // Preparar atributos para la creación
    const creationAttributes: UserCreationAttributes = {
      rut: data.rut,
      email: (data.email && data.email.trim() !== '') ? data.email.trim() : 'NO TIENE',
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: (data.phone && data.phone.trim() !== '') ? data.phone.trim() : 'NO TIENE',
      roleId: role.id,
      isActive: data.isActive !== undefined ? data.isActive : true,
      failedLoginAttempts: 0,
      accountLocked: false,
      id: undefined,
      lastLogin: null,
      lastFailedLogin: null,
      mfaCodeHash: null,
      mfaCodeExpiresAt: null,
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
    };

    try {
      const newUser = await User.create(creationAttributes);
      const result = newUser.toJSON();
      delete (result as any).passwordHash;
      return result as User;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        console.error('SequelizeUniqueConstraintError detectado:', JSON.stringify(error, null, 2));
        let message = 'Error de unicidad. Uno de los campos ya existe.';
        const constraint = error.original?.constraint;
        const detail = error.original?.detail; // Contiene el detalle como "Ya existe la llave (email)=(...)"
    
        if (constraint) {
          if (constraint.includes('email')) { // Como 'users_email_key'
            message = `El email proporcionado ya está registrado. (${detail || constraint})`;
          } else if (constraint.includes('rut')) { // Como 'users_rut_key'
            message = `El RUT proporcionado ya está registrado. (${detail || constraint})`;
          } else {
            message = `Un campo viola una restricción de unicidad: ${constraint}. (${detail || ''})`;
          }
        } else if (error.errors && error.errors.length > 0) { // Fallback si 'constraint' no está pero 'errors' sí
          const specificError = error.errors[0];
          const field = specificError.path || 'desconocido';
          const value = specificError.value || 'desconocido';
          message = `Error de unicidad: El campo '${field}' con valor '${value}' ya existe.`;
        }
        // Si 'detail' existe y no se usó 'constraint', podría ser útil
        else if (detail) {
            message = `Error de unicidad: ${detail}`;
        }
        throw new Error(message);
      }
      console.error('Error al crear usuario en servicio:', error);
      throw new Error('Error interno al crear el usuario.');
    }
  }

  async updateUser(userId: number, data: UserUpdateRequestData): Promise<User | null> {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }

    if (data.rut && data.rut !== user.rut) {
      const existingUserByRut = await User.findOne({
        where: { rut: data.rut, id: { [Op.ne]: userId } },
      });
      if (existingUserByRut) {
        throw new Error(`El RUT '${data.rut}' ya está registrado por otro usuario.`);
      }
    }

    const emailToValidateOnUpdate = (data.email && data.email.trim().toUpperCase() !== 'NO TIENE')
      ? data.email.trim()
      : null;

    if (emailToValidateOnUpdate && emailToValidateOnUpdate !== user.email) {
      const existingUserByEmail = await User.findOne({
        where: { email: emailToValidateOnUpdate, id: { [Op.ne]: userId } },
      });
      if (existingUserByEmail) {
        throw new Error(`El email '${emailToValidateOnUpdate}' ya está registrado por otro usuario.`);
      }
    }

    const updatePayload: Partial<UserAttributes> = {}; 

    if (data.firstName !== undefined) updatePayload.firstName = data.firstName;
    if (data.lastName !== undefined) updatePayload.lastName = data.lastName;
    if (data.rut !== undefined) updatePayload.rut = data.rut;
    if (data.isActive !== undefined) updatePayload.isActive = data.isActive;

    if (data.email !== undefined) {
      updatePayload.email = (data.email && data.email.trim() !== '') ? data.email.trim() : 'NO TIENE';
    }
    if (data.phone !== undefined) {
      updatePayload.phone = (data.phone && data.phone.trim() !== '') ? data.phone.trim() : 'NO TIENE';
    }

    if (data.password) {
      const saltRounds = 10;
      updatePayload.passwordHash = await bcrypt.hash(data.password, saltRounds);
    }

    if (data.roleName) {
      const role = await Role.findOne({ where: { name: data.roleName } });
      if (!role) {
        throw new Error(`Rol '${data.roleName}' no encontrado.`);
      }
      updatePayload.roleId = role.id; 
    }

    try {
      await user.update(updatePayload);
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['passwordHash'] },
        include: [{ model: Role, as: 'role' }]
      });
      return updatedUser;
    } catch (error: any) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        const field = error.errors[0]?.path;
        const value = error.errors[0]?.value;
        throw new Error(`Error de unicidad al actualizar: El campo '${field}' con valor '${value}' ya existe.`);
      }
      console.error('Error al actualizar usuario en servicio:', error);
      throw new Error('Error interno al actualizar el usuario.');
    }
  }
  async getUserById(userId: number): Promise<User | null> {
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Role, as: 'role' }],
    });
    return user;
  }

  async getAllUsers(filters: ListUsersFilters): Promise<{ rows: User[]; count: number }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', roleName, isActive, search } = filters;
    const offset = (page - 1) * limit;

    const whereConditions: any = {};
    if (roleName) {
      const role = await Role.findOne({ where: { name: roleName } });
      if (role) {
        whereConditions.roleId = role.id;
      } else {
        return { rows: [], count: 0 };
      }
    }
    if (isActive !== undefined) {
      whereConditions.isActive = isActive;
    }
    if (search) {
      whereConditions[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { rut: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const validUserSortFields = ['id', 'firstName', 'lastName', 'email', 'rut', 'createdAt', 'updatedAt'];
    let effectiveSortBy = sortBy;
    if (!validUserSortFields.includes(sortBy)) {
        console.warn(`sortBy field '${sortBy}' is not a recognized User field. Defaulting to 'createdAt'.`);
        effectiveSortBy = 'createdAt';
    }


    const options: FindOptions = {
      where: whereConditions,
      offset,
      limit,
      order: [[effectiveSortBy, sortOrder]],
      attributes: { exclude: ['passwordHash'] },
      include: [{ model: Role, as: 'role', attributes: ['id', 'name'] }],
    };

    const { rows, count } = await User.findAndCountAll(options);
    return { rows, count };
  }

  async deactivateUser(userId: number): Promise<User | null> {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }
    await user.update({ isActive: false });
    const deactivatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['passwordHash'] },
        include: [{ model: Role, as: 'role' }]
    });
    return deactivatedUser;
  }

  async activateUser(userId: number): Promise<User | null> {
    const user = await User.findByPk(userId);
    if (!user) {
      return null;
    }
    await user.update({ isActive: true });
    const activatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['passwordHash'] },
        include: [{ model: Role, as: 'role' }]
    });
    return activatedUser;
  }

  async deleteUser(userId: number): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }
    await user.destroy();
    return true;
  }
}

export default new AdminUserService();