import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import Role from './Role'; 

class User extends Model {
  public id!: number;
  public rut!: string;
  public email!: string;
  public passwordHash!: string;
  public firstName!: string;
  public lastName!: string;
  public phone?: string | null;
  public roleId!: number;
  public isActive!: boolean;
  public lastLogin?: Date | null;
  public failedLoginAttempts!: number;
  public accountLocked!: boolean;
  public lastFailedLogin?: Date | null;
  public mfaCodeHash?: string | null;
  public mfaCodeExpiresAt?: Date | null;
  public resetPasswordTokenHash?: string | null;
  public resetPasswordExpiresAt?: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly role?: Role; 

  public static associate(models: any) {
    User.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role' 
    });
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  rut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'rut', 
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
    field: 'email',
  },
  passwordHash: { 
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash', 
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'first_name', 
  },
  lastName: { 
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'last_name', 
  },
  phone: {
    type: DataTypes.STRING(20),
    field: 'phone', 
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id',
    },
    field: 'role_id'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_active'
  },
  lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login'
  },
  failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'failed_login_attempts'
  },
  accountLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'account_locked'
  },
  lastFailedLogin: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_failed_login'
  },
  mfaCodeHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'mfa_code_hash',
  },
  mfaCodeExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'mfa_code_expires_at',
  },
  resetPasswordTokenHash: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'reset_password_token_hash',
  },
  resetPasswordExpiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reset_password_expires_at',
  },
}, {
  tableName: 'users',
  sequelize,
  timestamps: true,
  underscored: true
});

export default User;