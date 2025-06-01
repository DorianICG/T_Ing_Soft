import { Request, Response, NextFunction } from 'express';
import AdminCourseService from '../services/admin.course.service';
import AdminUserService, { UserCreationRequestData }from '../services/admin.user.service';
import AdminStudentService, { CreateStudentData, RawStudentDataBulk } from '../services/admin.student.service';
import { AuthenticatedAdminRequest, AuthenticatedAdminUser } from '../middlewares/admin.auth.middleware'; 
import { matchedData } from 'express-validator'; 
import Papa from 'papaparse';

export class AdminController {
  
  // CREAR USUARIO
  async createUser(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    console.log('--- AdminController.createUser ---');
    console.log('req.body después de validación:', JSON.stringify(req.body, null, 2));
    
    try {
      if (!adminReq.user || typeof adminReq.user.activeOrganizationId !== 'number') {
        res.status(401).json({ error: 'Acceso no autorizado o la organización activa del administrador no está definida.' });
        return;
      }
  
      const selectedOrgId = adminReq.user.activeOrganizationId;
  
      const userData: UserCreationRequestData = {
        rut: req.body.rut,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email || 'NO TIENE',
        phone: req.body.phone || 'NO TIENE',
        password: req.body.password,
        roleName: req.body.roleName,
        organizationId: selectedOrgId,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
      };
  
      console.log('User payload a enviar al servicio:', JSON.stringify(userData, null, 2));
  
      const newUser = await AdminUserService.createUser(userData, adminReq.user);
      res.status(201).json(newUser);
  
    } catch (error: any) {
      console.log('--- AdminController CATCH BLOCK ---');
      console.log('Error Type:', typeof error);
      console.log('Is Error Instance:', error instanceof Error);
      console.log('Error Message:', error.message);
      console.log('Error Stack:', error.stack);
      
      if (error.message.includes('ya existe') || 
          error.message.includes('inválido') ||
          error.message.includes('requerido') ||
          error.message.includes('organización')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al crear usuario.' });
      }
    }
  }
  
  // CREAR USUARIOS MÁSIVOS
  async createUsersBulk(req: Request, res: Response): Promise<void> {
    console.log('--- createUsersBulk controller: REQUEST RECEIVED ---');
    const adminReq = req as AuthenticatedAdminRequest;

    if (!adminReq.file) {
      res.status(400).json({ error: 'No se proporcionó ningún archivo CSV.' });
      return;
    }

    if (!adminReq.user || !adminReq.user.adminOrganizations) {
      res.status(401).json({ error: 'Acceso no autorizado o información de administrador/organizaciones no disponible.' });
      return;
    }


    let selectedOrgId: number | undefined;
    const organizationIdFromBody = adminReq.body.organizationId;

    if (organizationIdFromBody !== undefined && organizationIdFromBody !== null && String(organizationIdFromBody).trim() !== "") {
      const parsedOrgId = parseInt(String(organizationIdFromBody), 10);
      if (isNaN(parsedOrgId) || parsedOrgId <= 0) {
        res.status(400).json({ error: 'El ID de organización proporcionado en el cuerpo es inválido.' });
        return;
      }
      selectedOrgId = parsedOrgId;
    } else {
      if (adminReq.user.adminOrganizations.length === 1) {
        selectedOrgId = adminReq.user.adminOrganizations[0].id;
      } else if (adminReq.user.adminOrganizations.length === 0) {
        res.status(400).json({ error: 'El administrador no pertenece a ninguna organización. No se puede realizar la importación masiva.' });
        return;
      } else { 
        console.log('DEBU: Admin belongs to multiple orgs, and no specific orgId provided. Sending 400 error.');
        res.status(400).json({ error: 'El administrador pertenece a múltiples organizaciones. Debe seleccionar una organización para la importación masiva.' });
        return;
      }
    }

    if (selectedOrgId === undefined) {
        res.status(500).json({ error: 'No se pudo determinar la organización para la importación.' });
        return;
    }


    try {
      const csvData = adminReq.file.buffer.toString('utf-8');
      const parseResult = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        transformHeader: header => header.trim(),
      });

