import { Request, Response, NextFunction } from 'express';
import AdminUserService from '../services/admin.user.service';
import AdminStudentService from '../services/admin.student.service';
import { AuthenticatedAdminRequest, AuthenticatedAdminUser } from '../middlewares/admin.auth.middleware'; 
import { matchedData } from 'express-validator'; 
import Papa from 'papaparse';

export class AdminController {
  
  async createUser(req: Request, res: Response): Promise<void> { 
    const adminReq = req as AuthenticatedAdminRequest; 

    try {
      if (!adminReq.user) { 
        res.status(401).json({ error: 'Acceso no autorizado o información de administrador no disponible.' });
        return;
      }
      const user = await AdminUserService.createUser(adminReq.body, adminReq.user);
      res.status(201).json(user);
    } catch (error: any) {
      console.error('Error creando usuario:', error);
      if (error.message.includes('ya está registrado') || 
          error.message.includes('no encontrado') ||
          error.message.includes('organización') || 
          error.message.includes('RUT') || 
          error.message.includes('Rol') 
         ) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Error interno del servidor al crear usuario.' });
      }
    }
  }

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
 

}

export default new AdminController();