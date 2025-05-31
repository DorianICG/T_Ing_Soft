import { QrAuthorization } from '../../models';
import { WITHDRAWAL_CONSTANTS } from './withdrawal.constants';

export class QrGeneratorUtil {
  /**
   * Genera un código QR único de 6 dígitos
   */
  static async generateUniqueCode(): Promise<number> {
    let isUnique = false;
    let qrCode: number;
    let attempts = 0;
    
    while (!isUnique && attempts < WITHDRAWAL_CONSTANTS.MAX_QR_GENERATION_ATTEMPTS) {
      // Generar número de 6 dígitos
      const min = Math.pow(10, WITHDRAWAL_CONSTANTS.QR_CODE_LENGTH - 1);
      const max = Math.pow(10, WITHDRAWAL_CONSTANTS.QR_CODE_LENGTH) - 1;
      qrCode = Math.floor(min + Math.random() * (max - min + 1));
      
      // Verificar que no existe
      const qrCodeString = this.formatQrCode(qrCode);
      const existing = await QrAuthorization.findOne({
        where: { code: qrCodeString }
      });
      
      if (!existing) {
        isUnique = true;
      }
      
      attempts++;
    }
    
    if (!isUnique) {
      throw new Error('No se pudo generar un código QR único después de múltiples intentos');
    }
    
    return qrCode!;
  }

  /**
   * Calcula la fecha de expiración
   */
  static calculateExpirationTime(): Date {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + WITHDRAWAL_CONSTANTS.QR_EXPIRATION_HOURS);
    return expiresAt;
  }

  /**
   * Verifica si un código QR ha expirado
   */
  static isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Formatea el código QR para display (6 dígitos con ceros a la izquierda)
   */
  static formatQrCode(code: number): string {
    return code.toString().padStart(WITHDRAWAL_CONSTANTS.QR_CODE_LENGTH, '0');
  }

  /**
   * Valida que el formato del código QR sea correcto
   */
  static validateQrCodeFormat(qrCode: string): boolean {
    const regex = new RegExp(`^\\d{${WITHDRAWAL_CONSTANTS.QR_CODE_LENGTH}}$`);
    return regex.test(qrCode);
  }
}