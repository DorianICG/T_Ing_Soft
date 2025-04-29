import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database';
import User from './User';

class Role extends Model {
  public id!: number;
  public name!: string;
  public description!: string | null;

  // timestamps
  public readonly createdAt!: Date;
}

Role.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'name', // Explicit mapping (optional if name matches)
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true, // Assuming description can be null
    field: 'description', // Explicit mapping (optional if name matches)
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false, // Assuming it's NOT NULL based on DEFAULT CURRENT_TIMESTAMP
    defaultValue: DataTypes.NOW, // Let Sequelize handle default
    field: 'created_at',
  }
}, {
  sequelize,
  modelName: 'Role',
  tableName: 'roles',
  timestamps: true, // Enable timestamps
  createdAt: 'created_at', // Map createdAt field
  updatedAt: false, // Disable updatedAt if you don't have an updated_at column
});

Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

export default Role;