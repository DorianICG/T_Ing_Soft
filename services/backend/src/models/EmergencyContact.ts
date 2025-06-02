import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';
import Withdrawal from './Withdrawal';

export interface EmergencyContactAttributes {
  id: CreationOptional<number>;
  parentUserId: ForeignKey<User['id']>;
  name: string;
  phone: string;
  relationship: string;
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EmergencyContactCreationAttributes extends Optional<EmergencyContactAttributes, 'id' | 'isVerified' | 'createdAt' | 'updatedAt'> {}

class EmergencyContact extends Model<EmergencyContactAttributes, EmergencyContactCreationAttributes> implements EmergencyContactAttributes {
  public id!: CreationOptional<number>;
  public parentUserId!: ForeignKey<User['id']>;
  public name!: string;
  public phone!: string;
  public relationship!: string;
  public isVerified!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly parentUser?: User;
  public getParentUser!: BelongsToGetAssociationMixin<User>;

  public readonly withdrawalsAsRetriever?: Withdrawal[];
  public getWithdrawalsAsRetriever!: HasManyGetAssociationsMixin<Withdrawal>;

  public readonly withdrawalsAsGuardianAuthorizer?: Withdrawal[];
  public getWithdrawalsAsGuardianAuthorizer!: HasManyGetAssociationsMixin<Withdrawal>;

  public static associate(models: {
    User: typeof User;
    Withdrawal: typeof Withdrawal;
  }) {
    EmergencyContact.belongsTo(models.User, {
      foreignKey: 'parentUserId',
      as: 'parentUser'
    });

    EmergencyContact.hasMany(models.Withdrawal, {
        foreignKey: 'retrieverEmergencyContactId',
        as: 'withdrawalsAsRetriever'
      });
  
    EmergencyContact.hasMany(models.Withdrawal, {
        foreignKey: 'guardianAuthorizerEmergencyContactId',
        as: 'withdrawalsAsGuardianAuthorizer'
      });
  }
}

export const initEmergencyContactModel = () => {
  EmergencyContact.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      parentUserId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'parent_user_id',
        references: { model: 'users', key: 'id' }
      },
      name: { type: DataTypes.STRING(100), allowNull: false },
      phone: { type: DataTypes.STRING(20), allowNull: false },
      relationship: { type: DataTypes.STRING(50), allowNull: false },
      isVerified: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_verified' },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'emergency_contacts',
      modelName: 'EmergencyContact',
      timestamps: true,
      underscored: true,
    }
  );
  return EmergencyContact;
};

export default EmergencyContact;