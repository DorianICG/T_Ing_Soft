import { Request, Response } from 'express';
import WithdrawalService from '../services/withdrawal.service';
import QrAuthorizationService from '../services/qr_authorization.service';
import { ValidateQrRequestDto, ManualWithdrawalRequestDto } from '../utils/withdrawal.types';
import Student from '../../models/Student';
import User from '../../models/User';
import Course from '../../models/Course';

export class InspectorWithdrawalController {
  
  /**
   * Obtener información de un código QR para validación
   * GET /api/withdrawals/inspector/qr/:qrCode/info
   */
  async getQrInfo(req: Request, res: Response): Promise<void> {
    try {
      const qrCode = req.params.qrCode;
      
      if (!qrCode) {
        res.status(400).json({
          success: false,
          message: 'Código QR es requerido'
        });
        return;
      }
      
      const qrInfo = await QrAuthorizationService.getQrValidationInfo(qrCode);
      
      res.status(200).json({
        success: true,
        data: qrInfo,
        message: 'Información del QR obtenida exitosamente'
      });
      
    } catch (error: any) {
      console.error('Error obteniendo info QR:', error);
      
      if (error.message.includes('no encontrado') || 
          error.message.includes('inválido') || 
          error.message.includes('expirado')) {
        res.status(404).json({
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
   * Procesar decisión sobre código QR (aprobar/denegar)
   * POST /api/withdrawals/inspector/qr/process
   */
  async processQrDecision(req: Request, res: Response): Promise<void> {
    try {
      const inspectorUserId = req.user?.id;
      
      if (!inspectorUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const data: ValidateQrRequestDto = req.body;
      
      // Validaciones básicas (aunque ya pasaron por el middleware de validación)
      if (!data.qrCode || !data.action) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: qrCode y action'
        });
        return;
      }
      
      if (!['APPROVE', 'DENY'].includes(data.action)) {
        res.status(400).json({
          success: false,
          message: 'Acción inválida. Debe ser APPROVE o DENY'
        });
        return;
      }
      
      const result = await WithdrawalService.validateAndProcessQr(data, inspectorUserId);
      
      const statusMessage = result.status === 'APPROVED' ? 'aprobado' : 'denegado';
      
      res.status(200).json({
        success: true,
        data: result,
        message: `Retiro ${statusMessage} exitosamente`
      });
      
    } catch (error: any) {
      console.error('Error procesando QR:', error);
      
      if (error.message.includes('no encontrado') || 
          error.message.includes('expirado') || 
          error.message.includes('utilizado')) {
        res.status(404).json({
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
   * Procesar retiro manual
   * POST /api/withdrawals/inspector/manual
   */
  async processManualWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const inspectorUserId = req.user?.id;
      
      if (!inspectorUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const data: ManualWithdrawalRequestDto = req.body;
      
      // Validaciones básicas
      if (!data.studentRut || !data.parentRut || !data.reasonId) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: studentRut, parentRut y reasonId'
        });
        return;
      }
      
      const result = await WithdrawalService.processManualWithdrawal(data, inspectorUserId);
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Retiro manual procesado exitosamente'
      });
      
    } catch (error: any) {
      console.error('Error procesando retiro manual:', error);
      
      if (error.message.includes('no encontrado') || 
          error.message.includes('no autorizado')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }
      
      if (error.message.includes('no válido')) {
        res.status(400).json({
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
   * Obtener historial completo de retiros con filtros
   * GET /api/withdrawals/inspector/history
   */
  async getWithdrawalHistory(req: Request, res: Response): Promise<void> {
    try {
      // Extraer filtros de query params
      const filters = {
        studentId: req.query.studentId ? parseInt(req.query.studentId as string) : undefined,
        studentRut: req.query.studentRut as string || undefined,
        status: req.query.status as string || undefined,
        method: req.query.method as string || undefined,
        approverId: req.query.approverId ? parseInt(req.query.approverId as string) : undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      // Validaciones
      if (filters.studentId && isNaN(filters.studentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de estudiante inválido'
        });
        return;
      }

      if (filters.approverId && isNaN(filters.approverId)) {
        res.status(400).json({
          success: false,
          message: 'ID de aprobador inválido'
        });
        return;
      }

      if (filters.limit && (isNaN(filters.limit) || filters.limit < 1 || filters.limit > 200)) {
        res.status(400).json({
          success: false,
          message: 'Límite debe ser entre 1 y 200'
        });
        return;
      }

      if (filters.offset && (isNaN(filters.offset) || filters.offset < 0)) {
        res.status(400).json({
          success: false,
          message: 'Offset debe ser 0 o mayor'
        });
        return;
      }

      const result = await WithdrawalService.getInspectorWithdrawalHistory(filters);
      
      res.status(200).json({
        success: true,
        data: {
          withdrawals: result.withdrawals,
          pagination: {
            total: result.total,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: result.hasMore
          },
          filters: {
            applied: Object.fromEntries(
              Object.entries(filters).filter(([_, value]) => value !== undefined)
            )
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
   * Obtener motivos de retiro disponibles
   * GET /api/withdrawals/inspector/reasons
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
   * Buscar estudiante por RUT (para retiro manual)
   * GET /api/withdrawals/inspector/student/:rut
   */
  async searchStudentByRut(req: Request, res: Response): Promise<void> {
    try {
      const rut = req.params.rut;
      
      if (!rut) {
        res.status(400).json({
          success: false,
          message: 'RUT es requerido'
        });
        return;
      } 

      // Buscar estudiante por RUT
      const student = await Student.findOne({
        where: { rut: rut },
        include: [
          {
            model: User,
            as: 'parent',
            attributes: ['id', 'rut', 'firstName', 'lastName', 'phone']
          },
          {
            model: Course,
            as: 'course',
            attributes: ['id', 'name']
          }
        ]
      }); 

      if (!student) {
        res.status(404).json({
          success: false,
          message: 'Estudiante no encontrado con el RUT proporcionado'
        });
        return;
      } 

      res.status(200).json({
        success: true,
        data: {
          student: {
            id: student.id,
            rut: student.rut,
            firstName: student.firstName,
            lastName: student.lastName,
            fullName: `${student.firstName} ${student.lastName}`,
            course: student.course ? {
              id: student.course.id,
              name: student.course.name
            } : null
          },
          authorizedParent: student.parent ? {
            id: student.parent.id,
            rut: student.parent.rut,
            firstName: student.parent.firstName,
            lastName: student.parent.lastName,
            fullName: `${student.parent.firstName} ${student.parent.lastName}`,
            phone: student.parent.phone
          } : null
        },
        message: 'Estudiante encontrado exitosamente'
      });
      
    } catch (error) {
      console.error('Error buscando estudiante:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  } 

    
  }

export default new InspectorWithdrawalController();