import dotenv from 'dotenv';

dotenv.config(); 

interface AppConfig {
  NODE_ENV: string;
  PORT: number;
  DB_HOST?: string;
  DB_PORT?: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD?: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: number;
}

const config: AppConfig = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
  DB_NAME: process.env.DB_NAME || 'db_dev_default',
  DB_USER: process.env.DB_USER || 'user_dev_default',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || 'valor_por_defecto_inseguro_para_desarrollo',
  JWT_EXPIRES_IN: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '28800', 10), // 8 horas por defecto
};

if (!process.env.DB_NAME) {
    console.warn(`ADVERTENCIA: DB_NAME no definida en .env. Usando: ${config.DB_NAME}`);
}
if (!process.env.DB_USER) {
    console.warn(`ADVERTENCIA: DB_USER no definido en .env. Usando: ${config.DB_USER}`);
}
if (!process.env.DB_PASSWORD) {
    console.warn(`ADVERTENCIA: DB_PASSWORD no definido en .env. Usando string vacío.`);
}
if (!process.env.JWT_SECRET) {
  console.warn(
    'ADVERTENCIA: La variable de entorno JWT_SECRET no está definida. Usando clave por defecto insegura.'
  );
}


export default config;