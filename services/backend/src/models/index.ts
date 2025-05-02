import { Sequelize } from 'sequelize';
import sequelize from '../config/database'; 
import User from './User';
import Role from './Role';

const db = {
  sequelize,
  Sequelize,
  User,
  Role
};

Object.values(db).forEach((model: any) => {
  if (model && typeof model.associate === 'function') {
    model.associate(db); 
  }
});

export default db;
export { User, Role };