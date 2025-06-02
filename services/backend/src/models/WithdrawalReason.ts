import { Model, DataTypes, Sequelize, CreationOptional, Optional, HasManyGetAssociationsMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import QrAuthorization from './QrAuthorization';
import Withdrawal from './Withdrawal';

export interface WithdrawalReasonAttributes {
  id: CreationOptional<number>;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WithdrawalReasonCreationAttributes extends Optional<WithdrawalReasonAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class WithdrawalReason extends Model<WithdrawalReasonAttributes, WithdrawalReasonCreationAttributes> implements WithdrawalReasonAttributes {
  public id!: CreationOptional<number>;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly qrAuthorizations?: QrAuthorization[];
  public getQrAuthorizations!: HasManyGetAssociationsMixin<QrAuthorization>;

  public readonly withdrawals?: Withdrawal[];
  public getWithdrawals!: HasManyGetAssociationsMixin<Withdrawal>;

  public static associate(models: {
    QrAuthorization: typeof QrAuthorization;
    Withdrawal: typeof Withdrawal;
  }) {
    WithdrawalReason.hasMany(models.QrAuthorization, {
      foreignKey: 'reasonId',
      as: 'qrAuthorizations'
    });

    WithdrawalReason.hasMany(models.Withdrawal, {
      foreignKey: 'reasonId',
      as: 'withdrawals'
    });
  }
}

export const initWithdrawalReasonModel = () => {
  WithdrawalReason.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'withdrawal_reasons',
      modelName: 'WithdrawalReason',
      timestamps: true,
      underscored: true,
    }
  );
  return WithdrawalReason;
};

export default WithdrawalReason;