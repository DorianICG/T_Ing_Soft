import { Model, DataTypes, Sequelize, CreationOptional, Optional, HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin, BelongsToManyGetAssociationsMixin, BelongsToManyAddAssociationMixin, BelongsToManyHasAssociationMixin, BelongsToManyCountAssociationsMixin, BelongsToManyCreateAssociationMixin, BelongsToManyRemoveAssociationMixin, BelongsToManySetAssociationsMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import UserOrganizationRole from './UserOrganizationRole';
import Organization from './Organization';
import Role from './Role';
import Student from './Student';
import EmergencyContact from './EmergencyContact';
import Withdrawal from './Withdrawal';
import Delegate from './Delegate';
import QrAuthorization from './QrAuthorization';
// import AuditLog from './AuditLog'; // Descomentar si se implementa AuditLog

export interface UserAttributes {
  id: CreationOptional<number>;
  rut: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  isActive: boolean;
  lastLogin: Date | null;
  failedLoginAttempts: number;
  accountLocked: boolean;
  lastFailedLogin: Date | null;
  mfaCodeHash: string | null;
  mfaCodeExpiresAt: Date | null;
  resetPasswordTokenHash: string | null;
  resetPasswordExpiresAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes,
  'id' |
  'isActive' |
  'lastLogin' |
  'failedLoginAttempts' |
  'accountLocked' |
  'lastFailedLogin' |
  'mfaCodeHash' |
  'mfaCodeExpiresAt' |
  'resetPasswordTokenHash' |
  'resetPasswordExpiresAt' |
  'createdAt' |
  'updatedAt'
> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: CreationOptional<number>;
  public rut!: string;
  public email!: string;
  public passwordHash!: string;
  public firstName!: string;
  public lastName!: string;
  public phone!: string;
  public isActive!: boolean;
  public lastLogin!: Date | null;
  public failedLoginAttempts!: number;
  public accountLocked!: boolean;
  public lastFailedLogin!: Date | null;
  public mfaCodeHash!: string | null;
  public mfaCodeExpiresAt!: Date | null;
  public resetPasswordTokenHash!: string | null;
  public resetPasswordExpiresAt!: Date | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // --- ASOCIACIONES ---
  public readonly organizationRoleEntries?: UserOrganizationRole[];
  public getOrganizationRoleEntries!: HasManyGetAssociationsMixin<UserOrganizationRole>;
  public addOrganizationRoleEntry!: HasManyAddAssociationMixin<UserOrganizationRole, number>; 
  public hasOrganizationRoleEntry!: HasManyHasAssociationMixin<UserOrganizationRole, number>;
  public countOrganizationRoleEntries!: HasManyCountAssociationsMixin;
  public createOrganizationRoleEntry!: HasManyCreateAssociationMixin<UserOrganizationRole>;


  public readonly organizations?: Organization[];
  public getOrganizations!: BelongsToManyGetAssociationsMixin<Organization>;
  public addOrganization!: BelongsToManyAddAssociationMixin<Organization, number>;
  public hasOrganization!: BelongsToManyHasAssociationMixin<Organization, number>;
  public countOrganizations!: BelongsToManyCountAssociationsMixin;
  public createOrganization!: BelongsToManyCreateAssociationMixin<Organization>;
  public removeOrganization!: BelongsToManyRemoveAssociationMixin<Organization, number>;
  public setOrganizations!: BelongsToManySetAssociationsMixin<Organization, number>;


  public readonly roles?: Role[];
  public getRoles!: BelongsToManyGetAssociationsMixin<Role>;
  public addRole!: BelongsToManyAddAssociationMixin<Role, number>;
  public hasRole!: BelongsToManyHasAssociationMixin<Role, number>;
  public countRoles!: BelongsToManyCountAssociationsMixin;
  public createRole!: BelongsToManyCreateAssociationMixin<Role>;
  public removeRole!: BelongsToManyRemoveAssociationMixin<Role, number>;
  public setRoles!: BelongsToManySetAssociationsMixin<Role, number>;

  public readonly studentsSupervised?: Student[];
  public getStudentsSupervised!: HasManyGetAssociationsMixin<Student>;

  public readonly emergencyContacts?: EmergencyContact[];
  public getEmergencyContacts!: HasManyGetAssociationsMixin<EmergencyContact>;

  public readonly retrievedWithdrawals?: Withdrawal[];
  public getRetrievedWithdrawals!: HasManyGetAssociationsMixin<Withdrawal>;

  public readonly guardianAuthorizedWithdrawals?: Withdrawal[];
  public getGuardianAuthorizedWithdrawals!: HasManyGetAssociationsMixin<Withdrawal>;

  public readonly approvedWithdrawals?: Withdrawal[];
  public getApprovedWithdrawals!: HasManyGetAssociationsMixin<Withdrawal>;

  public readonly delegates?: Delegate[]; 
  public getDelegates!: HasManyGetAssociationsMixin<Delegate>;

  public readonly generatedQrAuthorizations?: QrAuthorization[]; 
  public getGeneratedQrAuthorizations!: HasManyGetAssociationsMixin<QrAuthorization>;



  public static associate(models: {
    UserOrganizationRole: typeof UserOrganizationRole;
    Organization: typeof Organization;
    Role: typeof Role;
    Student: typeof Student;
    EmergencyContact: typeof EmergencyContact;
    Withdrawal: typeof Withdrawal;
    Delegate: typeof Delegate;
    QrAuthorization: typeof QrAuthorization;
    // AuditLog: typeof AuditLog;
  }) {
    this.hasMany(models.UserOrganizationRole, {
      foreignKey: 'userId',
      as: 'organizationRoleEntries',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    this.belongsToMany(models.Organization, {
      through: models.UserOrganizationRole,
      foreignKey: 'userId',
      otherKey: 'organizationId',
      as: 'organizations'
    });

    this.belongsToMany(models.Role, {
      through: models.UserOrganizationRole,
      foreignKey: 'userId',
      otherKey: 'roleId',
      as: 'roles'
    });

    this.hasMany(models.Student, {
      foreignKey: 'parentId',
      as: 'studentsSupervised',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.hasMany(models.EmergencyContact, {
      foreignKey: 'parentUserId',
      as: 'emergencyContacts',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    this.hasMany(models.Withdrawal, {
      foreignKey: 'retrieverUserId',
      as: 'retrievedWithdrawals',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.hasMany(models.Withdrawal, {
      foreignKey: 'guardianAuthorizerUserId',
      as: 'guardianAuthorizedWithdrawals',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.hasMany(models.Withdrawal, {
      foreignKey: 'organizationApproverUserId',
      as: 'approvedWithdrawals',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    this.hasMany(models.Delegate, {
      foreignKey: 'parentUserId',
      as: 'delegates',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    this.hasMany(models.QrAuthorization, {
      foreignKey: 'generatedByUserId',
      as: 'generatedQrAuthorizations',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });


  }
}

export const initUserModel = () => { 
  User.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      rut: { type: DataTypes.STRING(10), allowNull: false, unique: true },
      email: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'NO TIENE' },
      passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
      firstName: { type: DataTypes.STRING(50), allowNull: false, field: 'first_name' },
      lastName: { type: DataTypes.STRING(50), allowNull: false, field: 'last_name' },
      phone: { type: DataTypes.STRING(15), allowNull: false, defaultValue: 'NO TIENE' },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: 'is_active' },
      lastLogin: { type: DataTypes.DATE, allowNull: true, field: 'last_login' },
      failedLoginAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, field: 'failed_login_attempts' },
      accountLocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false, field: 'account_locked' },
      lastFailedLogin: { type: DataTypes.DATE, allowNull: true, field: 'last_failed_login' },
      mfaCodeHash: { type: DataTypes.STRING(255), allowNull: true, field: 'mfa_code_hash' },
      mfaCodeExpiresAt: { type: DataTypes.DATE, allowNull: true, field: 'mfa_code_expires_at' },
      resetPasswordTokenHash: { type: DataTypes.STRING(255), allowNull: true, field: 'reset_password_token_hash' },
      resetPasswordExpiresAt: { type: DataTypes.DATE, allowNull: true, field: 'reset_password_expires_at' },
    },
    {
      tableName: 'users',
      sequelize: sequelizeInstance, 
      modelName: 'User',
      timestamps: true,
      underscored: true,
    }
  );
  return User;
};

export default User;