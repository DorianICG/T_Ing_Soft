import { Request, Response, NextFunction } from 'express';
import AdminUserService from '../services/admin.user.service';
import AdminStudentService from '../services/admin.student.service';
import { matchedData } from 'express-validator'; 

export class AdminController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await AdminUserService.createUser(req.body);
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      if (error.message.includes('ya está registrado') || error.message.includes('no encontrado')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al crear usuario.' });
      }
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const routeParams = (req as any).validatedParams || req.params;
      const userId = parseInt(routeParams.id as string, 10); 
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
      const user = await AdminUserService.updateUser(userId, req.body);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
      } else {
        res.json(user);
      }
    } catch (error: any) {
      console.error('Error actualizando usuario:', error);
       if (error.message.includes('ya está registrado') || error.message.includes('no encontrado')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al actualizar usuario.' });
      }
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
       if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
      const user = await AdminUserService.getUserById(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
      } else {
        res.json(user);
      }
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }

  static async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = (req as any).validatedQuery || {}; 
      
      const { page, limit, sortBy, sortOrder, roleName, isActive, search } = queryParams;
      
      const result = await AdminUserService.getAllUsers({ 
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC',
        roleName: roleName as string,
        isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : undefined,
        search: search as string 
      });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deactivateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
      const user = await AdminUserService.deactivateUser(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
      } else {
        res.json({ message: 'Usuario desactivado exitosamente.', user });
      }
    } catch (error: any) {
      console.error('Error desactivando usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }
  
  async activateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
      const user = await AdminUserService.activateUser(userId);
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
      } else {
        res.json({ message: 'Usuario activado exitosamente.', user });
      }
    } catch (error: any) {
      console.error('Error activando usuario:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
      const success = await AdminUserService.deleteUser(userId);
      if (!success) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
      } else {
        res.status(200).json({ message: 'Usuario eliminado exitosamente.' }); // 204 No Content is also an option
      }
    } catch (error: any) {
      console.error('Error eliminando usuario:', error);
      // Handle potential foreign key constraint errors if not handled by DB/service
      res.status(500).json({ error: 'Error interno del servidor o el usuario no puede ser eliminado debido a dependencias.' });
    }
  }

  // --- Student Management ---
  async createStudent(req: Request, res: Response): Promise<void> {
    try {
      const student = await AdminStudentService.createStudent(req.body);
      res.status(201).json(student);
    } catch (error: any) {
      console.error('Error creando alumno:', error);
      if (error.message.includes('ya está registrado') || error.message.includes('no encontrado') || error.message.includes('no es un Apoderado')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al crear alumno.' });
      }
    }
  }

  async updateStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.id, 10);
      if (isNaN(studentId)) {
        res.status(400).json({ error: 'ID de alumno inválido.' });
        return;
      }
      const student = await AdminStudentService.updateStudent(studentId, req.body);
      if (!student) {
        res.status(404).json({ error: 'Alumno no encontrado.' });
      } else {
        res.json(student);
      }
    } catch (error: any) {
      console.error('Error actualizando alumno:', error);
      if (error.message.includes('ya está registrado') || error.message.includes('no encontrado')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al actualizar alumno.' });
      }
    }
  }

  async getStudentById(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.id, 10);
      if (isNaN(studentId)) {
        res.status(400).json({ error: 'ID de alumno inválido.' });
        return;
      }
      const student = await AdminStudentService.getStudentById(studentId);
      if (!student) {
        res.status(404).json({ error: 'Alumno no encontrado.' });
      } else {
        res.json(student);
      }
    } catch (error: any) {
      console.error('Error obteniendo alumno:', error);
      res.status(500).json({ error: 'Error interno del servidor.' });
    }
  }

  static async getAllStudents(req: Request, res: Response, next: NextFunction) {
    try {
      const queryParams = (req as any).validatedQuery || {};
      const { page, limit, sortBy, sortOrder, search  } = queryParams;
  
      const result = await AdminStudentService.getAllStudents({
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'ASC' | 'DESC',
        search: search as string,
      });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteStudent(req: Request, res: Response): Promise<void> {
    try {
      const studentId = parseInt(req.params.id, 10);
      if (isNaN(studentId)) {
        res.status(400).json({ error: 'ID de alumno inválido.' });
        return;
      }
      const success = await AdminStudentService.deleteStudent(studentId);
      if (!success) {
        res.status(404).json({ error: 'Alumno no encontrado.' });
      } else {
        res.status(200).json({ message: 'Alumno eliminado exitosamente.' });
      }
    } catch (error: any) {
      console.error('Error eliminando alumno:', error);
      res.status(500).json({ error: 'Error interno del servidor o el alumno no puede ser eliminado.' });
    }
  }
}

export default new AdminController();