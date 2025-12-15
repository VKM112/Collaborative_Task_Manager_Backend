import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const secret = env.jwtSecret();

export function createToken(payload: object) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret);
}
