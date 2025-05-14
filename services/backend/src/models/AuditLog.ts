import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey, BelongsToGetAssociationMixin } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';

export interface AuditLogAttributes {
  id: CreationOptional<number>;
  tableName: string | null;
  recordId: number | null;
  action: string | null; // e.g., 'CREATE', 'UPDATE', 'DELETE'
  userId: ForeignKey<User['id']> | null; // Puede ser null si la acción es del sistema
  changedAt?: Date;
  // Considerar añadir un campo para los datos antiguos/nuevos, usualmente como JSONB
  // oldValues: object | null;
  // newValues: object | null;
}

export interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'tableName' | 'recordId' | 'action' | 'userId' | 'changedAt'> {}

class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: CreationOptional<number>;
  public tableName!: string | null;
  public recordId!: number | null;
  public action!: string | null;
  public userId!: ForeignKey<User['id']> | null;
  public readonly changedAt!: Date; // Sequelize maneja CURRENT_TIMESTAMP por defecto para createdAt si timestamps:true

  public readonly user?: User;
  public getUser!: BelongsToGetAssociationMixin<User>;

  public static associate(models: { User: typeof User; }) {
    AuditLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
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
      userId: { // Atributo en modelo
        type: DataTypes.INTEGER, allowNull: true, field: 'user_id', // Columna en BD
        references: { model: 'users', key: 'id' }
      },
      // changedAt es manejado por Sequelize como createdAt si timestamps:true y underscored:true mapea a changed_at
      // Si quieres que se llame 'changed_at' y sea diferente de 'created_at'/'updated_at' de Sequelize:
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
      timestamps: true, // Esto creará createdAt y updatedAt. Si changed_at es tu único timestamp, pon false.
                        // O renombra createdAt a changedAt en las opciones del modelo.
      underscored: true,
      createdAt: 'changed_at', // Mapea Sequelize createdAt a tu columna changed_at
      updatedAt: false,      // Deshabilita updatedAt si no lo usas para audit_log
    }
  );
  return AuditLog;
};

export default AuditLog;