import e, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { User, Role as RoleModel } from '../../models';
import UserOrganizationRoleModel, { UserOrganizationRoleAttributes } from '../../models/UserOrganizationRole';
import type { RoleAttributes } from '../../models/Role';
import config from '../../config/env';
import { sendVerificationCode, sendPasswordResetEmail, sendUnlockEmail } from '../../utils/emailService';
import { generateResetToken } from '../../utils/tokenHashing';
import { verifyRecaptchaV3 } from '../../utils/captcha';
import { Op } from 'sequelize';

// Función para generar un código MFA de 6 dígitos
const generateMfaCode = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

const getHighestPriorityRole = (
  userOrgRoles: (UserOrganizationRoleAttributes & { role?: RoleAttributes })[] | undefined | null // Espera objetos planos
): string | null => {
  if (!userOrgRoles || userOrgRoles.length === 0) {
    return null;
  }
  const roleHierarchy = ['ADMIN', 'INSPECTOR', 'PARENT'];
  let highestRoleName: string | null = null;
  let highestPriorityIndex = roleHierarchy.length; 


  for (const entry of userOrgRoles) {
    if (entry.role && entry.role.name) {
      const roleNameUpper = entry.role.name.toUpperCase();
      const priorityIndex = roleHierarchy.indexOf(roleNameUpper);
      if (priorityIndex !== -1 && priorityIndex < highestPriorityIndex) {
        highestPriorityIndex = priorityIndex;
        highestRoleName = entry.role.name; 
      }
    }else { 
    }
  }
  return highestRoleName;
};

interface IpAttemptInfo {
  count: number;
  firstAttemptTime: number;
}

const ipLoginAttempts = new Map<string, IpAttemptInfo>();
const MAX_IP_ATTEMPTS_BEFORE_CAPTCHA = 2; 
const IP_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; 

function recordFailedIpAttempt(ip: string): void {
  const now = Date.now();
  let attemptInfo = ipLoginAttempts.get(ip);

  if (attemptInfo && (now - attemptInfo.firstAttemptTime) < IP_ATTEMPT_WINDOW_MS) {
    attemptInfo.count++;
  } else {
    attemptInfo = { count: 1, firstAttemptTime: now };
  }
  ipLoginAttempts.set(ip, attemptInfo);
}

function getIpFailedAttempts(ip: string): number {
  const now = Date.now();
  const attemptInfo = ipLoginAttempts.get(ip);

  if (attemptInfo && (now - attemptInfo.firstAttemptTime) < IP_ATTEMPT_WINDOW_MS) {
    return attemptInfo.count;
  }
  return 0; 
}

function resetIpFailedAttempts(ip: string): void {
  ipLoginAttempts.delete(ip);
}

