import express from 'express';
import cors from 'cors';
import config from './config/env';
import sequelize from './config/database';
import authRoutes from './auth/routes/auth.routes';
import adminRoutes from './admin/routes/admin.routes';
import withdrawalRoutes from './withdrawals/routes';
import userRoutes from './user/routes/user.routes';
import supportRoutes from './support/routes';

const app = express();

// Middlewares Esenciales
app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Montar Rutas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/support', supportRoutes);

// Ruta simple para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.send('Servidor Backend T_Ing_Soft Funcionando!');
});

// Iniciar el Servidor
const PORT = config.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
  }
});