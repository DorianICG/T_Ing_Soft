import express from 'express';
import cors from 'cors';
import config from './config/env';
import sequelize from './config/database';
import authRoutes from './auth/routes/auth.routes';

const app = express();

// Middlewares Esenciales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montar Rutas
// Define un prefijo base para tus rutas de API, ej: /api
app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes); // Monta otras rutas

// Ruta simple para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.send('Servidor Backend T_Ing_Soft Funcionando!');
});

// Iniciar el Servidor
const PORT = config.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  try {
    // Intenta autenticar la conexión a la DB al iniciar
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    // Opcional: Sincronizar modelos (crear tablas si no existen)
    // await sequelize.sync({ force: false }); // force: true borrará y recreará tablas
    // console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
});