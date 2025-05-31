import { Withdrawal, Student, User, WithdrawalReason } from '../../models';
import { Transaction, Op } from 'sequelize';
import sequelizeInstance from '../../config/database';
import { 
  GenerateQrRequestDto, 
  ValidateQrRequestDto, 
  ManualWithdrawalRequestDto,
  GenerateQrResponseDto,
  WithdrawalResultDto,
  ProcessWithdrawalData 
} from '../utils/withdrawal.types';
import { WITHDRAWAL_CONSTANTS, WithdrawalStatus, WithdrawalMethod } from '../utils/withdrawal.constants';
import QrAuthorizationService from './qr_authorization.service';

export class WithdrawalService {
  
  /**
   * Generar código QR para retiro (usado por apoderados)
   */
  async generateQrCode(data: GenerateQrRequestDto, parentUserId: number): Promise<GenerateQrResponseDto> {
    const transaction = await sequelizeInstance.transaction();
    
    try {
      // Verificar que el estudiante existe y pertenece al apoderado
      const student = await Student.findOne({
        where: { 
          id: data.studentId,
          parentId: parentUserId
        },
        transaction
      });
      
      if (!student) {
        throw new Error('Estudiante no encontrado o no autorizado para este apoderado');
      }
      
      // Verificar que el motivo existe
      const reason = await WithdrawalReason.findByPk(data.reasonId, { transaction });
      if (!reason) {
        throw new Error('Motivo de retiro no válido');
      }
      
      // Crear autorización QR
      const qrResult = await QrAuthorizationService.createQrAuthorization({
        studentId: data.studentId,
        parentUserId,
        reasonId: data.reasonId,
        customReason: data.customReason
      }, transaction);
      
      await transaction.commit();
      
      return {
        qrCode: qrResult.qrCode,
        expiresAt: qrResult.expiresAt,
        student: {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName
        },
        reason: {
          id: reason.id,
          name: reason.name
        }
      };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * Validar código QR y procesar retiro (usado por inspectores)
   */
  async validateAndProcessQr(data: ValidateQrRequestDto, inspectorUserId: number): Promise<WithdrawalResultDto> {
    const transaction = await sequelizeInstance.transaction();
    
    try {
      // Obtener información del QR
      const qrInfo = await QrAuthorizationService.getQrValidationInfo(data.qrCode);
      
      if (qrInfo.isExpired) {
        throw new Error('El código QR ha expirado');
      }
      
      // Marcar QR como usado
      const qrAuth = await QrAuthorizationService.markQrAsUsed(data.qrCode, transaction);
      
      // Obtener información del inspector
      const inspector = await User.findByPk(inspectorUserId, { transaction });
      if (!inspector) {
        throw new Error('Inspector no encontrado');
      }
      
      // Crear registro de retiro
      const withdrawalData: ProcessWithdrawalData = {
        studentId: qrInfo.student.id,
        inspectorUserId,
        reasonId: qrInfo.reason.id,
        method: WITHDRAWAL_CONSTANTS.WITHDRAWAL_METHOD.QR,
        status: data.action === WITHDRAWAL_CONSTANTS.QR_ACTION.APPROVE ? 
          WITHDRAWAL_CONSTANTS.WITHDRAWAL_STATUS.APPROVED : 
          WITHDRAWAL_CONSTANTS.WITHDRAWAL_STATUS.DENIED,
        qrAuthorizationId: qrAuth.id,
        retrieverUserId: qrInfo.parent.id,
        customReason: qrInfo.customReason,
        notes: data.notes
      };
      
      const withdrawal = await this.createWithdrawalRecord(withdrawalData, transaction);
      
      await transaction.commit();
      
      return {
        id: withdrawal.id,
        status: withdrawal.status as WithdrawalStatus,
        method: withdrawal.method as WithdrawalMethod,
        withdrawalTime: withdrawal.withdrawalTime,
        approver: {
          id: inspector.id,
          name: `${inspector.firstName} ${inspector.lastName}`
        },
        student: {
          id: qrInfo.student.id,
          name: `${qrInfo.student.firstName} ${qrInfo.student.lastName}`,
          rut: qrInfo.student.rut
        },
        notes: withdrawal.notes || undefined
      };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * Procesar retiro manual (usado por inspectores)
   */
  async processManualWithdrawal(data: ManualWithdrawalRequestDto, inspectorUserId: number): Promise<WithdrawalResultDto> {
    const transaction = await sequelizeInstance.transaction();
    
    try {
      // Buscar estudiante por RUT
      const student = await Student.findOne({
        where: { rut: data.studentRut },
        transaction
      });
      
      if (!student) {
        throw new Error('Estudiante no encontrado con el RUT proporcionado');
      }
      
      // Buscar apoderado por RUT
      const parent = await User.findOne({
        where: { rut: data.parentRut },
        transaction
      });
      
      if (!parent) {
        throw new Error('Apoderado no encontrado con el RUT proporcionado');
      }
      
      // Verificar relación apoderado-estudiante usando parentId
      if (student.parentId !== parent.id) {
        throw new Error('El apoderado no está autorizado para retirar a este estudiante');
      }
      
      // Verificar motivo
      const reason = await WithdrawalReason.findByPk(data.reasonId, { transaction });
      if (!reason) {
        throw new Error('Motivo de retiro no válido');
      }
      
      // Obtener información del inspector
      const inspector = await User.findByPk(inspectorUserId, { transaction });
      if (!inspector) {
        throw new Error('Inspector no encontrado');
      }
      
      // Crear registro de retiro manual
      const withdrawalData: ProcessWithdrawalData = {
        studentId: student.id,
        inspectorUserId,
        reasonId: data.reasonId,
        method: WITHDRAWAL_CONSTANTS.WITHDRAWAL_METHOD.MANUAL,
        status: WITHDRAWAL_CONSTANTS.WITHDRAWAL_STATUS.APPROVED,
        retrieverUserId: parent.id,
        customReason: data.customReason,
        notes: data.notes
      };
      
      const withdrawal = await this.createWithdrawalRecord(withdrawalData, transaction);
      
      await transaction.commit();
      
      return {
        id: withdrawal.id,
        status: withdrawal.status as WithdrawalStatus,
        method: withdrawal.method as WithdrawalMethod,
        withdrawalTime: withdrawal.withdrawalTime,
        approver: {
          id: inspector.id,
          name: `${inspector.firstName} ${inspector.lastName}`
        },
        student: {
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
          rut: student.rut
        },
        notes: withdrawal.notes || undefined
      };
      
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  
  /**
   * Obtener estudiantes de un apoderado para generar QR
   */
  async getParentStudents(parentUserId: number): Promise<Array<{id: number, firstName: string, lastName: string, rut: string}>> {
    const students = await Student.findAll({
      where: { parentId: parentUserId },
      attributes: ['id', 'firstName', 'lastName', 'rut']
    });
    
    return students.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      rut: student.rut
    }));
  }
  
  /**
   * Método privado para crear registro de retiro
   */
  private async createWithdrawalRecord(data: ProcessWithdrawalData, transaction: Transaction): Promise<InstanceType<typeof Withdrawal>> {
    return await Withdrawal.create({
      qrAuthorizationId: data.qrAuthorizationId || null,
      studentId: data.studentId,
      organizationApproverUserId: data.inspectorUserId,
      reasonId: data.reasonId,
      method: data.method,
      status: data.status,
      contactVerified: true,
      retrieverUserId: data.retrieverUserId || null,
      customWithdrawalReason: data.customReason || null,
      notes: data.notes || null,
      withdrawalTime: new Date()
    }, { transaction });
  }
  
  /**
   * Obtener historial completo de retiros para apoderados (todos sus estudiantes)
   */
  async getParentWithdrawalHistory(
    parentUserId: number, 
    filters?: {
      studentId?: number;
      status?: string;
      method?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    withdrawals: WithdrawalResultDto[];
    total: number;
    hasMore: boolean;
  }> {
    // Primero obtener los IDs de los estudiantes del apoderado
    const studentIds = await Student.findAll({
      where: { parentId: parentUserId },
      attributes: ['id']
    }).then(students => students.map(s => s.id));

    if (studentIds.length === 0) {
      return { withdrawals: [], total: 0, hasMore: false };
    }

    // Construir filtros
    const whereClause: any = {
      studentId: { [Op.in]: studentIds }
    };

    if (filters?.studentId) {
      whereClause.studentId = filters.studentId;
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.method) {
      whereClause.method = filters.method;
    }
    if (filters?.startDate || filters?.endDate) {
      whereClause.withdrawalTime = {};
      if (filters.startDate) {
        whereClause.withdrawalTime[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.withdrawalTime[Op.lte] = filters.endDate;
      }
    }

    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const { count, rows: withdrawals } = await Withdrawal.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'organizationApproverUser',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'rut']
        },
        {
          model: WithdrawalReason,
          as: 'reason',
          attributes: ['id', 'name']
        }
      ],
      order: [['withdrawalTime', 'DESC']],
      limit,
      offset
    });

    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      id: withdrawal.id,
      status: withdrawal.status as WithdrawalStatus,
      method: withdrawal.method as WithdrawalMethod,
      withdrawalTime: withdrawal.withdrawalTime,
      approver: {
        id: withdrawal.organizationApproverUser!.id,
        name: `${withdrawal.organizationApproverUser!.firstName} ${withdrawal.organizationApproverUser!.lastName}`
      },
      student: {
        id: withdrawal.student!.id,
        name: `${withdrawal.student!.firstName} ${withdrawal.student!.lastName}`,
        rut: withdrawal.student!.rut
      },
      reason: {
        id: withdrawal.reason!.id,
        name: withdrawal.reason!.name
      },
      customReason: withdrawal.customWithdrawalReason || undefined,
      notes: withdrawal.notes || undefined
    }));

    return {
      withdrawals: formattedWithdrawals,
      total: count,
      hasMore: offset + limit < count
    };
  }

  /**
   * Obtener historial completo de retiros para inspectores/admins (todos los estudiantes)
   */
  async getInspectorWithdrawalHistory(
    filters?: {
      studentId?: number;
      studentRut?: string;
      status?: string;
      method?: string;
      approverId?: number;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    withdrawals: WithdrawalResultDto[];
    total: number;
    hasMore: boolean;
  }> {
    // Construir filtros
    const whereClause: any = {};
    const studentWhereClause: any = {};

    if (filters?.studentId) {
      whereClause.studentId = filters.studentId;
    }
    if (filters?.studentRut) {
      studentWhereClause.rut = filters.studentRut;
    }
    if (filters?.status) {
      whereClause.status = filters.status;
    }
    if (filters?.method) {
      whereClause.method = filters.method;
    }
    if (filters?.approverId) {
      whereClause.organizationApproverUserId = filters.approverId;
    }
    if (filters?.startDate || filters?.endDate) {
      whereClause.withdrawalTime = {};
      if (filters.startDate) {
        whereClause.withdrawalTime[Op.gte] = filters.startDate;
      }
      if (filters.endDate) {
        whereClause.withdrawalTime[Op.lte] = filters.endDate;
      }
    }

    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    const { count, rows: withdrawals } = await Withdrawal.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'organizationApproverUser',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'firstName', 'lastName', 'rut'],
          where: Object.keys(studentWhereClause).length > 0 ? studentWhereClause : undefined
        },
        {
          model: WithdrawalReason,
          as: 'reason',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'retrieverUser',
          attributes: ['id', 'firstName', 'lastName', 'rut'],
          required: false
        }
      ],
      order: [['withdrawalTime', 'DESC']],
      limit,
      offset
    });

    const formattedWithdrawals = withdrawals.map(withdrawal => ({
      id: withdrawal.id,
      status: withdrawal.status as WithdrawalStatus,
      method: withdrawal.method as WithdrawalMethod,
      withdrawalTime: withdrawal.withdrawalTime,
      approver: {
        id: withdrawal.organizationApproverUser!.id,
        name: `${withdrawal.organizationApproverUser!.firstName} ${withdrawal.organizationApproverUser!.lastName}`
      },
      student: {
        id: withdrawal.student!.id,
        name: `${withdrawal.student!.firstName} ${withdrawal.student!.lastName}`,
        rut: withdrawal.student!.rut
      },
      reason: {
        id: withdrawal.reason!.id,
        name: withdrawal.reason!.name
      },
      retriever: withdrawal.retrieverUser ? {
        id: withdrawal.retrieverUser.id,
        name: `${withdrawal.retrieverUser.firstName} ${withdrawal.retrieverUser.lastName}`,
        rut: withdrawal.retrieverUser.rut
      } : undefined,
      customReason: withdrawal.customWithdrawalReason || undefined,
      notes: withdrawal.notes || undefined
    }));

    return {
      withdrawals: formattedWithdrawals,
      total: count,
      hasMore: offset + limit < count
    };
  }

  /**
   * Obtener historial de retiros de un estudiante específico (usado por apoderados e inspectores)
   */
  async getStudentWithdrawalHistory(studentId: number): Promise<WithdrawalResultDto[]> {
    const result = await this.getInspectorWithdrawalHistory({ studentId, limit: 100 });
    return result.withdrawals;
  }

  /**
   * Obtener todas las razones de retiro disponibles
   */
  async getWithdrawalReasons(): Promise<Array<{id: number, name: string}>> {
    const reasons = await WithdrawalReason.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });
    
    return reasons.map(reason => ({
      id: reason.id,
      name: reason.name
    }));
  }

}

export default new WithdrawalService();