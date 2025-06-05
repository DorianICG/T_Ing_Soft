import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey, BelongsToGetAssociationMixin, HasOneGetAssociationMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import Student from './Student';
import User from './User';
import WithdrawalReason from './WithdrawalReason';
import Delegate from './Delegate';
import Withdrawal from './Withdrawal';

export interface QrAuthorizationAttributes {
  id: CreationOptional<number>;
  code: string;
  studentId: ForeignKey<Student['id']>;
  generatedByUserId: ForeignKey<User['id']>;
  reasonId: ForeignKey<WithdrawalReason['id']>;
  expiresAt: Date;
  isUsed: boolean;
  customWithdrawalReason: string | null;
  assignedDelegateId: ForeignKey<Delegate['id']> | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface QrAuthorizationCreationAttributes extends Optional<QrAuthorizationAttributes, 'id' | 'isUsed' | 'customWithdrawalReason' | 'assignedDelegateId' | 'createdAt' | 'updatedAt'> {}

class QrAuthorization extends Model<QrAuthorizationAttributes, QrAuthorizationCreationAttributes> implements QrAuthorizationAttributes {
  public id!: CreationOptional<number>;
  public code!: string;
  public studentId!: ForeignKey<Student['id']>;
  public generatedByUserId!: ForeignKey<User['id']>;
  public reasonId!: ForeignKey<WithdrawalReason['id']>;
  public expiresAt!: Date;
  public isUsed!: boolean;
  public customWithdrawalReason!: string | null;
  public assignedDelegateId!: ForeignKey<Delegate['id']> | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public readonly student?: Student;
  public getStudent!: BelongsToGetAssociationMixin<Student>;

  public readonly generatedByUser?: User;
  public getGeneratedByUser!: BelongsToGetAssociationMixin<User>;

  public readonly reason?: WithdrawalReason;
  public getReason!: BelongsToGetAssociationMixin<WithdrawalReason>;

  public readonly assignedDelegate?: Delegate;
  public getAssignedDelegate!: BelongsToGetAssociationMixin<Delegate>;
  
  public readonly withdrawal?: Withdrawal;
  public getWithdrawal!: HasOneGetAssociationMixin<Withdrawal>;


  public static associate(models: {
    Student: typeof Student;
    User: typeof User;
    WithdrawalReason: typeof WithdrawalReason;
    Delegate: typeof Delegate;
    Withdrawal: typeof Withdrawal;
  }) {
    QrAuthorization.belongsTo(models.Student, {
      foreignKey: 'studentId',
      as: 'student'
    });

    QrAuthorization.belongsTo(models.User, {
      foreignKey: 'generatedByUserId',
      as: 'generatedByUser'
    });

    QrAuthorization.belongsTo(models.WithdrawalReason, {
      foreignKey: 'reasonId',
      as: 'reason',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });

    QrAuthorization.belongsTo(models.Delegate, {
      foreignKey: 'assignedDelegateId',
      as: 'assignedDelegate',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    QrAuthorization.hasOne(models.Withdrawal, {
        foreignKey: 'qrAuthorizationId',
        as: 'withdrawal',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      });
  }
}

export const initQrAuthorizationModel = () => {
  QrAuthorization.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      code: { type: DataTypes.STRING(255), allowNull: false, unique: true },
      studentId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'student_id',
        references: { model: 'students', key: 'id' }
      },
      generatedByUserId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'generated_by_user_id',
        references: { model: 'users', key: 'id' }
      },
      reasonId: {
        type: DataTypes.INTEGER, allowNull: false, field: 'reason_id',
        references: { model: 'withdrawal_reasons', key: 'id' }
      },
      expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
      isUsed: { type: DataTypes.BOOLEAN, defaultValue: false, field: 'is_used' },
      customWithdrawalReason: { type: DataTypes.TEXT, allowNull: true, field: 'custom_withdrawal_reason' },
      assignedDelegateId: {
        type: DataTypes.INTEGER, allowNull: true, field: 'assigned_delegate_id',
        references: { model: 'delegates', key: 'id' }
      },
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'qr_authorizations',
      modelName: 'QrAuthorization',
      timestamps: true,
      underscored: true,
    }
  );
  return QrAuthorization;
};

export default QrAuthorization;