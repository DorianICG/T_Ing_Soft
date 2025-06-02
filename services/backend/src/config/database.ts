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
    timezone: 'America/Santiago',
    logging: console.log
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

testConnection();

export default sequelize;