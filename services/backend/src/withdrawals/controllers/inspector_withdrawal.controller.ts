import { Request, Response } from 'express';
import WithdrawalService from '../services/withdrawal.service';
import QrAuthorizationService from '../services/qr_authorization.service';
import { ValidateQrRequestDto, ManualWithdrawalRequestDto } from '../utils/withdrawal.types';
import Student from '../../models/Student';
import User from '../../models/User';
import Course from '../../models/Course';
import sequelize from '../../config/database';
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
      
      // Validaciones básicas
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
   * Autorización manual sin QR (emergencias)
   * POST /api/withdrawals/inspector/authorize-manual
   */
  async authorizeManually(req: Request, res: Response): Promise<void> {
    const transaction = await sequelize.transaction();
    
    try {
      const { studentId, reasonId, customReason } = req.body;
      const inspectorUserId = req.user?.id;
      
      if (!inspectorUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      // Validaciones básicas
      if (!studentId || !reasonId) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: studentId y reasonId'
        });
        return;
      }
      
      const result = await QrAuthorizationService.authorizeWithoutQr(
        studentId,
        inspectorUserId,
        reasonId,
        customReason,
        transaction
      );
      
      await transaction.commit();
      
      res.status(201).json({
        success: true,
        data: result,
        message: 'Retiro autorizado manualmente por inspector'
      });
    } catch (error: any) {
      await transaction.rollback();
      console.error('Error en autorización manual:', error);
      res.status(400).json({ 
        success: false,
        message: error.message 
      });
    }
  }
  
  /**
   * Procesar retiro manual (método original)
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

  /**
   * Obtener estadísticas del inspector
   * GET /api/withdrawals/inspector/stats
   */
  async getInspectorStats(req: Request, res: Response): Promise<void> {
    try {
      const inspectorUserId = req.user?.id;
      
      if (!inspectorUserId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
  
      const { period = 'MONTH', groupBy = 'DAY' } = req.query;
  
      // Calcular fechas según el período
      const now = new Date();
      let startDate: Date;
  
      switch (period) {
        case 'TODAY':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'WEEK':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'MONTH':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'YEAR':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
  
      // Obtener estadísticas del inspector
      const stats = await WithdrawalService.getInspectorWithdrawalHistory({
        approverId: inspectorUserId,
        startDate,
        endDate: now,
        limit: 1000
      });
  
      const totalProcessed = stats.withdrawals.length;
      const totalApproved = stats.withdrawals.filter(w => w.status === 'APPROVED').length;
      const totalDenied = stats.withdrawals.filter(w => w.status === 'DENIED').length;
      const qrProcessed = stats.withdrawals.filter(w => w.method === 'QR').length;
      const manualProcessed = stats.withdrawals.filter(w => w.method === 'MANUAL').length;
  
      // Agrupar por fecha
      const groupedStats = new Map();
      stats.withdrawals.forEach(withdrawal => {
        const date = withdrawal.withdrawalTime;
        let key: string;
  
        switch (groupBy) {
          case 'DAY':
            key = date.toISOString().split('T')[0];
            break;
          case 'WEEK':
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            key = weekStart.toISOString().split('T')[0];
            break;
          case 'MONTH':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }
  
        if (!groupedStats.has(key)) {
          groupedStats.set(key, { approved: 0, denied: 0, total: 0 });
        }
  
        const dayStats = groupedStats.get(key);
        dayStats.total++;
        if (withdrawal.status === 'APPROVED') {
          dayStats.approved++;
        } else {
          dayStats.denied++;
        }
      });
  
      const timeSeriesData = Array.from(groupedStats.entries()).map(([date, stats]) => ({
        date,
        ...stats
      })).sort((a, b) => a.date.localeCompare(b.date));
  
      res.status(200).json({
        success: true,
        data: {
          summary: {
            totalProcessed,
            totalApproved,
            totalDenied,
            approvalRate: totalProcessed > 0 ? Math.round((totalApproved / totalProcessed) * 100) : 0,
            qrProcessed,
            manualProcessed
          },
          period: {
            from: startDate,
            to: now,
            type: period as string
          },
          timeSeries: timeSeriesData
        },
        message: 'Estadísticas obtenidas exitosamente'
      });
  
    } catch (error) {
      console.error('Error obteniendo estadísticas del inspector:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export default new InspectorWithdrawalController();