import { Request, Response } from 'express';
import WithdrawalService from '../services/withdrawal.service';
import QrAuthorizationService from '../services/qr_authorization.service';
import { GenerateQrRequestDto } from '../utils/withdrawal.types';
import { QrAuthorization, Student } from '../../models';
import { Op } from 'sequelize';

export class ParentWithdrawalController {
  
  /**
   * Obtener lista de estudiantes del apoderado
   * GET /api/withdrawals/parent/students
   */
  async getMyStudents(req: Request, res: Response): Promise<void> {
    try {
      const parentUserId = req.user?.id; 
      
      if (!parentUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const students = await WithdrawalService.getParentStudents(parentUserId);
      
      res.status(200).json({
        success: true,
        data: students,
        message: 'Estudiantes obtenidos exitosamente'
      });
      
    } catch (error) {
      console.error('Error obteniendo estudiantes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Generar código QR para retiro
   * POST /api/withdrawals/parent/generate-qr
   */
  async generateQrCode(req: Request, res: Response): Promise<void> {
    try {
      const parentUserId = req.user?.id;
      
      if (!parentUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const data: GenerateQrRequestDto = req.body;
      
      // Validaciones básicas
      if (!data.studentId || !data.reasonId) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: studentId y reasonId'
        });
        return;
      }
      
      const result = await WithdrawalService.generateQrCode(data, parentUserId);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Código QR generado exitosamente'
      });
      
    } catch (error: any) {
      console.error('Error generando QR:', error);
      
      // Manejar errores específicos
      if (error.message.includes('no encontrado') || error.message.includes('no autorizado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      if (error.message.includes('Ya existe un código QR activo')) {
        res.status(409).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
  
  /**
   * Obtener QRs activos del apoderado
   * GET /api/withdrawals/parent/active-qrs
   */
  async getMyActiveQrs(req: Request, res: Response): Promise<void> {
    try {
      const parentUserId = req.user?.id; 
      
      if (!parentUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const activeQrs = await QrAuthorizationService.getActiveQrsForParent(parentUserId);
      
      res.status(200).json({
        success: true,
        data: activeQrs,
        count: activeQrs.length,
        message: 'Códigos QR activos obtenidos exitosamente'
      });
    } catch (error: any) {
      console.error('Error obteniendo QRs activos:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  /**
   * Reenviar código QR activo para un estudiante
   * POST /api/withdrawals/parent/students/:studentId/resend-qr
   */
  async resendActiveQr(req: Request, res: Response): Promise<void> {
    try {
      const { studentId } = req.params;
      const parentUserId = req.user?.id;
      
      if (!parentUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      if (isNaN(parseInt(studentId))) {
        res.status(400).json({
          success: false,
          message: 'ID de estudiante inválido'
        });
        return;
      }
      
      const activeQr = await QrAuthorizationService.getActiveQrForStudent(
        parseInt(studentId), 
        parentUserId
      );
      
      if (!activeQr) {
        res.status(404).json({ 
          success: false,
          message: 'No hay código QR activo para este estudiante' 
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        data: activeQr,
        message: 'Código QR reenviado exitosamente'
      });
    } catch (error: any) {
      console.error('Error reenviando QR:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error interno del servidor' 
      });
    }
  }

  /**
   * Obtener historial completo de QRs/retiros del apoderado
   * GET /api/withdrawals/parent/history
   */
  async getMyWithdrawalHistory(req: Request, res: Response): Promise<void> {
    try {
      const parentUserId = req.user?.id;
      
      if (!parentUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      // Extraer filtros de query params
      const options = {
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0,
        studentId: req.query.studentId ? parseInt(req.query.studentId as string) : undefined,
        includePending: req.query.includePending === 'true'
      };

      // Validar filtros numéricos
      if (options.studentId && isNaN(options.studentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de estudiante inválido'
        });
        return;
      }

      if (options.limit && (isNaN(options.limit) || options.limit < 1 || options.limit > 100)) {
        res.status(400).json({
          success: false,
          message: 'Límite debe ser entre 1 y 100'
        });
        return;
      }

      if (options.offset && (isNaN(options.offset) || options.offset < 0)) {
        res.status(400).json({
          success: false,
          message: 'Offset debe ser 0 o mayor'
        });
        return;
      }

      const result = await QrAuthorizationService.getParentWithdrawalHistory(parentUserId, options);
      
      res.status(200).json({
        success: true,
        data: {
          withdrawals: result.withdrawals,
          total: result.total,
          summary: result.summary,
          pagination: {
            limit: options.limit,
            offset: options.offset,
            hasMore: (options.offset + options.limit) < result.total
          }
        },
        message: 'Historial obtenido exitosamente'
      });
      
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener estadísticas del apoderado
   * GET /api/withdrawals/parent/stats
   */
  async getMyStats(req: Request, res: Response): Promise<void> {
    try {
      const parentUserId = req.user?.id;
      
      if (!parentUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const stats = await QrAuthorizationService.getParentWithdrawalStats(parentUserId);
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'Estadísticas obtenidas exitosamente'
      });
      
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener historial de retiros de un estudiante específico
   * GET /api/withdrawals/parent/students/:studentId/history
   */
  async getStudentHistory(req: Request, res: Response): Promise<void> {
    try {
      const parentUserId = req.user?.id;
      const studentId = parseInt(req.params.studentId);
      
      if (!parentUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      if (isNaN(studentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de estudiante inválido'
        });
        return;
      }
      
      // Verificar que el estudiante pertenece al apoderado
      const students = await WithdrawalService.getParentStudents(parentUserId);
      const isAuthorized = students.some(student => student.id === studentId);
      
      if (!isAuthorized) {
        res.status(403).json({
          success: false,
          message: 'No tiene autorización para ver el historial de este estudiante'
        });
        return;
      }
      
      const result = await QrAuthorizationService.getParentWithdrawalHistory(parentUserId, { studentId });
      
      res.status(200).json({
        success: true,
        data: result.withdrawals,
        message: 'Historial obtenido exitosamente'
      });
      
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener motivos de retiro disponibles
   * GET /api/withdrawals/parent/reasons
   */
  async getWithdrawalReasons(req: Request, res: Response): Promise<void> {
    try {
      const reasons = await WithdrawalService.getWithdrawalReasons();
      
      res.status(200).json({
        success: true,
        data: reasons,
        message: 'Motivos de retiro obtenidos exitosamente'
      });
      
    } catch (error) {
      console.error('Error obteniendo motivos de retiro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Cancelar código QR activo
   * DELETE /api/withdrawals/parent/qr/:identifier/cancel
   */
  async cancelActiveQr(req: Request, res: Response): Promise<void> {
    try {
      const { identifier } = req.params;
      const parentUserId = req.user?.id;
      
      if (!parentUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
  
      const qrAuth = await QrAuthorization.findOne({
        where: {
          code: identifier,
          generatedByUserId: parentUserId,
          isUsed: false,
          expiresAt: { [Op.gt]: new Date() }
        },
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['firstName', 'lastName']
          }
        ]
      });
  
      if (!qrAuth) {
        res.status(404).json({
          success: false,
          message: 'Código QR no encontrado, ya usado, expirado o no pertenece a este apoderado'
        });
        return;
      }
  
      const originalExpiresAt = qrAuth.expiresAt;
      const cancelledAt = new Date();
      
      await qrAuth.update({
        expiresAt: cancelledAt,
        updatedAt: cancelledAt
      });
  
      res.status(200).json({
        success: true,
        data: {
          qrCode: qrAuth.code,
          student: {
            firstName: qrAuth.student?.firstName,
            lastName: qrAuth.student?.lastName
          },
          cancelledAt: cancelledAt,
          originalExpiresAt: originalExpiresAt,
          cancelledBy: 'parent'
        },
        message: 'Código QR cancelado exitosamente'
      });
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      });
    }
  }
}

export default new ParentWithdrawalController();