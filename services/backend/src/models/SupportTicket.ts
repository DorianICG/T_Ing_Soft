import { Model, DataTypes, CreationOptional, Optional, ForeignKey } from 'sequelize';
import sequelizeInstance from '../config/database';
import User from './User';

export interface SupportTicketAttributes {
  id_ticket: CreationOptional<number>;
  user_id: ForeignKey<User['id']>;
  description: string;
  attachment?: string | null;
  tracking_number: string;
  status: 'open' | 'in progress' | 'closed';
  admin_response?: string | null;
  admin_user_id?: number | null;
  created_at: CreationOptional<Date>;
  responded_at?: Date | null;
}

export interface SupportTicketCreationAttributes extends Optional<SupportTicketAttributes, 'id_ticket' | 'attachment' | 'admin_response' | 'admin_user_id' | 'created_at' | 'responded_at' | 'status'> {}

class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes> implements SupportTicketAttributes {
  public id_ticket!: number;
  public user_id!: ForeignKey<User['id']>;
  public description!: string;
  public attachment!: string | null;
  public tracking_number!: string;
  public status!: 'open' | 'in progress' | 'closed';
  public admin_response!: string | null;
  public admin_user_id!: number | null;
  public created_at!: Date;
  public responded_at!: Date | null;

  public readonly user?: User;

  public static associate(models: any) {
    SupportTicket.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
}

export const initSupportTicketModel = () => {
  SupportTicket.init(
    {
      id_ticket: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: 'id_ticket'
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'description',
        validate: {
          len: [10, 2000]
        }
      },
      attachment: {
        type: DataTypes.STRING(255),
        allowNull: true,
        field: 'attachment'
      },
      tracking_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'tracking_number'
      },
      status: {
        type: DataTypes.ENUM('open', 'in progress', 'closed'),
        defaultValue: 'open',
        allowNull: false,
        field: 'status'
      },
      admin_response: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'admin_response'
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'responded_at'
      }
    },
    {
      sequelize: sequelizeInstance, 
      tableName: 'support_tickets',
      modelName: 'SupportTicket',
      timestamps: false, 
      underscored: true
    }
  );

  return SupportTicket;
};

export default SupportTicket;