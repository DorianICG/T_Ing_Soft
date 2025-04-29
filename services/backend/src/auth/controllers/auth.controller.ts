import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import Role from '../../models/Role';
import config from '../../../config/env'; 

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      // Buscar usuario including the Role
      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: 'role' }], 
      });

      // Check if user exists
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Check if the role was successfully included/assigned
      if (!user.role) {
          console.error('User role not loaded or user has no role assigned for user ID:', user.id);
          // Consider if 401/403 is more appropriate if a user MUST have a role
          return res.status(500).json({ error: 'Error interno al cargar datos de usuario o rol no asignado.' });
      }
      // Assign the validated role to a new constant for type safety
      const userRole = user.role;

      // Check if account is locked
      if (user.accountLocked) {
        const lockTime = user.lastFailedLogin?.getTime() || 0;
        const now = new Date().getTime();
        const lockDuration = 30 * 60 * 1000; // 30 minutes

        if (now - lockTime < lockDuration) {
          return res.status(403).json({
            error: 'Cuenta bloqueada temporalmente. Intente más tarde.'
          });
        } else {
          // Unlock account if lock duration has passed
          await user.update({
            accountLocked: false,
            failedLoginAttempts: 0 // Reset attempts on unlock
          });
        }
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        // Handle failed login attempt
        const attempts = (user.failedLoginAttempts || 0) + 1;
        const maxAttempts = 5; 

        await user.update({
          failedLoginAttempts: attempts,
          lastFailedLogin: new Date(),
          accountLocked: attempts >= maxAttempts,
        });

        return res.status(401).json({
          error: 'Credenciales inválidas',
          attemptsLeft: maxAttempts - attempts,
          accountLocked: attempts >= maxAttempts,
        });
      }

      // --- Login Successful ---

      // Reset failed attempts and update last login time
      await user.update({
        failedLoginAttempts: 0,
        lastLogin: new Date(),
        lastFailedLogin: null 
      });

      // Generate JWT - Use the userRole constant
      const token = jwt.sign(
        {
          id: user.id,
          role: userRole.name, 
          email: user.email,

        },
        config.JWT_SECRET as string, 
        { expiresIn: config.JWT_EXPIRES_IN } 
      );

      // Send response - Use the userRole constant
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: userRole.name, 
        },
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

}

export default new AuthController();