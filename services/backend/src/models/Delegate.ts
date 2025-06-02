import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';
import QrAuthorization from './QrAuthorization';
import Withdrawal from './Withdrawal';

export interface DelegateAttributes {
  id: CreationOptional<number>;
  parentUserId: ForeignKey<User['id']>;
  name: string;
  phone: string | null;
  relationshipToStudent: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DelegateCreationAttributes extends Optional<DelegateAttributes, 'id' | 'phone' | 'relationshipToStudent' | 'createdAt' | 'updatedAt'> {}

class Delegate extends Model<DelegateAttributes, DelegateCreationAttributes> implements DelegateAttributes {
  public id!: CreationOptional<number>;
  public parentUserId!: ForeignKey<User['id']>;
  public name!: string;
  public phone!: string | null;
  public relationshipToStudent!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly parentUser?: User;
  public getParentUser!: BelongsToGetAssociationMixin<User>;

  public readonly qrAuthorizations?: QrAuthorization[];
  public getQrAuthorizations!: HasManyGetAssociationsMixin<QrAuthorization>;
  
  public readonly withdrawalsAsRetriever?: Withdrawal[];
  public getWithdrawalsAsRetriever!: HasManyGetAssociationsMixin<Withdrawal>;


  public static associate(models: {
    User: typeof User;
    QrAuthorization: typeof QrAuthorization;
    Withdrawal: typeof Withdrawal;
  }) {
    Delegate.belongsTo(models.User, {
      foreignKey: 'parentUserId',
      as: 'parentUser'
    });

    Delegate.hasMany(models.QrAuthorization, {
      foreignKey: 'assignedDelegateId',
      as: 'qrAuthorizations'
    });
    
    Delegate.hasMany(models.Withdrawal, {
        foreignKey: 'retrieverDelegateId',
        as: 'withdrawalsAsRetriever'
      });
  }
}

export const initDelegateModel = () => {
  Delegate.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      parentUserId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'parent_user_id',
        references: { model: 'users', key: 'id' }
      },
      name: { type: DataTypes.STRING(255), allowNull: false },
      phone: { type: DataTypes.STRING(50), allowNull: true },
      relationshipToStudent: { type: DataTypes.STRING(100), allowNull: true, field: 'relationship_to_student' },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'delegates',
      modelName: 'Delegate',
      timestamps: true,
      underscored: true,
    }
  );
  return Delegate;
};

export default Delegate;