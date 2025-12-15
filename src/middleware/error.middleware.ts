import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../types/errors';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ message });
}
