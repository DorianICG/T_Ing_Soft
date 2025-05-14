import { Model, DataTypes, Sequelize, CreationOptional, Optional, ForeignKey } from 'sequelize';
import User from './User'; // Asegúrate de tener este modelo

// Definición de atributos
export interface SupportTicketAttributes {
  id_ticket: CreationOptional<number>;
  user_id: ForeignKey<User['id']>;
  description: string;
  attachment?: string | null;
  tracking_number: string;
  status: 'open' | 'in progress' | 'closed';
  admin_response?: string | null;
  created_at: CreationOptional<Date>;
  responded_at?: Date | null;
}

// Campos opcionales al crear
export interface SupportTicketCreationAttributes extends Optional<SupportTicketAttributes, 'id_ticket' | 'attachment' | 'admin_response' | 'created_at' | 'responded_at' | 'status'> {}

class SupportTicket extends Model<SupportTicketAttributes, SupportTicketCreationAttributes> implements SupportTicketAttributes {
  public id_ticket!: number;
  public user_id!: ForeignKey<User['id']>;
  public description!: string;
  public attachment!: string | null;
  public tracking_number!: string;
  public status!: 'open' | 'in progress' | 'closed';
  public admin_response!: string | null;
  public created_at!: Date;
  public responded_at!: Date | null;

  // Relaciones
  public readonly user?: User;

  public static associate(models: {
    User: typeof User;
  }) {
    SupportTicket.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

export const initSupportTicketModel = (sequelize: Sequelize) => {
  SupportTicket.init(
    {
      id_ticket: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      attachment: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      tracking_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      status: {
        type: DataTypes.ENUM('open', 'in progress', 'closed'),
        defaultValue: 'open',
        allowNull: false
      },
      admin_response: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      responded_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      sequelize,
      tableName: 'support_tickets',
      modelName: 'SupportTicket',
      timestamps: false
    }
  );

  return SupportTicket;
};

export default SupportTicket;