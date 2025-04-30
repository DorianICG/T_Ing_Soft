import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { User, Role } from '../../models';
import config from '../../config/env';

class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      // Validar que se proporcionó un email y password
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'Email y contraseña son requeridos' });
        return;
      }
      
      // Validar formato de email con una expresión regular simple
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Formato de email inválido' });
        return;
      }
      
      // Buscar usuario en la base de datos
      console.log('1. Buscando usuario...');
      const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });
      console.log('2. Usuario encontrado:', user ? user.email : 'No encontrado');
      if (!user || !user.role) { 
        res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        return; 
      }
      const userRole = user.role; 
      if (!user.passwordHash) { 
        res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        return; 
      }
      console.log('3. Comparando contraseña...');
      
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      console.log('4. Contraseña coincide:', isMatch);
      if (!isMatch) {

        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        user.lastFailedLogin = new Date();
        if (user.failedLoginAttempts >= 5) {
          user.accountLocked = true;
          user.lastFailedLogin = new Date();
        }
        await user.save(); 
        console.log('Contraseña incorrecta, actualizando intentos.');
        res.status(401).json({ error: 'Usuario o contraseña incorrectos' }); // Devuelve error
        return;
      }

      await user.update({
        failedLoginAttempts: 0,
        lastLogin: new Date(),
        lastFailedLogin: null
      });


      console.log('JWT Secret:', config.JWT_SECRET);
      console.log('Tipo de JWT Secret:', typeof config.JWT_SECRET);
      console.log('JWT Expires In:', config.JWT_EXPIRES_IN);
      console.log('Tipo de JWT Expires In:', typeof config.JWT_EXPIRES_IN);
      console.log('Payload:', { id: user.id, role: userRole.name, email: user.email });

      const jwtSecret: Secret = config.JWT_SECRET as string; 
      const jwtOptions: SignOptions = {
        expiresIn: config.JWT_EXPIRES_IN
      };
      const jwtPayload = {
        id: user.id,
        role: userRole.name,
        email: user.email,
      };

      const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);

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