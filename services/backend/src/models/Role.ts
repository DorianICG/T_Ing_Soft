import { Model, DataTypes, Sequelize, CreationOptional, Optional, BelongsToManyGetAssociationsMixin, HasManyGetAssociationsMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';
import Organization from './Organization';
import UserOrganizationRole from './UserOrganizationRole';

export interface RoleAttributes {
  id: CreationOptional<number>;
  name: string;
  description: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RoleCreationAttributes extends Optional<RoleAttributes, 'id' | 'description' | 'createdAt' | 'updatedAt'> {}

class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  public id!: CreationOptional<number>;
  public name!: string;
  public description!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly usersWithRole?: User[];
  public getUsersWithRole!: BelongsToManyGetAssociationsMixin<User>;

  public readonly organizationsUsingRole?: Organization[];
  public getOrganizationsUsingRole!: BelongsToManyGetAssociationsMixin<Organization>;

  public readonly userOrganizationRoles?: UserOrganizationRole[];
  public getUserOrganizationRoles!: HasManyGetAssociationsMixin<UserOrganizationRole>;

  public static associate(models: {
    User: typeof User;
    Organization: typeof Organization;
    UserOrganizationRole: typeof UserOrganizationRole;
  }) {
    Role.belongsToMany(models.User, {
      through: models.UserOrganizationRole,
      foreignKey: 'roleId',
      otherKey: 'userId',
      as: 'usersWithRole'
    });

    Role.belongsToMany(models.Organization, {
      through: models.UserOrganizationRole,
      foreignKey: 'roleId',
      otherKey: 'organizationId',
      as: 'organizationsUsingRole'
    });

    Role.hasMany(models.UserOrganizationRole, {
      foreignKey: 'roleId',
      as: 'userOrganizationRoles',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  }
}

export const initRoleModel = () => {
  Role.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(20), allowNull: false, unique: true },
      description: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'roles',
      modelName: 'Role',
      timestamps: true,
      underscored: true,
    }
  );
  return Role;
};

export default Role;