// Controlador de autenticación
class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { rut, password, captchaToken } = req.body;
    const clientIp = req.ip;

    try {
      let ipNeedsCaptchaCheck = false;

      if (clientIp) {
        const currentIpFailedAttempts = getIpFailedAttempts(clientIp);
        if (currentIpFailedAttempts >= MAX_IP_ATTEMPTS_BEFORE_CAPTCHA) {
          ipNeedsCaptchaCheck = true;
          console.log(`IP ${clientIp} has ${currentIpFailedAttempts} failed attempts. Requiring CAPTCHA.`);
        }

        if (ipNeedsCaptchaCheck) {
          if (!captchaToken) {
            console.log(`IP ${clientIp} requires CAPTCHA, but no token provided.`);
            res.status(401).json({ error: 'Verificación de seguridad requerida. Por favor, completa el CAPTCHA.' });
            return;
          }
          const isCaptchaValid = await verifyRecaptchaV3(captchaToken, 'login_ip_triggered', clientIp);
          if (!isCaptchaValid) {
            console.log(`IP ${clientIp} CAPTCHA v3 verification failed.`);
            recordFailedIpAttempt(clientIp);
            res.status(401).json({ error: 'Verificación de seguridad fallida. Inténtalo de nuevo.' });
            return;
          }
          console.log(`IP ${clientIp} CAPTCHA v3 verification successful.`);
        }
      } else {
        console.warn('Client IP is undefined. Skipping IP-based CAPTCHA checks.');
      }

      const user = await User.findOne({
        where: { rut },
        include: [{
          model: UserOrganizationRoleModel, 
          as: 'organizationRoleEntries', 
          required: false,               
          include: [{
            model: RoleModel,          
            as: 'role', 
            attributes: ['id', 'name']
          }]
        }]
      });

      let userBasedCaptchaRequired = false; 
      if (user && user.failedLoginAttempts >= 2 && !user.accountLocked) {
          if (!ipNeedsCaptchaCheck) { 
            userBasedCaptchaRequired = true;
          }
      }

      if (userBasedCaptchaRequired) {
        if (!captchaToken) {
          res.status(401).json({ error: 'Verificación de seguridad requerida. Por favor, completa el CAPTCHA.' });
          return;
        }
        if (clientIp) { 
          const isCaptchaValid = await verifyRecaptchaV3(captchaToken, 'login_user_triggered', clientIp); 
          if (!isCaptchaValid) {
            recordFailedIpAttempt(clientIp); 
            res.status(401).json({ error: 'Verificación de seguridad fallida. Inténtalo de nuevo.' });
            return;
          }
        } else {
          console.warn(`User-based CAPTCHA for ${rut}: Client IP is undefined. Cannot reliably verify reCAPTCHA v3.`);
          res.status(401).json({ error: 'No se pudo determinar la IP para la verificación de seguridad. Inténtalo de nuevo.' });
          return;
        }
      }
      const plainOrganizationRoleEntriesForLogin = user?.organizationRoleEntries?.map(entry => {
        const plainEntry = entry.get({ plain: true }) as UserOrganizationRoleAttributes;
        const plainRole = entry.role?.get({ plain: true }) as RoleAttributes | undefined;
        return { ...plainEntry, role: plainRole };
      });
      

      const highestRoleName = user ? getHighestPriorityRole(plainOrganizationRoleEntriesForLogin) : null;
      if (!user || !highestRoleName || !user.passwordHash) {
        if (clientIp) {
          recordFailedIpAttempt(clientIp);
        }
        res.status(401).json({ error: 'RUT o contraseña incorrectos, o usuario sin rol asignado válido.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);

      if (!isMatch) {
        if (clientIp) {
          recordFailedIpAttempt(clientIp);
        }
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        user.lastFailedLogin = new Date();
        let responseStatus = 401;
        let responseJson: { error: string; accountLocked: boolean };

        if (user.failedLoginAttempts >= 5) {
          user.accountLocked = true;
          responseStatus = 403; 

          await user.update({
            failedLoginAttempts: user.failedLoginAttempts,
            lastFailedLogin: user.lastFailedLogin,
            accountLocked: user.accountLocked
          });

          if (user.email === "NO TIENE") {
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
          responseJson = { error: 'RUT o contraseña incorrectos', accountLocked: false };
        }

        res.status(responseStatus).json(responseJson);
        return; 
      }

      if (user.accountLocked) {
        const errorMsg = user.email === "NO TIENE"
          ? 'Cuenta bloqueada. Contacte a un administrador.'
          : 'Cuenta bloqueada. Revisa tu correo...';
        res.status(403).json({ error: errorMsg, accountLocked: true });
        return; 
      }

      if (user.lastLogin === null) {
        const tempChangeTokenPayload = { id: user.id, action: 'force-change-password' };
        const tempChangeToken = jwt.sign(tempChangeTokenPayload, config.JWT_SECRET as string, { expiresIn: '15m' });

        res.status(200).json({
          message: 'Primer inicio de sesión. Se requiere cambio de contraseña.',
          forceChangePassword: true,
          email: user.email, 
          tempToken: tempChangeToken
        });
        return;
      }

      if (user.email === "NO TIENE") {
        await user.update({ failedLoginAttempts: 0, lastFailedLogin: null, lastLogin: new Date() });
        if (clientIp) {
          resetIpFailedAttempts(clientIp);
        }
        const jwtPayload = { id: user.id, role: highestRoleName, email: user.email, rut: user.rut };
        const jwtSecret: Secret = config.JWT_SECRET as string;
        const jwtOptions: SignOptions = { expiresIn: config.JWT_EXPIRES_IN };
        const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
        res.json({
          message: 'Autenticación exitosa.',
          token,
          user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: highestRoleName, rut: user.rut },
        });
        return;
      }

      const mfaCode = generateMfaCode();
      const saltRounds = 10;
      const mfaCodeHash = await bcrypt.hash(mfaCode, saltRounds);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.update({ mfaCodeHash: mfaCodeHash, mfaCodeExpiresAt: expiresAt, failedLoginAttempts: 0, lastFailedLogin: null });
      try {
        await sendVerificationCode(user.email, mfaCode);
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
      if (clientIp) {
        recordFailedIpAttempt(clientIp);
      }
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async verifyMfa(req: Request, res: Response): Promise<void> {
    const { email, code } = req.body;
    try {
      const user = await User.findOne({
        where: { 
          email,
          mfaCodeHash: { [Op.ne]: null },
          mfaCodeExpiresAt: { [Op.gt]: new Date() }
        },
        include: [{ 
          model: UserOrganizationRoleModel,
          as: 'organizationRoleEntries',
          required: false,
          include: [{ model: RoleModel, as: 'role', attributes: ['id', 'name'] }]
        }],
        order: [['mfaCodeExpiresAt', 'DESC']]
      });

      const highestRoleName = user ? getHighestPriorityRole(user.organizationRoleEntries as any) : null;

      if (!user || !highestRoleName) {
        res.status(404).json({ error: 'Usuario no encontrado o sin rol válido.' });
        return;
      }
      if (!user.mfaCodeHash || !user.mfaCodeExpiresAt || user.mfaCodeExpiresAt < new Date()) {
        if (user.mfaCodeExpiresAt && user.mfaCodeExpiresAt < new Date()) {
            await user.update({ mfaCodeHash: null, mfaCodeExpiresAt: null });
        }
        res.status(400).json({ error: 'Código inválido o expirado. Intenta iniciar sesión de nuevo.' });
        return;
      }
      const isCodeMatch = await bcrypt.compare(code, user.mfaCodeHash);
      if (!isCodeMatch) {
        res.status(400).json({ error: 'Código de verificación incorrecto.' });
        return;
      }
      await user.update({ mfaCodeHash: null, mfaCodeExpiresAt: null, lastLogin: new Date() });
      const clientIpForMfa = req.ip; 
      if (clientIpForMfa) {
        resetIpFailedAttempts(clientIpForMfa);
      }      const jwtPayload = {
          id: user.id,
          role: highestRoleName,
          email: user.email,
          rut: user.rut
      };
      const jwtSecret: Secret = config.JWT_SECRET as string;
      const jwtOptions: SignOptions = { expiresIn: config.JWT_EXPIRES_IN };
      const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
      res.json({
        message: 'Verificación MFA exitosa. Login completo.',
        token,
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: highestRoleName,
            rut: user.rut
        },
      });

    } catch (error) {
      console.error('Error en verificación MFA:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }

  async forceChangePassword(req: Request, res: Response): Promise<void> {
    const { newPassword, confirmPassword } = req.body;
    const userPayload = (req as any).user as { id: number; action?: string };
    const userId = userPayload?.id;

    if (!userId) {
        res.status(401).json({ error: 'Token inválido o ausente para cambio de contraseña.' });
        return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ error: 'Las contraseñas no coinciden.' });
      return;
    }

    try {
      let user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
        return;
      }

      const rutWithoutDV = user.rut.split('-')[0];
      if (newPassword === rutWithoutDV) {
          res.status(400).json({ error: 'La nueva contraseña no puede ser igual a la contraseña por defecto (su RUT sin dígito verificador).' });
          return;
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      await user.update({
        passwordHash,
        lastLogin: new Date(),
        failedLoginAttempts: 0,
        lastFailedLogin: null,
        resetPasswordTokenHash: null, 
        resetPasswordExpiresAt: null
      });

      const updatedUser = await User.findByPk(userId, {
        include: [{
          model: UserOrganizationRoleModel,
          as: 'organizationRoleEntries',
          required: false,
          include: [{ model: RoleModel, as: 'role', attributes: ['id', 'name'] }]
        }]
      });

      const plainEntriesForController = updatedUser?.organizationRoleEntries?.map(entry => {
        const plainEntry = entry.get({ plain: true }) as UserOrganizationRoleAttributes;
        const plainRole = entry.role?.get({ plain: true }) as RoleAttributes | undefined;
        return { ...plainEntry, role: plainRole };
      });

      const highestRoleName = updatedUser ? getHighestPriorityRole(plainEntriesForController) : null;      
      if (!updatedUser || !highestRoleName) {
        console.error(`Error crítico: Usuario ID ${userId} no encontrado después de actualizar contraseña.`);
        res.status(500).json({ error: 'Error al procesar la solicitud después del cambio de contraseña.' });
        return;
      }

      if (updatedUser.email && updatedUser.email !== "NO TIENE") {
        const mfaCode = generateMfaCode();
        const mfaSaltRounds = 10;
        const mfaCodeHash = await bcrypt.hash(mfaCode, mfaSaltRounds);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos de validez

        await updatedUser.update({
          mfaCodeHash: mfaCodeHash,
          mfaCodeExpiresAt: expiresAt
        });

        try {
          await sendVerificationCode(updatedUser.email, mfaCode);
          res.status(200).json({
            message: 'Contraseña actualizada. Se requiere verificación MFA.',
            mfaRequired: true,
            email: updatedUser.email
          });
        } catch (emailError) {
          console.error("Error al enviar email MFA post-cambio de contraseña:", emailError);
          res.status(500).json({ error: 'Contraseña actualizada, pero ocurrió un error al enviar el código de verificación. Intente iniciar sesión.' });
        }
      } else {
        const jwtPayload = {
            id: updatedUser.id,
            role: highestRoleName,
            email: updatedUser.email,
            rut: updatedUser.rut
        };
        const jwtSecret: Secret = config.JWT_SECRET as string;
        const jwtOptions: SignOptions = { expiresIn: config.JWT_EXPIRES_IN };
        const token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);

        res.json({
          message: 'Contraseña actualizada y autenticación exitosa.',
          token,
          user: {
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            role: highestRoleName,
            rut: updatedUser.rut
          },
        });
      }

    } catch (error) {
      console.error('Error en forceChangePassword:', error);
      res.status(500).json({ error: 'Error interno del servidor al cambiar la contraseña.' });
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (user && user.email !== "NO TIENE") {
        const { resetToken, hashedToken } = generateResetToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.update({ resetPasswordTokenHash: hashedToken, resetPasswordExpiresAt: expiresAt });
        try {
          await sendPasswordResetEmail(user.email, resetToken);
        } catch (emailError) {
          console.error("Error al enviar email de reseteo:", emailError);
        }
      } else if (user && user.email === "NO TIENE") {
          res.status(400).json({ error: 'El usuario no tiene un email registrado. Contacte con un administrador.' });
      } else {
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
      const user = await User.findOne({ where: { resetPasswordTokenHash: hashedToken } });

      if (!user || !user.resetPasswordExpiresAt || user.resetPasswordExpiresAt < new Date()) {
        res.status(400).json({ error: 'El token para restablecer la contraseña es inválido o ha expirado.' });
        return;
      }
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