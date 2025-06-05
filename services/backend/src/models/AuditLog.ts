import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey, BelongsToGetAssociationMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';

export interface AuditLogAttributes {
  id: CreationOptional<number>;
  tableName: string | null;
  recordId: number | null;
  action: string | null; 
  userId: ForeignKey<User['id']> | null;
  changedAt?: Date;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'tableName' | 'recordId' | 'action' | 'userId' | 'changedAt'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: CreationOptional<number>;
  public tableName!: string | null;
  public recordId!: number | null;
  public action!: string | null;
  public userId!: ForeignKey<User['id']> | null;
  public readonly changedAt!: Date; 

  public readonly user?: User;
  public getUser!: BelongsToGetAssociationMixin<User>;

  public static associate(models: { User: typeof User; }) {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
}

export const initAuditLogModel = () => {
  AuditLog.init(
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      tableName: { type: DataTypes.STRING(50), allowNull: true, field: 'table_name' },
      recordId: { type: DataTypes.INTEGER, allowNull: true, field: 'record_id' },
      action: { type: DataTypes.STRING(10), allowNull: true },
      userId: { 
        type: DataTypes.INTEGER, allowNull: true, field: 'user_id', 
        references: { model: 'users', key: 'id' }
      },
      changedAt: {
        type: DataTypes.DATE,
        field: 'changed_at',
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize: sequelizeInstance,
      tableName: 'audit_log',
      modelName: 'AuditLog',
      timestamps: true,
      underscored: true,
      createdAt: 'changed_at', 
      updatedAt: false, 
    }
  );
  return AuditLog;
};

export default AuditLog;