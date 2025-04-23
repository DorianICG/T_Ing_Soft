import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { User } from '../models/user.entity';

export class SyncService {
  static async pullChanges(req: Request, res: Response) {
    try {
      const { lastPulledAt } = req.body;
      
      // Obtener cambios desde la última sincronización
      const changes = {
        users: {
          created: await getRepository(User).find({
            where: `"last_updated_at" > to_timestamp(${lastPulledAt / 1000})`,
          }),
          updated: [],
          deleted: [],
        },
        // Agrega otras tablas según tu esquema
      };

      res.json({
        changes,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Pull error:', error);
      res.status(500).json({ error: 'Sync failed' });
    }
  }

  static async pushChanges(req: Request, res: Response) {
    try {
      const { changes, lastPulledAt } = req.body;
      
      // Procesar cambios del cliente
      for (const [tableName, { created, updated, deleted }] of Object.entries(changes)) {
        const repo = getRepository(tableName);
        
        if (created && created.length > 0) {
          await repo.save(created);
        }
        
        if (updated && updated.length > 0) {
          await repo.save(updated);
        }
        
        if (deleted && deleted.length > 0) {
          await repo.delete(deleted.map((item: any) => item.id));
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Push error:', error);
      res.status(500).json({ error: 'Sync failed' });
    }
  }
}