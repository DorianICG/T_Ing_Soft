import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
 class Role extends Model {
  public id!: number;
  public name!: string;
  public description?: string | null; 

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date; 

  public static associate(models: any) {

    Role.hasMany(models.User, { 
      foreignKey: 'roleId',
      as: 'users'
    });
  }
}

Role.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: new DataTypes.STRING(20),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'roles',
  sequelize,
  timestamps: true,
  underscored: true 
});


export default Role;