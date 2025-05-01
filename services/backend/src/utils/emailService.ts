import nodemailer from 'nodemailer';
import config from '../config/env';

// 1. Crear el transporter de Nodemailer
//    Utiliza la configuración del archivo env.ts
const transporter = nodemailer.createTransport({
  host: config.EMAIL_HOST,
  port: config.EMAIL_PORT,
  secure: config.EMAIL_SECURE,
  auth: {

    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
});

// Interfaz para las opciones del correo
interface MailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// 2. Función genérica para enviar correos
export const sendEmail = async (options: MailOptions): Promise<void> => {
  try {
    // Verificar si la configuración esencial del email está presente
    if (!config.EMAIL_HOST || !config.EMAIL_USER || !config.EMAIL_PASS) {
        console.error('Error: Configuración de email incompleta en variables de entorno.');
        throw new Error('La configuración del servicio de email está incompleta.');
    }

    const info = await transporter.sendMail({
      from: config.EMAIL_FROM, 
      to: options.to,         
      subject: options.subject,  
      text: options.text,     
      html: options.html,     
    });

    console.log('Email sent successfully: %s', info.messageId);

  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('No se pudo enviar el correo electrónico.');
  }
};

// 3. Función específica para enviar el código de verificación MFA
export const sendVerificationCode = async (email: string, code: string): Promise<void> => {
  const subject = 'Tu Código de Verificación';
  const textBody = `Hola,\n\nTu código de verificación es: ${code}\n\nEste código expirará en 10 minutos.\n\nSi no solicitaste esto, por favor ignora este mensaje.\n`;
  const htmlBody = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Código de Verificación</h2>
      <p>Hola,</p>
      <p>Tu código de verificación es:</p>
      <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #333;">${code}</p>
      <p>Este código expirará en <strong>10 minutos</strong>.</p>
      <hr>
      <p style="font-size: 0.9em; color: #666;">Si no solicitaste este código, puedes ignorar este mensaje de forma segura.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: subject,
    text: textBody,
    html: htmlBody, 
  });
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {

  const frontendResetUrl = process.env.RESET_PASSWORD_URL || 'http://localhost:4200';
  const resetUrl = `${frontendResetUrl}/reset-password?token=${resetToken}`; 
  const subject = 'Restablecimiento de Contraseña';
  const textBody = `Hola,\n\nRecibiste este correo porque tú (o alguien más) solicitó restablecer la contraseña de tu cuenta.\n\n` +
                   `Por favor, haz clic en el siguiente enlace o pégalo en tu navegador para completar el proceso (el enlace es válido por 10 minutos):\n\n` +
                   `${resetUrl}\n\n` +
                   `Si no solicitaste esto, por favor ignora este correo y tu contraseña permanecerá sin cambios.\n`;
  const htmlBody = `
    <div style="font-family: sans-serif; line-height: 1.6;">
      <h2>Restablecimiento de Contraseña</h2>
      <p>Hola,</p>
      <p>Recibiste este correo porque tú (o alguien más) solicitó restablecer la contraseña de tu cuenta.</p>
      <p>Por favor, haz clic en el siguiente enlace para establecer una nueva contraseña. El enlace es válido por <strong>10 minutos</strong>:</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
          Restablecer Contraseña
        </a>
      </p>
      <p>Si el botón no funciona, copia y pega la siguiente URL en tu navegador:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <hr>
      <p style="font-size: 0.9em; color: #666;">Si no solicitaste esto, puedes ignorar este mensaje de forma segura.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: subject,
    text: textBody,
    html: htmlBody,
  });
};

export default { sendEmail, sendVerificationCode };