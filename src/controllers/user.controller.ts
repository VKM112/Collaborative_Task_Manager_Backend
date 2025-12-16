import { Request, Response, NextFunction } from 'express';
import { listUsers } from '../services/user.service';

export async function listUsersHandler(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
}
