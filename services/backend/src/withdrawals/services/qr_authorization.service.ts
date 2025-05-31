import { QrAuthorization, Student, User, WithdrawalReason, Course } from '../../models';
import { Op, Transaction } from 'sequelize';
import { QrGeneratorUtil } from '../utils/qr_generator.util';
import { CreateQrAuthorizationData, QrValidationInfoDto } from '../utils/withdrawal.types';

export class QrAuthorizationService {
  
  /**
   * Crear una nueva autorización QR
   */
  async createQrAuthorization(
    data: CreateQrAuthorizationData, 
    transaction?: Transaction
  ): Promise<{ qrCode: string; expiresAt: Date; qrAuthId: number }> {
    
    // Verificar que no hay QR activo para este estudiante
    const activeQr = await QrAuthorization.findOne({
      where: {
        studentId: data.studentId,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      transaction
    });
    
    if (activeQr) {
      throw new Error('Ya existe un código QR activo para este estudiante. Espere a que expire o sea utilizado.');
    }
    
    // Generar código único y fecha de expiración
    const qrCodeNumber = await QrGeneratorUtil.generateUniqueCode();
    const qrCodeString = QrGeneratorUtil.formatQrCode(qrCodeNumber);
    const expiresAt = QrGeneratorUtil.calculateExpirationTime();
    
    // Crear autorización QR
    const qrAuth = await QrAuthorization.create({
      code: qrCodeString,
      studentId: data.studentId,
      generatedByUserId: data.parentUserId,
      reasonId: data.reasonId,
      expiresAt,
      customWithdrawalReason: data.customReason || null,
      isUsed: false
    }, { transaction });
    
    return {
      qrCode: qrCodeString,
      expiresAt,
      qrAuthId: qrAuth.id
    };
  }
  
  /**
   * Obtener información completa de un QR para validación
   */
  async getQrValidationInfo(qrCode: string): Promise<QrValidationInfoDto> {
    // Validar formato
    if (!QrGeneratorUtil.validateQrCodeFormat(qrCode)) {
      throw new Error('Formato de código QR inválido');
    }
    
    const qrAuth = await QrAuthorization.findOne({
      where: { 
        code: qrCode,
        isUsed: false
      },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'parent',
              attributes: ['id', 'rut', 'firstName', 'lastName', 'phone']
            },
            {
              model: Course,
              as: 'course',
              attributes: ['name']
            }
          ]
        },
        {
          model: WithdrawalReason,
          as: 'reason',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'generatedByUser',
          attributes: ['id', 'rut', 'firstName', 'lastName', 'phone']
        }
      ]
    });
    
    if (!qrAuth) {
      throw new Error('Código QR no encontrado o ya utilizado');
    }
    
    const isExpired = QrGeneratorUtil.isExpired(qrAuth.expiresAt);
    
    return {
      student: {
        id: qrAuth.student!.id,
        rut: qrAuth.student!.rut,
        firstName: qrAuth.student!.firstName,
        lastName: qrAuth.student!.lastName,
        courseName: qrAuth.student!.course?.name || 'Sin curso asignado'
      },
      parent: {
        id: qrAuth.generatedByUser!.id,
        rut: qrAuth.generatedByUser!.rut,
        firstName: qrAuth.generatedByUser!.firstName,
        lastName: qrAuth.generatedByUser!.lastName,
        phone: qrAuth.generatedByUser!.phone,
        relationship: 'Apoderado principal'
      },
      reason: {
        id: qrAuth.reason!.id,
        name: qrAuth.reason!.name
      },
      customReason: qrAuth.customWithdrawalReason || undefined,
      expiresAt: qrAuth.expiresAt,
      generatedAt: qrAuth.createdAt!,
      isExpired
    };
  }
  
  /**
   * Marcar QR como usado
   */
  async markQrAsUsed(qrCode: string, transaction?: Transaction): Promise<InstanceType<typeof QrAuthorization>> {
    const qrAuth = await QrAuthorization.findOne({
      where: { 
        code: qrCode,
        isUsed: false
      },
      transaction
    });
    
    if (!qrAuth) {
      throw new Error('Código QR no encontrado o ya utilizado');
    }
    
    if (QrGeneratorUtil.isExpired(qrAuth.expiresAt)) {
      throw new Error('El código QR ha expirado');
    }
    
    await qrAuth.update({ 
      isUsed: true,
      updatedAt: new Date()
    }, { transaction });
    
    return qrAuth;
  }
  
  /**
   * Limpiar QRs expirados y no utilizados
   */
  async cleanExpiredQrs(): Promise<number> {
    const result = await QrAuthorization.destroy({
      where: {
        isUsed: false,
        expiresAt: { [Op.lt]: new Date() }
      }
    });
    
    return result;
  }
}

export default new QrAuthorizationService();