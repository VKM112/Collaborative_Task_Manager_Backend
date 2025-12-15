import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { createToken } from '../utils/jwt.util';

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await registerUser(req.body);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await loginUser(req.body.email, req.body.password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const token = createToken({ id: user.id });
    res.json({ token });
  } catch (error) {
    next(error);
  }
}
