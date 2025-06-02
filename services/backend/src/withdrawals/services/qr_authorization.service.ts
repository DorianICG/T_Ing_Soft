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
   * Obtener QR activo de un estudiante
   */
  async getActiveQrForStudent(
    studentId: number, 
    parentUserId: number
  ): Promise<{ 
    qrCode: string; 
    expiresAt: Date; 
    qrAuthId: number; 
    minutesRemaining: number;
    student: { firstName: string; lastName: string };
    reason: { name: string };
    customReason: string | null;
  } | null> {
    
    const activeQr = await QrAuthorization.findOne({
      where: {
        studentId: studentId,
        generatedByUserId: parentUserId,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['firstName', 'lastName']
        },
        {
          model: WithdrawalReason,
          as: 'reason',
          attributes: ['name']
        }
      ]
    });
  
    if (!activeQr) {
      return null;
    }
  
    const now = new Date();
    const minutesRemaining = Math.max(0, Math.floor((activeQr.expiresAt.getTime() - now.getTime()) / (1000 * 60)));
  
    return {
      qrCode: activeQr.code,
      expiresAt: activeQr.expiresAt,
      qrAuthId: activeQr.id,
      minutesRemaining,
      student: {
        firstName: activeQr.student!.firstName,
        lastName: activeQr.student!.lastName
      },
      reason: {
        name: activeQr.reason!.name
      },
      customReason: activeQr.customWithdrawalReason
    };
  }
  
  /**
   * Listar todos los QRs activos del apoderado
   */
  async getActiveQrsForParent(parentUserId: number): Promise<Array<{
    qrAuthId: number;
    qrCode: string;
    student: { id: number; firstName: string; lastName: string };
    reason: { id: number; name: string };
    customReason: string | null;
    expiresAt: Date;
    minutesRemaining: number;
    createdAt: Date;
  }>> {
    
    const activeQrs = await QrAuthorization.findAll({
      where: {
        generatedByUserId: parentUserId,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: WithdrawalReason,
          as: 'reason',
          attributes: ['id', 'name']
        }
      ],
      order: [['expiresAt', 'ASC']]
    });
  
    return activeQrs.map(qr => {
      const now = new Date();
      const minutesRemaining = Math.max(0, Math.floor((qr.expiresAt.getTime() - now.getTime()) / (1000 * 60)));
      
      return {
        qrAuthId: qr.id,
        qrCode: qr.code,
        student: {
          id: qr.student!.id,
          firstName: qr.student!.firstName,
          lastName: qr.student!.lastName
        },
        reason: {
          id: qr.reason!.id,
          name: qr.reason!.name
        },
        customReason: qr.customWithdrawalReason,
        expiresAt: qr.expiresAt,
        minutesRemaining,
        createdAt: qr.createdAt!
      };
    });
  }
  
  /**
   * Inspector autoriza retiro SIN QR
   */
  async authorizeWithoutQr(
    studentId: number,
    inspectorUserId: number,
    reasonId: number,
    customReason?: string,
    transaction?: Transaction
  ): Promise<{ 
    qrAuthId: number; 
    manualAuthorization: true; 
    hadActiveQr: boolean; 
    message: string;
    qrCode: string;
  }> {
    
    const activeQr = await QrAuthorization.findOne({
      where: {
        studentId: studentId,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() }
      },
      transaction
    });
  
    let qrAuthId: number;
    let hadActiveQr = false;
    let message = '';
    let qrCode = '';
  
    if (activeQr) {
      // Marcar QR existente como usado
      await activeQr.update({ 
        isUsed: true,
        updatedAt: new Date()
      }, { transaction });
      
      qrAuthId = activeQr.id;
      qrCode = activeQr.code;
      hadActiveQr = true;
      message = `QR activo ${activeQr.code} marcado como usado por inspector`;
      
    } else {
      // Crear nuevo QR ya marcado como usado
      const qrCodeNumber = await QrGeneratorUtil.generateUniqueCode();
      const qrCodeString = QrGeneratorUtil.formatQrCode(qrCodeNumber);
      
      const qrAuth = await QrAuthorization.create({
        code: qrCodeString,
        studentId: studentId,
        generatedByUserId: inspectorUserId, 
        reasonId: reasonId,
        expiresAt: new Date(), // Ya expirado
        customWithdrawalReason: customReason || null,
        isUsed: true // Ya marcado como usado
      }, { transaction });
      
      qrAuthId = qrAuth.id;
      qrCode = qrCodeString;
      hadActiveQr = false;
      message = `Autorización manual creada: ${qrCodeString}`;
      
    }
  
    return {
      qrAuthId,
      qrCode,
      manualAuthorization: true,
      hadActiveQr,
      message
    };
  }

  /**
   * Obtener historial completo de QRs/retiros del apoderado
   */
  async getParentWithdrawalHistory(
    parentUserId: number,
    options: {
      limit?: number;
      offset?: number;
      studentId?: number;
      includePending?: boolean;
    } = {}
  ): Promise<{
    withdrawals: Array<{
      id: number;
      qrCode: string;
      student: { id: number; firstName: string; lastName: string; courseName?: string };
      reason: { id: number; name: string };
      customReason: string | null;
      status: 'COMPLETED' | 'ACTIVE' | 'EXPIRED';
      createdAt: Date;
      usedAt?: Date;
      expiresAt: Date;
      isManualAuthorization: boolean;
    }>;
    total: number;
    summary: {
      totalCompleted: number;
      totalActive: number;
      totalExpired: number;
    };
  }> {
    
    const { limit = 20, offset = 0, studentId, includePending = true } = options;
    
    // Construir condiciones WHERE
    const whereConditions: any = {
      generatedByUserId: parentUserId
    };
    
    if (studentId) {
      whereConditions.studentId = studentId;
    }
    
    if (!includePending) {
      // Solo mostrar QRs usados o expirados
      whereConditions[Op.or] = [
        { isUsed: true },
        { expiresAt: { [Op.lte]: new Date() } }
      ];
    }
    
    // Obtener QRs/retiros
    const { count, rows: qrAuths } = await QrAuthorization.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['name'],
              required: false
            }
          ]
        },
        {
          model: WithdrawalReason,
          as: 'reason',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    
    // Procesar datos
    const now = new Date();
    const withdrawals = qrAuths.map(qr => {
      let status: 'COMPLETED' | 'ACTIVE' | 'EXPIRED';
      
      if (qr.isUsed) {
        status = 'COMPLETED';
      } else if (qr.expiresAt <= now) {
        status = 'EXPIRED';
      } else {
        status = 'ACTIVE';
      }
      
      return {
        id: qr.id,
        qrCode: qr.code,
        student: {
          id: qr.student!.id,
          firstName: qr.student!.firstName,
          lastName: qr.student!.lastName,
          courseName: qr.student!.course?.name
        },
        reason: {
          id: qr.reason!.id,
          name: qr.reason!.name
        },
        customReason: qr.customWithdrawalReason,
        status,
        createdAt: qr.createdAt!,
        usedAt: qr.isUsed ? qr.updatedAt : undefined,
        expiresAt: qr.expiresAt,
        isManualAuthorization: qr.expiresAt <= qr.createdAt! // Si expira inmediatamente, es manual
      };
    });
    
    // Calcular resumen
    const totalCompleted = withdrawals.filter(w => w.status === 'COMPLETED').length;
    const totalActive = withdrawals.filter(w => w.status === 'ACTIVE').length;
    const totalExpired = withdrawals.filter(w => w.status === 'EXPIRED').length;
    
    return {
      withdrawals,
      total: count,
      summary: {
        totalCompleted,
        totalActive,
        totalExpired
      }
    };
  }

  /**
   * Obtener estadísticas del apoderado
   */
  async getParentWithdrawalStats(parentUserId: number): Promise<{
    thisMonth: {
      generated: number;
      completed: number;
      expired: number;
    };
    allTime: {
      generated: number;
      completed: number;
      successRate: number;
    };
    studentStats: Array<{
      studentId: number;
      studentName: string;
      totalWithdrawals: number;
      lastWithdrawal?: Date;
    }>;
  }> {
    
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Stats del mes actual
    const thisMonthQrs = await QrAuthorization.findAll({
      where: {
        generatedByUserId: parentUserId,
        createdAt: { [Op.gte]: firstDayOfMonth }
      }
    });
    
    const thisMonthGenerated = thisMonthQrs.length;
    const thisMonthCompleted = thisMonthQrs.filter(qr => qr.isUsed).length;
    const thisMonthExpired = thisMonthQrs.filter(qr => !qr.isUsed && qr.expiresAt <= now).length;
    
    // Stats de todos los tiempos
    const allTimeQrs = await QrAuthorization.findAll({
      where: { generatedByUserId: parentUserId }
    });
    
    const allTimeGenerated = allTimeQrs.length;
    const allTimeCompleted = allTimeQrs.filter(qr => qr.isUsed).length;
    const successRate = allTimeGenerated > 0 ? (allTimeCompleted / allTimeGenerated) * 100 : 0;
    
    // Stats por estudiante
    const studentStats = await QrAuthorization.findAll({
      where: { generatedByUserId: parentUserId },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Agrupar por estudiante
    const studentMap = new Map();
    studentStats.forEach(qr => {
      const studentId = qr.student!.id;
      const studentName = `${qr.student!.firstName} ${qr.student!.lastName}`;
      
      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          studentName,
          totalWithdrawals: 0,
          lastWithdrawal: undefined
        });
      }
      
      const stats = studentMap.get(studentId);
      stats.totalWithdrawals++;
      
      if (qr.isUsed && (!stats.lastWithdrawal || qr.updatedAt! > stats.lastWithdrawal)) {
        stats.lastWithdrawal = qr.updatedAt!;
      }
    });
    
    return {
      thisMonth: {
        generated: thisMonthGenerated,
        completed: thisMonthCompleted,
        expired: thisMonthExpired
      },
      allTime: {
        generated: allTimeGenerated,
        completed: allTimeCompleted,
        successRate: Math.round(successRate)
      },
      studentStats: Array.from(studentMap.values())
    };
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