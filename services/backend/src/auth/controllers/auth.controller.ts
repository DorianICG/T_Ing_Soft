import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Role } from '../../models';
import config from '../../config/env';
import { sendVerificationCode, sendPasswordResetEmail, sendUnlockEmail } from '../../utils/emailService';
import { generateResetToken } from '../../utils/tokenHashing';
import { verifyRecaptchaV3 } from '../../utils/captcha';

// Función para generar un código MFA de 6 dígitos
const generateMfaCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};


// Controlador de autenticación
class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { rut, password, captchaToken } = req.body;


    try {
      console.log('1. Buscando usuario...');
      const user = await User.findOne({ where: { rut }, include: [{ model: Role, as: 'role' }] });
      console.log('2. Usuario encontrado:', user ? user.rut : 'No encontrado');

      let needsCaptchaCheck = false;
      if (user && user.failedLoginAttempts >= 2 && !user.accountLocked) {
          needsCaptchaCheck = true;
          console.log(`Intento ${user.failedLoginAttempts + 1} para RUT ${rut}. Requiere verificación CAPTCHA v3.`);
      }
      if (needsCaptchaCheck) {
        const userIp = req.ip;
        const isCaptchaValid = await verifyRecaptchaV3(captchaToken, 'login', userIp);
        if (!isCaptchaValid) {
          console.log(`Verificación CAPTCHA v3 fallida para ${rut}.`);
          res.status(401).json({ error: 'Verificación de seguridad fallida. Inténtalo de nuevo.' });
          return;
        }
        console.log(`Verificación CAPTCHA v3 exitosa para ${rut}.`);
      }

      if (!user || !user.role || !user.passwordHash) {
        res.status(401).json({ error: 'RUT o contraseña incorrectos' });
        return;
      }
      console.log('3. Comparando contraseña...');
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      console.log('4. Contraseña coincide:', isMatch);

      if (!isMatch) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        user.lastFailedLogin = new Date();
        let responseStatus = 401;
        let responseJson: { error: string; accountLocked: boolean };

        if (user.failedLoginAttempts >= 5) {
          user.accountLocked = true;
          responseStatus = 403; 
          console.log(`Cuenta bloqueada para RUT ${rut}...`);

          await user.update({
            failedLoginAttempts: user.failedLoginAttempts,
            lastFailedLogin: user.lastFailedLogin,
            accountLocked: user.accountLocked
          });

          if (user.email === "NO TIENE") {
            console.log(`Usuario ${user.rut} bloqueado pero sin email registrado ("NO TIENE").`);
            responseJson = {
              error: 'Cuenta bloqueada por demasiados intentos fallidos. No tiene un correo electrónico registrado para desbloquearla. Por favor, contacte a un administrador.',
              accountLocked: true
            };
          } else {
            try {
              const { resetToken, hashedToken } = generateResetToken();
              const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
              await user.update({ resetPasswordTokenHash: hashedToken, resetPasswordExpiresAt: expiresAt });
              await sendUnlockEmail(user.email, resetToken);
              console.log(`Email de desbloqueo (válido 24h) enviado a ${user.email}`);
              responseJson = {
                error: 'Cuenta bloqueada por demasiados intentos fallidos. Se ha enviado un correo electrónico con instrucciones para desbloquearla (válido por 24 horas).',
                accountLocked: true
              };
            } catch (unlockError) {
              console.error("Error crítico al generar/enviar token de desbloqueo tras bloqueo:", unlockError);
              responseJson = {
                error: 'Cuenta bloqueada por demasiados intentos fallidos. Ocurrió un error al enviar el correo de desbloqueo. Contacte a soporte.',
                accountLocked: true 
              };
            }
          }
        } else {

          await user.update({
             failedLoginAttempts: user.failedLoginAttempts,
             lastFailedLogin: user.lastFailedLogin
          });
          console.log(`Contraseña incorrecta para RUT ${rut}, intento ${user.failedLoginAttempts}.`);
          responseJson = { error: 'RUT o contraseña incorrectos', accountLocked: false };
        }

        res.status(responseStatus).json(responseJson);
        return; 
      }

      if (user.accountLocked) {
        const errorMsg = user.email === "NO TIENE"
          ? 'Cuenta bloqueada. Contacte a un administrador.'
          : 'Cuenta bloqueada. Revisa tu correo...';
        console.log(`Intento de login para cuenta ya bloqueada: RUT ${rut}, Email: ${user.email}`);
        res.status(403).json({ error: errorMsg, accountLocked: true });
        return; 
      }

      if (user.email === "NO TIENE") {
        console.log(`Usuario ${user.rut} no tiene email registrado ("NO TIENE"). Saltando MFA y completando login.`);
        await user.update({ failedLoginAttempts: 0, lastFailedLogin: null, lastLogin: new Date() });

        const userRole = user.role;
        const jwtPayload = { id: user.id, role: userRole.name, email: user.email, rut: user.rut };
        const jwtSecret: Secret = config.JWT_SECRET as string;
        const jwtOptions: SignOptions = { expiresIn: config.JWT_EXPIRES_IN };
        const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);

        res.json({
          message: 'Autenticación exitosa.',
          token,
          user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: userRole.name, rut: user.rut },
        });
        return; 
      }

      console.log('Contraseña correcta. Iniciando flujo MFA...');
      const mfaCode = generateMfaCode();
      const saltRounds = 10;
      const mfaCodeHash = await bcrypt.hash(mfaCode, saltRounds);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.update({ mfaCodeHash: mfaCodeHash, mfaCodeExpiresAt: expiresAt, failedLoginAttempts: 0, lastFailedLogin: null });
      try {
        await sendVerificationCode(user.email, mfaCode);
        console.log(`Código MFA enviado a ${user.email}`);
        res.status(200).json({
            message: 'Autenticación parcial exitosa. Se requiere verificación MFA.',
            mfaRequired: true,
            email: user.email
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

  async verifyMfa(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body;

    try {
      console.log(`Verificando MFA para ${email} con código ${code}`);
      const user = await User.findOne({ where: { email }, include: [{ model: Role, as: 'role' }] });
       if (!user || !user.role) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }
      if (!user.mfaCodeHash || !user.mfaCodeExpiresAt || user.mfaCodeExpiresAt < new Date()) {
        console.log('Código MFA no encontrado, inválido o expirado.');
        if (user.mfaCodeExpiresAt && user.mfaCodeExpiresAt < new Date()) {
            await user.update({ mfaCodeHash: null, mfaCodeExpiresAt: null });
        }
        res.status(400).json({ error: 'Código inválido o expirado. Intenta iniciar sesión de nuevo.' });
        return;
      }
      const isCodeMatch = await bcrypt.compare(code, user.mfaCodeHash);
      if (!isCodeMatch) {
        console.log('Código MFA no coincide.');
        res.status(400).json({ error: 'Código de verificación incorrecto.' });
        return;
      }
      console.log('Código MFA correcto. Completando login.');
      await user.update({ mfaCodeHash: null, mfaCodeExpiresAt: null, lastLogin: new Date() });
      const userRole = user.role;
      const jwtPayload = {
          id: user.id,
          role: userRole.name,
          email: user.email,
          rut: user.rut
      };
      const jwtSecret: Secret = config.JWT_SECRET as string;
      const jwtOptions: SignOptions = { expiresIn: config.JWT_EXPIRES_IN };
      console.log('Generando token de sesión final...');
      const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
      console.log('Token generado.');
      res.json({
        message: 'Verificación MFA exitosa. Login completo.',
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: userRole.name,
            rut: user.rut
        },
      });

    } catch (error) {
      console.error('Error en verificación MFA:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      console.log(`Solicitud de reseteo de contraseña para: ${email}`);
      const user = await User.findOne({ where: { email } });
      if (user && user.email !== "NO TIENE") {
        console.log('Usuario encontrado con email funcional. Generando token de reseteo...');
        const { resetToken, hashedToken } = generateResetToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.update({ resetPasswordTokenHash: hashedToken, resetPasswordExpiresAt: expiresAt });
        try {
          await sendPasswordResetEmail(user.email, resetToken);
          console.log(`Email de reseteo (válido 24h) enviado a ${user.email}`);
        } catch (emailError) {
          console.error("Error al enviar email de reseteo:", emailError);
        }
      } else if (user && user.email === "NO TIENE") {
          console.log(`Usuario ${user.rut} encontrado pero no tiene email funcional ("NO TIENE"). No se envía correo de reseteo.`);
          res.status(400).json({ error: 'El usuario no tiene un email registrado. Contacte con un administrador.' });
      } else {
          console.log(`Usuario con email ${email} no encontrado.`);
          res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.status(200).json({ message: 'Si existe una cuenta asociada a ese email, se ha enviado un enlace para restablecer la contraseña.' });

    } catch (error) {
      console.error('Error en forgotPassword:', error);
      res.status(200).json({ message: 'Si existe una cuenta asociada a ese email, se ha enviado un enlace para restablecer la contraseña.' });
    }
  }

  async requestUnlock(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      console.log(`Solicitud de desbloqueo de cuenta para: ${email}`);
      const user = await User.findOne({ where: { email } });
       if (user && user.email !== "NO TIENE") {
        if (!user.accountLocked) { console.log(`La cuenta ${email} no está bloqueada...`); }
        else { console.log(`La cuenta ${email} está bloqueada. Generando token...`); }

        const { resetToken, hashedToken } = generateResetToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.update({ resetPasswordTokenHash: hashedToken, resetPasswordExpiresAt: expiresAt });
        try {
          await sendUnlockEmail(user.email, resetToken);
          console.log(`Email de desbloqueo/reseteo (válido 24h) enviado a ${user.email}`);
        } catch (emailError) {
          console.error("Error al enviar email de desbloqueo:", emailError);
        }
      } else if (user && user.email === "NO TIENE") {
          console.log(`Usuario ${user.rut} encontrado pero no tiene email funcional ("NO TIENE"). No se envía correo de desbloqueo.`);
          res.status(400).json({ error: 'El usuario no tiene un email registrado. Contacte con un administrador.' });
      } else {
          console.log(`Usuario con email ${email} no encontrado.`);
      }
      res.status(200).json({ message: 'Si existe una cuenta bloqueada asociada a ese email, se ha enviado un enlace para desbloquearla y restablecer la contraseña.' });

    } catch (error) {
      console.error('Error en requestUnlock:', error);
      res.status(200).json({ message: 'Si existe una cuenta bloqueada asociada a ese email, se ha enviado un enlace para desbloquearla y restablecer la contraseña.' });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, newPassword } = req.body;

    try {
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      console.log(`Intento de reseteo/desbloqueo con token (hash buscado): ${hashedToken}`);
      const user = await User.findOne({ where: { resetPasswordTokenHash: hashedToken } });

      if (!user || !user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
        console.log('Token inválido o expirado.');
        res.status(400).json({ error: 'El token para restablecer la contraseña es inválido o ha expirado.' });
        return;
      }
      console.log(`Usuario encontrado para reseteo/desbloqueo: ${user.email}`);
      const saltRounds = 10;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
      const wasLocked = user.accountLocked;
      await user.update({
        passwordHash: newPasswordHash,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
        accountLocked: false,
        failedLoginAttempts: 0,
        mfaCodeHash: null,
        mfaCodeExpiresAt: null,
      });
      console.log(`Contraseña reseteada ${wasLocked ? 'y cuenta desbloqueada ' : ''}exitosamente para ${user.email}`);
      const successMessage = wasLocked
        ? 'Tu contraseña ha sido restablecida y tu cuenta desbloqueada exitosamente.'
        : 'Tu contraseña ha sido restablecida exitosamente.';

      res.status(200).json({ message: successMessage });

    } catch (error) {
      console.error('Error en resetPassword:', error);
      res.status(500).json({ error: 'Error interno del servidor al restablecer la contraseña.' });
    }
  }
}

export default new AuthController();