import { Model, DataTypes, Sequelize, CreationOptional, Optional, HasManyGetAssociationsMixin, BelongsToManyGetAssociationsMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import Course from './Course';
import Student from './Student';
import UserOrganizationRole from './UserOrganizationRole';
import User from './User';
import Role from './Role';
import Withdrawal from './Withdrawal';

export interface OrganizationAttributes {
  id: CreationOptional<number>;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrganizationCreationAttributes extends Optional<OrganizationAttributes, 'id' | 'address' | 'phone' | 'isActive' | 'createdAt' | 'updatedAt'> {}

class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
  public id!: CreationOptional<number>;
  public name!: string;
  public address!: string | null;
  public phone!: string | null;
  public isActive!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly courses?: Course[];
  public getCourses!: HasManyGetAssociationsMixin<Course>;

  public readonly students?: Student[];
  public getStudents!: HasManyGetAssociationsMixin<Student>;

  public readonly userOrganizationRoles?: UserOrganizationRole[];
  public getUserOrganizationRoles!: HasManyGetAssociationsMixin<UserOrganizationRole>;

  public readonly users?: User[];
  public getUsers!: BelongsToManyGetAssociationsMixin<User>;

  public readonly roles?: Role[];
  public getRoles!: BelongsToManyGetAssociationsMixin<Role>;

  public readonly withdrawals?: Withdrawal[];
  public getWithdrawals!: HasManyGetAssociationsMixin<Withdrawal>;

  public static associate(models: {
    Course: typeof Course;
    Student: typeof Student;
    UserOrganizationRole: typeof UserOrganizationRole;
    User: typeof User;
    Role: typeof Role;
    Withdrawal: typeof Withdrawal;
  }) {
    Organization.hasMany(models.Course, {
      foreignKey: 'organizationId',
      as: 'courses',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    Organization.hasMany(models.Student, {
      foreignKey: 'organizationId',
      as: 'students',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    Organization.hasMany(models.UserOrganizationRole, {
      foreignKey: 'organizationId',
      as: 'userOrganizationRoles',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    Organization.belongsToMany(models.User, {
      through: models.UserOrganizationRole,
      foreignKey: 'organizationId',
      otherKey: 'userId',
      as: 'users'
    });

    Organization.belongsToMany(models.Role, {
      through: models.UserOrganizationRole,
      foreignKey: 'organizationId',
      otherKey: 'roleId',
      as: 'roles'
    });
    
    Organization.hasMany(models.Withdrawal, {
        foreignKey: 'organizationId',
        as: 'withdrawals'
      });
  }
}

export const initOrganizationModel = () => {
  Organization.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      address: { type: DataTypes.TEXT, allowNull: true },
      phone: { type: DataTypes.STRING(20), allowNull: true },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true, field: 'is_active' },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'organizations',
      modelName: 'Organization',
      timestamps: true,
      underscored: true,
    }
  );
  return Organization;
};

export default Organization;