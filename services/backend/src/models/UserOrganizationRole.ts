import { Model, DataTypes, Sequelize, ForeignKey, Optional, BelongsToGetAssociationMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';
import Organization from './Organization';
import Role from './Role';

export interface UserOrganizationRoleAttributes {
  userId: ForeignKey<User['id']>;
  organizationId: ForeignKey<Organization['id']>;
  roleId: ForeignKey<Role['id']>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserOrganizationRoleCreationAttributes extends UserOrganizationRoleAttributes {}


class UserOrganizationRole extends Model<UserOrganizationRoleAttributes, UserOrganizationRoleCreationAttributes>
  implements UserOrganizationRoleAttributes {
  public userId!: ForeignKey<User['id']>;
  public organizationId!: ForeignKey<Organization['id']>;
  public roleId!: ForeignKey<Role['id']>;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly user?: User;
  public getUser!: BelongsToGetAssociationMixin<User>;

  public readonly organization?: Organization;
  public getOrganization!: BelongsToGetAssociationMixin<Organization>;

  public readonly role?: Role;
  public getRole!: BelongsToGetAssociationMixin<Role>;

  public static associate(models: {
    User: typeof User;
    Organization: typeof Organization;
    Role: typeof Role;
  }) {
    UserOrganizationRole.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    UserOrganizationRole.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    UserOrganizationRole.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role'
    });
  }
}

export const initUserOrganizationRoleModel = () => {
  UserOrganizationRole.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        field: 'user_id',
      },
      organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        references: { model: 'organizations', key: 'id' },
        field: 'organization_id',
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: false,
        references: { model: 'roles', key: 'id' },
        field: 'role_id',
      },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'user_organization_roles',
      modelName: 'UserOrganizationRole',
      timestamps: true,
      underscored: true,
    }
  );
  return UserOrganizationRole;
};

export default UserOrganizationRole;