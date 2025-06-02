import bcrypt from 'bcrypt';
import { User, UserOrganizationRole, Role, Organization } from '../../models';
import { UpdateProfileRequest, ChangePasswordRequest, UserProfileResponse } from '../types/user.types';

class UserService {
  // Obtener perfil del usuario
  async getUserProfile(userId: number): Promise<UserProfileResponse> {
    try {
      const user = await User.findByPk(userId, {
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
            ]
          }
        ]
      });
  
      if (!user) {
        throw new Error('Usuario no encontrado.');
      }
  
      const userJson = user.toJSON() as any;
      
      const roles = userJson.organizationRoleEntries?.map((entry: any) => entry.role?.name).filter(Boolean) || [];
  
      return {
        id: userJson.id,
        rut: userJson.rut,
        email: userJson.email,
        firstName: userJson.firstName,
        lastName: userJson.lastName,
        roles: roles 
      };
  
    } catch (error: any) {
      console.error('Error al obtener perfil de usuario:', error);
      throw new Error('Error al obtener el perfil del usuario.');
    }
  }

  // Actualizar perfil del usuario
  async updateUserProfile(userId: number, updateData: UpdateProfileRequest): Promise<UserProfileResponse> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado.');
      }
  
      const fieldsToUpdate: any = {};
      
      // Solo actualizar email si se envió en el request
      if (updateData.email !== undefined) {
        fieldsToUpdate.email = updateData.email;
      }
      
      // Solo actualizar phone si se envió en el request  
      if (updateData.phone !== undefined) {
        fieldsToUpdate.phone = updateData.phone || null; 
      }
  
      if (Object.keys(fieldsToUpdate).length === 0) {
        throw new Error('No se proporcionaron campos para actualizar.');
      }
  
      await user.update(fieldsToUpdate);
  
      // Retornar el perfil actualizado
      return await this.getUserProfile(userId);
  
    } catch (error: any) {
      console.error('Error al actualizar perfil de usuario:', error);
      throw new Error('Error al actualizar el perfil del usuario.');
    }
  }

  // Cambiar contraseña del usuario
  async changeUserPassword(userId: number, passwordData: ChangePasswordRequest): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      
      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      // Verificar contraseña actual
      const isValidPassword = await bcrypt.compare(passwordData.currentPassword, user.passwordHash);
      
      if (!isValidPassword) {
        throw new Error('La contraseña actual es incorrecta.');
      }

      // Verificar que la nueva contraseña sea diferente a la actual
      const isSamePassword = await bcrypt.compare(passwordData.newPassword, user.passwordHash);
      
      if (isSamePassword) {
        throw new Error('La nueva contraseña debe ser diferente a la actual.');
      }

      // Hashear nueva contraseña
      const saltRounds = 12;
      const newPasswordHash = await bcrypt.hash(passwordData.newPassword, saltRounds);

      // Actualizar contraseña y resetear intentos fallidos
      await user.update({
        passwordHash: newPasswordHash,
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        accountLocked: false
      });

    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error);
      if (error.message.includes('incorrecta') || error.message.includes('diferente')) {
        throw error;
      }
      throw new Error('Error al cambiar la contraseña.');
    }
  }
}

export default new UserService();