import { Request, Response, NextFunction } from 'express';
import AdminUserService, { UserCreationRequestData }from '../services/admin.user.service';
import AdminStudentService, { CreateStudentData, RawStudentDataBulk } from '../services/admin.student.service';
import { AuthenticatedAdminRequest, AuthenticatedAdminUser } from '../middlewares/admin.auth.middleware'; 
import { matchedData } from 'express-validator'; 
import Papa from 'papaparse';

export class AdminController {
  
  // CREAR USUARIO
  async createUser(req: Request, res: Response): Promise<void> {
    const adminReq = req as AuthenticatedAdminRequest;
    const validatedData = req.body;

    console.log('--- AdminController.createUser ---');
    console.log('Raw req.body:', JSON.stringify(req.body, null, 2));

    try {
      if (!adminReq.user || !adminReq.user.adminOrganizations) {
        res.status(401).json({ error: 'Acceso no autorizado o información de administrador/organizaciones no disponible.' });
        return;
      }
      
      const userPayload: UserCreationRequestData = {
        rut: validatedData.rut,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone,
        password: validatedData.password,
        roleName: validatedData.roleName,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : true,
        organizationId: validatedData.organizationId ? parseInt(String(validatedData.organizationId), 10) : undefined,
      };

      console.log('User payload a enviar al servicio:', JSON.stringify(userPayload, null, 2)); // Mantener

      const newUser = await AdminUserService.createUser(userPayload, adminReq.user);

      console.log('--- AdminController: VALOR DE newUser ANTES DE res.json ---');
      console.log(JSON.stringify(newUser, null, 2));
          
      try {
          const newUserJson = JSON.stringify(newUser);
          res.setHeader('Content-Type', 'application/json');
          res.status(201).send(newUserJson); 
      } catch (serializationError: any) {
          console.error('--- ERROR SERIALIZING newUser ---', serializationError);
          if (!res.headersSent) {
               res.status(500).json({ error: 'Error serializing user data for response.' });
          }
      }

    } catch (error: any) {
      console.error('--- AdminController CATCH BLOCK ---');
      console.error('Error Type:', typeof error);
      console.error('Is Error Instance:', error instanceof Error);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      console.error('Headers Sent Before Catch?:', res.headersSent);

      if (res.headersSent) {
        console.error('Headers were already sent. Cannot send new error response.');
        return; 
      }
      
      if (error.message && (error.message.includes('ya está registrado') ||
          error.message.includes('no encontrado') ||
          error.message.includes('organización') ||
          error.message.includes('RUT') || 
          error.message.includes('Rol') ||
          error.message.toLowerCase().includes("debe especificar un 'organizationid'") ||
          error.message.toLowerCase().includes("rut 'undefined'") 
         )) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al crear el usuario.' });
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
 
  // MODIFICAR USUARIO
  
  // OBTENER USUARIOS

  // OBTENER USUARIO

  // ELIMINAR USUARIO

  // DESACTIVAR USUARIO

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

  // OBTENER ESTUDIANTE

  // MODIFICAR ESTUDIANTE

  // ELIMINAR ESTUDIANTE

  // CREAR CURSO

  // CREAR CURSOS MÁSIVOS

  // OBTENER CURSOS

  // OBTENER CURSO

  // MODIFICAR CURSO

  // ELIMINAR CURSO

}

export default new AdminController();