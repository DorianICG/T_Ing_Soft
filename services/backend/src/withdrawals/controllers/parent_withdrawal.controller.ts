import { Request, Response } from 'express';
import WithdrawalService from '../services/withdrawal.service';
import { GenerateQrRequestDto } from '../utils/withdrawal.types';

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
   * Obtener historial completo de retiros de todos los estudiantes del apoderado
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
      const filters = {
        studentId: req.query.studentId ? parseInt(req.query.studentId as string) : undefined,
        status: req.query.status as string || undefined,
        method: req.query.method as string || undefined,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
        offset: req.query.offset ? parseInt(req.query.offset as string) : 0
      };

      // Validar filtros numéricos
      if (filters.studentId && isNaN(filters.studentId)) {
        res.status(400).json({
          success: false,
          message: 'ID de estudiante inválido'
        });
        return;
      }

      if (filters.limit && (isNaN(filters.limit) || filters.limit < 1 || filters.limit > 100)) {
        res.status(400).json({
          success: false,
          message: 'Límite debe ser entre 1 y 100'
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

      const result = await WithdrawalService.getParentWithdrawalHistory(parentUserId, filters);
      
      res.status(200).json({
        success: true,
        data: {
          withdrawals: result.withdrawals,
          pagination: {
            total: result.total,
            limit: filters.limit,
            offset: filters.offset,
            hasMore: result.hasMore
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
      
      const result = await WithdrawalService.getParentWithdrawalHistory(parentUserId, { studentId });
      
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
}

export default new ParentWithdrawalController();