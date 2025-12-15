import { Express } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';

export function registerRoutes(app: Express) {
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/tasks', taskRoutes);
}
