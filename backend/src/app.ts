import express from 'express';
import { SyncController } from './sync/sync.controller';

const app = express();

app.use(express.json());
app.use('/sync', SyncController);

// ... otras configuraciones

export default app;