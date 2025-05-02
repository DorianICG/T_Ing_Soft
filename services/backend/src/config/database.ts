import { Sequelize } from 'sequelize';
import config from './env'; 

// Create a new Sequelize instance
const sequelize = new Sequelize(
  config.DB_NAME,     
  config.DB_USER,     
  config.DB_PASSWORD, 
  {
    host: config.DB_HOST,     
    dialect: 'postgres',      
    port: config.DB_PORT,
    logging: console.log
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

export default sequelize;