      if (parseResult.errors.length > 0) {
        console.error('Errores al parsear CSV:', parseResult.errors);
        res.status(400).json({ 
          error: 'Error al parsear el archivo CSV.', 
          details: parseResult.errors.map(e => ({ message: e.message, row: e.row }))
        });
        return;
      }

      const headerMapping: { [key: string]: string } = {
        'RUT': 'rut',
        'Nombres': 'firstName',
        'Apellidos': 'lastName',
        'Correo': 'email',
        'Celular': 'phone',
        'Rol': 'roleName'
      };

      const usersDataProcessed = parseResult.data.map((row: any) => {
        const processedRow: { [key: string]: any } = {};
        for (const spanishHeader in row) {
          if (Object.prototype.hasOwnProperty.call(row, spanishHeader)) {
            const englishKey = headerMapping[spanishHeader.trim()] || spanishHeader.trim().toLowerCase(); 
            processedRow[englishKey] = row[spanishHeader];
          }
        }
        return processedRow;
      });

      const usersData = usersDataProcessed as Array<{
        rut?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        roleName?: string;
      }>; 
      
      const results = await AdminUserService.createUsersBulk(usersData, adminReq.user, selectedOrgId);

      res.status(207).json({
        message: 'Proceso de carga masiva completado.',
        results
      });

    } catch (error: any) {
      console.error('Error en la carga masiva de usuarios (dentro del catch principal):', error);
      if (!res.headersSent) {
        if (error.message.includes('organización seleccionada') || 
            error.message.includes('No se proporcionó un ID de organización') ||
            error.message.includes('no pertenece a ninguna organización') ||
            error.message.includes('El ID de organización proporcionado en el cuerpo es inválido')) {
          res.status(400).json({ error: error.message });
        } else {
          res.status(500).json({ error: 'Error interno del servidor durante la carga masiva.' });
        }
      } else {
        console.error('Error: Respuesta ya enviada, no se puede enviar otra respuesta.');
      }
    }
  }
 
  // OBTENER USUARIOS
  async getUsers(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      // Extraer parámetros de query
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const search = req.query.search as string || '';
      const roleFilter = req.query.role as string || '';
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
  
      // Verificar permisos de organización si se especifica
      if (organizationId && !adminReq.user.adminOrganizations.some(org => org.id === organizationId)) {
        res.status(403).json({ error: 'No tiene permisos para ver usuarios de esta organización.' });
        return;
      }
  
      const users = await AdminUserService.getUsers({
        page,
        limit,
        search,
        roleFilter,
        organizationId,
        isActive,
        adminOrganizations: adminReq.user.adminOrganizations
      });
  
      res.status(200).json(users);
  
    } catch (error: any) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener usuarios.' });
    }
  }
  
  // OBTENER USUARIO POR ID
  async getUser(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
  
      const user = await AdminUserService.getUser(userId, adminReq.user.adminOrganizations);
      
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado.' });
        return;
      }
  
      res.status(200).json(user);
  
    } catch (error: any) {
      console.error('Error obteniendo usuario:', error);
      if (error.message.includes('autorización')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al obtener usuario.' });
      }
    }
  }
  
  // MODIFICAR USUARIO
  async updateUser(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
  
      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        isActive: req.body.isActive,
        roleName: req.body.roleName,
        organizationId: req.body.organizationId ? parseInt(req.body.organizationId) : undefined
      };
  
      const updatedUser = await AdminUserService.updateUser(userId, updateData, adminReq.user);
      res.status(200).json(updatedUser);
  
    } catch (error: any) {
      console.error('Error actualizando usuario:', error);
      if (error.message.includes('no encontrado') || 
          error.message.includes('autorización') ||
          error.message.includes('ya está registrado')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al actualizar usuario.' });
      }
    }
  }
  
  // ELIMINAR USUARIO
  async deleteUser(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
  
      await AdminUserService.deleteUser(userId, adminReq.user);
      res.status(200).json({ message: 'Usuario eliminado exitosamente.' });
  
    } catch (error: any) {
      console.error('Error eliminando usuario:', error);
      if (error.message.includes('no encontrado') || 
          error.message.includes('autorización') ||
          error.message.includes('no se puede eliminar')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al eliminar usuario.' });
      }
    }
  }
  
  // DESACTIVAR/ACTIVAR USUARIO
  async toggleUserStatus(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        res.status(400).json({ error: 'ID de usuario inválido.' });
        return;
      }
  
      const isActive = req.body.isActive;
      if (typeof isActive !== 'boolean') {
        res.status(400).json({ error: 'El campo isActive debe ser un booleano.' });
        return;
      }
  
      const updatedUser = await AdminUserService.toggleUserStatus(userId, isActive, adminReq.user);
      res.status(200).json(updatedUser);
  
    } catch (error: any) {
      console.error('Error cambiando estado de usuario:', error);
      if (error.message.includes('no encontrado') || error.message.includes('autorización')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al cambiar estado de usuario.' });
      }
    }
  }

  // CREAR ESTUDIANTE
  async createStudent(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    const validatedBody = adminReq.body; 
    try {
      if (!adminReq.user || typeof adminReq.user.activeOrganizationId !== 'number') {
        res.status(401).json({ error: 'Acceso no autorizado o la organización activa del administrador no está definida.' });
        return;
      }

      const activeOrgId = adminReq.user.activeOrganizationId;

      let birthDateString: string | null = null;
      if (validatedBody.birthDate) {
        if (validatedBody.birthDate instanceof Date) {
          birthDateString = validatedBody.birthDate.toISOString().split('T')[0];
        } else if (typeof validatedBody.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(validatedBody.birthDate)) {
          birthDateString = validatedBody.birthDate;
        }
      }

      const studentPayload: CreateStudentData = {
        rut: validatedBody.rut,
        firstName: validatedBody.firstName,
        lastName: validatedBody.lastName,
        birthDate: birthDateString,
        courseId: validatedBody.courseId,
        parentRut: validatedBody.parentRut || null,
        organizationId: activeOrgId,
      };

      const newStudent = await AdminStudentService.createStudent(studentPayload);
      res.status(201).json(newStudent);

    } catch (error: any) {
      console.error('Error creando estudiante:', error);
      const badRequestKeywords = [
        'RUT', 'nombre', 'apellido', 'curso', 'padre', 'organización', 'fecha de nacimiento',
        'ya está registrado', 'no existe', 'formato incorrecto', 'obligatorio', 'no es válido',
        'no pertenece a la organización'
      ];

      if (badRequestKeywords.some(keyword => error.message.toLowerCase().includes(keyword.toLowerCase()))) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al crear el estudiante.' });
      }
    }
  }

  // CREAR ESTUDIANTES MÁSIVOS
  async createStudentsBulk(req: Request, res: Response): Promise<void> {
    console.log('--- createStudentsBulk controller: REQUEST RECEIVED ---');
    const adminReq = req as AuthenticatedAdminRequest;

    if (!adminReq.file) {
      res.status(400).json({ error: 'No se proporcionó ningún archivo CSV.' });
      return;
    }

    if (!adminReq.user || !adminReq.user.adminOrganizations) {
      res.status(401).json({ error: 'Acceso no autorizado o información de administrador/organizaciones no disponible.' });
      return;
    }

    let selectedOrgId: number | undefined;
    const organizationIdFromBody = adminReq.body.organizationId;

    if (organizationIdFromBody !== undefined && organizationIdFromBody !== null && String(organizationIdFromBody).trim() !== "") {
      const parsedOrgId = parseInt(String(organizationIdFromBody), 10);
      if (isNaN(parsedOrgId) || parsedOrgId <= 0) {
        res.status(400).json({ error: 'El ID de organización proporcionado en el cuerpo es inválido.' });
        return;
      }
      if (!adminReq.user.adminOrganizations.some(org => org.id === parsedOrgId)) {
        res.status(403).json({ error: 'El administrador no tiene permisos sobre la organización especificada.' });
        return;
      }
      selectedOrgId = parsedOrgId;
    } else {
      if (adminReq.user.adminOrganizations.length === 1) {
        selectedOrgId = adminReq.user.adminOrganizations[0].id;
      } else if (adminReq.user.adminOrganizations.length === 0) {
        res.status(400).json({ error: 'El administrador no pertenece a ninguna organización. No se puede realizar la importación masiva.' });
        return;
      } else {
        res.status(400).json({ error: 'El administrador pertenece a múltiples organizaciones. Debe seleccionar una organización para la importación masiva (enviando organizationId en el cuerpo del form-data).' });
        return;
      }
    }

    if (selectedOrgId === undefined) {
      res.status(500).json({ error: 'No se pudo determinar la organización para la importación.' });
      return;
    }

    try {
      const csvData = adminReq.file.buffer.toString('utf-8');
      const parseResult = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        transformHeader: header => header.trim(),
      });

      if (parseResult.errors.length > 0) {
        console.error('Errores al parsear CSV de estudiantes:', parseResult.errors);
        res.status(400).json({
          error: 'Error al parsear el archivo CSV de estudiantes.',
          details: parseResult.errors.map(e => ({ message: e.message, row: e.row }))
        });
        return;
      }

      const headerMapping: { [key: string]: string } = {
        'RUT': 'rut',
        'Nombres': 'firstName',
        'Apellidos': 'lastName',
        'Curso': 'courseName',
        'Fecha de Nacimiento': 'birthDateRaw',
        'RUT Apoderado': 'parentRut'
      };

      const studentsRawData: RawStudentDataBulk[] = parseResult.data.map((row: any, index: number): RawStudentDataBulk => { // <--- Tipar el retorno del map
        const processedRow: any = { originalRowNumber: index + 2 }; 
        for (const csvHeader in row) {
          if (Object.prototype.hasOwnProperty.call(row, csvHeader)) {
            const trimmedCsvHeader = csvHeader.trim();
            const mappedKey = headerMapping[trimmedCsvHeader] || trimmedCsvHeader.toLowerCase().replace(/\s+/g, '');
            processedRow[mappedKey] = row[csvHeader];
          }
        }
        return {
            rut: processedRow.rut,
            firstName: processedRow.firstName,
            lastName: processedRow.lastName,
            courseName: processedRow.courseName,
            birthDateRaw: processedRow.birthDateRaw,
            parentRut: processedRow.parentRut,
            originalRowNumber: processedRow.originalRowNumber,
        } as RawStudentDataBulk;
      });
      
      const validStudentData = studentsRawData.filter(row => row.rut || row.firstName || row.lastName);

      if (validStudentData.length === 0) {
        res.status(400).json({ error: 'El archivo CSV no contiene datos de estudiantes válidos o está vacío después de la cabecera.' });
        return;
      }

      const results = await AdminStudentService.createStudentsBulk(validStudentData, adminReq.user, selectedOrgId);

      res.status(207).json({
        message: 'Proceso de carga masiva de estudiantes completado.',
        results
      });

    } catch (error: any) {
      console.error('Error en la carga masiva de estudiantes (catch principal del controlador):', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error interno del servidor durante la carga masiva de estudiantes.' });
      }
    }
  }

  // OBTENER ESTUDIANTES
  async getStudents(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;

    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const search = req.query.search as string || '';
      const courseId = req.query.courseId ? parseInt(req.query.courseId as string) : undefined;
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
      const hasParent = req.query.hasParent !== undefined ? req.query.hasParent === 'true' : undefined;

      // Verificar permisos de organización
      if (organizationId && !adminReq.user.adminOrganizations.some(org => org.id === organizationId)) {
        res.status(403).json({ error: 'No tiene permisos para ver estudiantes de esta organización.' });
        return;
      }

      const students = await AdminStudentService.getStudents({
        page,
        limit,
        search,
        courseId,
        organizationId,
        hasParent,
        adminOrganizations: adminReq.user.adminOrganizations
      });

      res.status(200).json(students);

    } catch (error: any) {
      console.error('Error obteniendo estudiantes:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener estudiantes.' });
    }
  }

  // OBTENER ESTUDIANTE POR ID
  async getStudent(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;

    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }

      const studentId = parseInt(req.params.id);
      if (isNaN(studentId)) {
        res.status(400).json({ error: 'ID de estudiante inválido.' });
        return;
      }

      const student = await AdminStudentService.getStudent(studentId, adminReq.user.adminOrganizations);

      if (!student) {
        res.status(404).json({ error: 'Estudiante no encontrado.' });
        return;
      }

      res.status(200).json(student);

    } catch (error: any) {
      console.error('Error obteniendo estudiante:', error);
      if (error.message.includes('autorización')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al obtener estudiante.' });
      }
    }
  }

  // MODIFICAR ESTUDIANTE
  async updateStudent(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;

    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }

      const studentId = parseInt(req.params.id);
      if (isNaN(studentId)) {
        res.status(400).json({ error: 'ID de estudiante inválido.' });
        return;
      }

      let birthDateString: string | null = null;
      if (req.body.birthDate) {
        if (req.body.birthDate instanceof Date) {
          birthDateString = req.body.birthDate.toISOString().split('T')[0];
        } else if (typeof req.body.birthDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(req.body.birthDate)) {
          birthDateString = req.body.birthDate;
        }
      }

      const updateData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        birthDate: birthDateString,
        courseId: req.body.courseId,
        parentRut: req.body.parentRut
      };

      const updatedStudent = await AdminStudentService.updateStudent(studentId, updateData, adminReq.user);
      res.status(200).json(updatedStudent);

    } catch (error: any) {
      console.error('Error actualizando estudiante:', error);
      if (error.message.includes('no encontrado') || 
          error.message.includes('autorización') ||
          error.message.includes('ya está registrado')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al actualizar estudiante.' });
      }
    }
  }

  // ELIMINAR ESTUDIANTE
  async deleteStudent(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;

    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }

      const studentId = parseInt(req.params.id);
      if (isNaN(studentId)) {
        res.status(400).json({ error: 'ID de estudiante inválido.' });
        return;
      }

      await AdminStudentService.deleteStudent(studentId, adminReq.user);
      res.status(200).json({ message: 'Estudiante eliminado exitosamente.' });

    } catch (error: any) {
      console.error('Error eliminando estudiante:', error);
      if (error.message.includes('no encontrado') || 
          error.message.includes('autorización') ||
          error.message.includes('no se puede eliminar')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al eliminar estudiante.' });
      }
    }
  }

  // CREAR CURSO
  async createCourse(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || typeof adminReq.user.activeOrganizationId !== 'number') {
        res.status(401).json({ error: 'Acceso no autorizado o la organización activa del administrador no está definida.' });
        return;
      }
  
      const courseData = {
        name: req.body.name,
        organizationId: adminReq.user.activeOrganizationId
      };
  
      const newCourse = await AdminCourseService.createCourse(courseData);
      res.status(201).json(newCourse);
  
    } catch (error: any) {
      console.error('Error creando curso:', error);
      if (error.message.includes('ya existe') || 
          error.message.includes('inválido') ||
          error.message.includes('requerido') ||
          error.message.includes('organización')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al crear curso.' });
      }
    }
  }
  
  // CREAR CURSOS MÁSIVOS
  async createCoursesBulk(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    if (!adminReq.file) {
      res.status(400).json({ error: 'No se proporcionó ningún archivo CSV.' });
      return;
    }
  
    try {
      if (!adminReq.user || typeof adminReq.user.activeOrganizationId !== 'number') {
        res.status(401).json({ error: 'Acceso no autorizado o la organización activa del administrador no está definida.' });
        return;
      }
  
      const selectedOrgId = adminReq.user.activeOrganizationId;
  
      const csvData = adminReq.file.buffer.toString('utf-8');
      const parseResult = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        delimiter: ",",
        transformHeader: header => header.trim(),
      });
  
      if (parseResult.errors.length > 0) {
        res.status(400).json({
          error: 'Error al parsear el archivo CSV de cursos.',
          details: parseResult.errors.map(e => ({ message: e.message, row: e.row }))
        });
        return;
      }
  
      const headerMapping: { [key: string]: string } = {
        'Nombre': 'name',
      };
  
      const coursesData = parseResult.data.map((row: any) => {
        const processedRow: { [key: string]: any } = {};
        for (const csvHeader in row) {
          if (Object.prototype.hasOwnProperty.call(row, csvHeader)) {
            const mappedKey = headerMapping[csvHeader.trim()] || csvHeader.trim().toLowerCase();
            processedRow[mappedKey] = row[csvHeader];
          }
        }
        return {
          name: processedRow.name, 
          organizationId: selectedOrgId 
        };
      });
  
      const results = await AdminCourseService.createCoursesBulk(coursesData, adminReq.user, selectedOrgId);
  
      res.status(207).json({
        message: 'Proceso de carga masiva de cursos completado.',
        results
      });
  
    } catch (error: any) {
      console.error('Error en la carga masiva de cursos:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error interno del servidor durante la carga masiva de cursos.' });
      }
    }
  }
  
  // OBTENER CURSOS
  async getCourses(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const search = req.query.search as string || '';
      const organizationId = req.query.organizationId ? parseInt(req.query.organizationId as string) : undefined;
  
      if (organizationId && !adminReq.user.adminOrganizations.some(org => org.id === organizationId)) {
        res.status(403).json({ error: 'No tiene permisos para ver cursos de esta organización.' });
        return;
      }
  
      const courses = await AdminCourseService.getCourses({
        page,
        limit,
        search,
        organizationId,
        adminOrganizations: adminReq.user.adminOrganizations
      });
  
      res.status(200).json(courses);
  
    } catch (error: any) {
      console.error('Error obteniendo cursos:', error);
      res.status(500).json({ error: 'Error interno del servidor al obtener cursos.' });
    }
  }
  
  // OBTENER CURSO POR ID
  async getCourse(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        res.status(400).json({ error: 'ID de curso inválido.' });
        return;
      }
  
      const course = await AdminCourseService.getCourse(courseId, adminReq.user.adminOrganizations);
      
      if (!course) {
        res.status(404).json({ error: 'Curso no encontrado.' });
        return;
      }
  
      res.status(200).json(course);
  
    } catch (error: any) {
      console.error('Error obteniendo curso:', error);
      if (error.message.includes('autorización')) {
        res.status(403).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al obtener curso.' });
      }
    }
  }
  
  // MODIFICAR CURSO
  async updateCourse(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        res.status(400).json({ error: 'ID de curso inválido.' });
        return;
      }
  
      const updateData = {
        name: req.body.name,
      };
  
      const updatedCourse = await AdminCourseService.updateCourse(courseId, updateData, adminReq.user);
      res.status(200).json(updatedCourse);
  
    } catch (error: any) {
      console.error('Error actualizando curso:', error);
      if (error.message.includes('no encontrado') || 
          error.message.includes('autorización') ||
          error.message.includes('ya existe')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al actualizar curso.' });
      }
    }
  }
  
  // ELIMINAR CURSO
  async deleteCourse(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    
    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado.' });
        return;
      }
  
      const courseId = parseInt(req.params.id);
      if (isNaN(courseId)) {
        res.status(400).json({ error: 'ID de curso inválido.' });
        return;
      }
  
      await AdminCourseService.deleteCourse(courseId, adminReq.user);
      res.status(200).json({ message: 'Curso eliminado exitosamente.' });
  
    } catch (error: any) {
      console.error('Error eliminando curso:', error);
      if (error.message.includes('no encontrado') || 
          error.message.includes('autorización') ||
          error.message.includes('estudiantes asignados')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al eliminar curso.' });
      }
    }
  }

}

export default new AdminController();