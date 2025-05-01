import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Role } from '../../models'; 
import config from '../../config/env';
import { sendVerificationCode, sendPasswordResetEmail } from '../../utils/emailService';
import { generateResetToken } from '../../utils/tokenHashing';
import { verifyRecaptchaV3 } from '../../utils/captcha';

// Función auxiliar para generar código MFA
const generateMfaCode = (): string => {
  return crypto.randomInt(100000, 999999).toString(); // Código de 6 dígitos
};

// Expresión regular simple para validar email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class AuthController {
  // --- Método para Iniciar Sesión ---
  async login(req: Request, res: Response): Promise<void> {
    const { email, password, captchaToken} = req.body;

    // 1. Validación básica de entrada
    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña son requeridos' });
      return;
    }
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Formato de email inválido' });
      return;
    }

    try {
      // 2. Buscar usuario
      console.log('1. Buscando usuario...');
      const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });
      console.log('2. Usuario encontrado:', user ? user.email : 'No encontrado');

      // 2.1 Verificar CAPTCHA (si está habilitado)
      let needsCaptchaCheck = false;
      if (user && user.failedLoginAttempts >= 2 && !user.accountLocked) {
          // Requiere verificación CAPTCHA en el 3er, 4to y 5to intento
          needsCaptchaCheck = true;
          console.log(`Intento ${user.failedLoginAttempts + 1} para ${email}. Requiere verificación CAPTCHA v3.`);
      }

      // 2. Verificar CAPTCHA v3 si es necesario
      if (needsCaptchaCheck) {
        const userIp = req.ip;
        // Verifica el token, opcionalmente la acción 'login'
        const isCaptchaValid = await verifyRecaptchaV3(captchaToken, 'login', userIp);

        if (!isCaptchaValid) {
          console.log(`Verificación CAPTCHA v3 fallida (token inválido o puntuación baja) para ${email}.`);
          
          res.status(401).json({
            error: 'Verificación de seguridad fallida. Inténtalo de nuevo.',
          });
          return; 
        }
        console.log(`Verificación CAPTCHA v3 exitosa para ${email}.`);
      }

      // Si no existe usuario, rol o hash de contraseña, devolver error genérico
      if (!user || !user.role || !user.passwordHash) {
        res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
        return;
      }

      // 3. Comparar contraseña
      console.log('3. Comparando contraseña...');
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      console.log('4. Contraseña coincide:', isMatch);

      if (!isMatch) {
        // Manejo de intentos fallidos
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        user.lastFailedLogin = new Date();
        let accountJustLocked = false;
        if (user.failedLoginAttempts >= 5) {
          user.accountLocked = true;
          accountJustLocked = true;
        }
        await user.save();
        console.log(`Contraseña incorrecta para ${email}, intento ${user.failedLoginAttempts}.`);

        const errorMsg = accountJustLocked
            ? 'Cuenta bloqueada por demasiados intentos fallidos.'
            : 'Usuario o contraseña incorrectos';
        res.status(401).json({
            error: errorMsg,
            accountLocked: user.accountLocked
        });
        return;
      }

      // 4. Verificar si la cuenta está bloqueada
      if (user.accountLocked) {
        res.status(403).json({ error: 'Cuenta bloqueada. Contacta al administrador.' });
        return;
      }

      // 5. Iniciar SIEMPRE el flujo MFA
      console.log('Contraseña correcta. Iniciando flujo MFA...');

      const mfaCode = generateMfaCode();
      const saltRounds = 10;
      const mfaCodeHash = await bcrypt.hash(mfaCode, saltRounds);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expira en 10 minutos

      await user.update({
        mfaCodeHash: mfaCodeHash,
        mfaCodeExpiresAt: expiresAt,
        failedLoginAttempts: 0,
        lastFailedLogin: null
      });

      // 6. Enviar código por email
      try {
        await sendVerificationCode(user.email, mfaCode);
        console.log(`Código MFA enviado a ${user.email}`);
        // Enviar respuesta indicando que se necesita MFA (SIN TOKEN)
        res.status(200).json({
          message: 'Autenticación parcial exitosa. Se requiere verificación MFA.',
          mfaRequired: true,
        });
      } catch (emailError) {
        console.error("Error al enviar email MFA:", emailError);
        res.status(500).json({ error: 'Error al enviar el código de verificación por email.' });
      }

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // --- Método para Verificar Código MFA ---
  async verifyMfa(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body;

    // 1. Validación básica de entrada
    if (!email || !code) {
      res.status(400).json({ error: 'Email y código son requeridos' });
      return;
    }
    // 1.1 Validación de formato de email
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Formato de email inválido' });
      return;
    }

    // 1.2 Validación de formato de código (6 dígitos numéricos)
    const codeRegex = /^\d{6}$/;
    if (typeof code !== 'string' || !codeRegex.test(code)) {
      res.status(400).json({ error: 'El código debe ser de 6 dígitos numéricos' });
      return;
    }

    try {
      console.log(`Verificando MFA para ${email} con código ${code}`);
      const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });

      if (!user || !user.role) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      // 3. Verificar si hay un código MFA pendiente y si no ha expirado
      if (!user.mfaCodeHash || !user.mfaCodeExpiresAt || user.mfaCodeExpiresAt < new Date()) {
        console.log('Código MFA no encontrado, inválido o expirado.');
        if (user.mfaCodeExpiresAt && user.mfaCodeExpiresAt < new Date()) {
            await user.update({ mfaCodeHash: null, mfaCodeExpiresAt: null });
        }
        res.status(400).json({ error: 'Código inválido o expirado. Intenta iniciar sesión de nuevo.' });
        return;
      }

      // 4. Comparar el código proporcionado con el hash almacenado
      const isCodeMatch = await bcrypt.compare(code, user.mfaCodeHash);

      if (!isCodeMatch) {
        console.log('Código MFA no coincide.');
        res.status(400).json({ error: 'Código de verificación incorrecto.' });
        return;
      }

      // --- Código MFA Correcto ---
      console.log('Código MFA correcto. Completando login.');

      // 5. Limpiar campos MFA y ACTUALIZAR lastLogin
      await user.update({
        mfaCodeHash: null,
        mfaCodeExpiresAt: null,
        lastLogin: new Date(), 
      });

      // 6. Generar el Token JWT de Sesión final
      const userRole = user.role;
      const jwtPayload = {
        id: user.id,
        role: userRole.name,
        email: user.email,
      };
      const jwtSecret: Secret = config.JWT_SECRET as string;
      const jwtOptions: SignOptions = {
        expiresIn: config.JWT_EXPIRES_IN
      };

      console.log('Generando token de sesión final...');
      const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
      console.log('Token generado.');

      // 7. Enviar respuesta con token y datos del usuario
      res.json({
        message: 'Verificación MFA exitosa. Login completo.',
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
      console.error('Error en verificación MFA:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  // --- Método para restablecer contraseña olvidada ---
  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    if (!email || !emailRegex.test(email)) {
      res.status(400).json({ error: 'Por favor, proporciona un email válido.' });
      return;
    }

    try {
      console.log(`Solicitud de reseteo de contraseña para: ${email}`);
      const user = await User.findOne({ where: { email } });

      if (user) {
        console.log('Usuario encontrado. Generando token de reseteo...');
        const { resetToken, hashedToken } = generateResetToken();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expira en 10 minutos

        await user.update({
          resetPasswordTokenHash: hashedToken,
          resetPasswordExpiresAt: expiresAt,
        });

        // Enviar email con el token ORIGINAL (no hasheado)
        try {
          await sendPasswordResetEmail(user.email, resetToken);
          console.log(`Email de reseteo enviado a ${user.email}`);
        } catch (emailError) {
          console.error("Error al enviar email de reseteo:", emailError);
        }
      } else {
        console.log('Usuario no encontrado, pero se enviará respuesta genérica.');
      }

      res.status(200).json({ message: 'Si existe una cuenta asociada a ese email, se ha enviado un enlace para restablecer la contraseña.' });

    } catch (error) {
      console.error('Error en forgotPassword:', error);
      res.status(200).json({ message: 'Si existe una cuenta asociada a ese email, se ha enviado un enlace para restablecer la contraseña.' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    // El token viene del frontend (que lo extrajo de la URL)
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token y nueva contraseña son requeridos.' });
      return; 
    }

    // Validación de fortaleza de contraseña
    if (newPassword.length < 8 || newPassword.length > 16) {
      res.status(400).json({ error: 'La contraseña debe tener entre 8 y 16 caracteres.' });
      return; 
    }

    // Verificar complejidad: al menos una letra minúscula, una mayúscula, un número y un carácter especial
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      res.status(400).json({
      error: 'La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial.'
      });
      return;
    }

    try {
      // Hashea el token recibido para buscarlo en la BD
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      console.log(`Intento de reseteo de contraseña con token (hash buscado): ${hashedToken}`);

      // Buscar usuario por el token hasheado y que no haya expirado
      const user = await User.findOne({
        where: {
          resetPasswordTokenHash: hashedToken,
        },
      });

      if (!user || !user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
        console.log('Token inválido o expirado.');
        res.status(400).json({ error: 'El token para restablecer la contraseña es inválido o ha expirado.' });
        return;
      }

      console.log(`Usuario encontrado para reseteo: ${user.email}`);

      // Hashear la nueva contraseña
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar la contraseña del usuario y limpiar los campos de reseteo
      await user.update({
        passwordHash: newPasswordHash,
        resetPasswordTokenHash: null, 
        resetPasswordExpiresAt: null, 
        mfaCodeHash: null,
        mfaCodeExpiresAt: null,
      });

      console.log(`Contraseña reseteada exitosamente para ${user.email}`);


      res.status(200).json({ message: 'Tu contraseña ha sido restablecida exitosamente.' });

    } catch (error) {
      console.error('Error en resetPassword:', error);
      res.status(500).json({ error: 'Error interno del servidor al restablecer la contraseña.' });
    }
  }
  
}

export default new AuthController();