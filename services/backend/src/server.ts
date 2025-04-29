import express from 'express';
import dotenv from 'dotenv';
// Corrected path to the auth routes entry point
import authRoutes from './auth/routes';
// Import other routes...
// import userRoutes from './user/routes'; // Example

dotenv.config(); // Load .env variables

const app = express();
const PORT = process.env.PORT || 3001; // Example port

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Mount Routes ---
app.use('/api/auth', authRoutes); // Use the imported auth router
// app.use('/api/users', userRoutes); // Example for other routes

// --- Global Error Handler (Example) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// --- Database Connection (Example using Sequelize) ---
import sequelize from './models'; // Assuming models/index.ts exports sequelize instance
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Optional: Sync models (useful in development, use migrations in production)
// sequelize.sync({ alter: true }); // Be careful with alter: true