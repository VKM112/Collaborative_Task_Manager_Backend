import jwt, { type Secret, type SignOptions } from 'jsonwebtoken'
import { Response } from 'express'
import { env } from '../config/env'

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'] }

export function createToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, signOptions)
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET)
}

const isProduction = process.env.NODE_ENV === 'production'
const isSecureCookie = isProduction || env.FRONTEND_URL.startsWith('https://')

export function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: isSecureCookie ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  })
}
