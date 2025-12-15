import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (!req.headers.authorization) {
    return next(new Error('Missing authorization token'));
  }
  // Add real JWT validation logic here later
  req.user = { id: 'placeholder' } as any;
  next();
}
