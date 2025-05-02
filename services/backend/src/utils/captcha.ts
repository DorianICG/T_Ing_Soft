import axios from 'axios';
import config from '../config/env';

const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

interface RecaptchaV3WebResponse {
    success: boolean;
    challenge_ts: string;
    hostname: string;
    'error-codes'?: string[];
}

/**
 * @param token 
 * @param remoteIp 
 * @returns
 */
export const verifyRecaptchaV3 = async (token: string, expectedAction?: string, remoteIp?: string): Promise<boolean> => {
  const secretKey = config.RECAPTCHA_V3_SECRET_KEY;

  if (!secretKey) {
    console.error('Error: La clave secreta de reCAPTCHA v3 no está configurada.');
    if (config.NODE_ENV === 'production') return false;
    console.warn('ADVERTENCIA: Saltando verificación reCAPTCHA v3 en entorno no productivo por falta de clave secreta.');
    return true; // Permitir en desarrollo
  }

  if (!token) {
    console.log('Verificación reCAPTCHA v3 fallida: No se proporcionó token.');
    return false;
  }

  try {
    console.log('Verificando token reCAPTCHA v3...');
    const response = await axios.post<RecaptchaV3WebResponse>(
      RECAPTCHA_VERIFY_URL,
      null,
      {
        params: {
          secret: secretKey,
          response: token,
          remoteip: remoteIp,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        },
        timeout: 5000,
      }
    );

    const { success, 'error-codes': errorCodes } = response.data;

    console.log('Respuesta de verificación reCAPTCHA v3:', response.data);

    if (success) {
      console.log('Verificación reCAPTCHA v3 exitosa (success: true).');
      return true;
    } else {
      console.warn('Verificación reCAPTCHA v3 fallida por Google (success: false):', errorCodes);
      return false;
    }

  } catch (error: any) {
    console.error('Error durante la llamada a la API de verificación reCAPTCHA v3:', error.message);
    return false;
  }
};