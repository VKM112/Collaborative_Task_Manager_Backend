import { NextFunction, Response } from 'express'
import { AuthRequest } from '../middleware/auth.middleware'
import {
  loginUser,
  registerUser,
  loginWithGoogle,
  getUserById,
} from '../services/auth.service'
import { createToken, setAuthCookie } from '../utils/jwt.util'

type AuthUser = Awaited<ReturnType<typeof registerUser>>

const handleAuthSuccess = (res: Response, user: AuthUser) => {
  const token = createToken({ userId: user.id })
  setAuthCookie(res, token)
  return res.json({ user })
}

export async function registerHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await registerUser(req.body)
    return handleAuthSuccess(res, user)
  } catch (error) {
    next(error)
  }
}

export async function loginHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await loginUser(req.body.email, req.body.password)
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })
    return handleAuthSuccess(res, user)
  } catch (error) {
    next(error)
  }
}

export async function googleLoginHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await loginWithGoogle(req.body.idToken)
    return handleAuthSuccess(res, user)
  } catch (error) {
    next(error)
  }
}

export async function profileHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    const user = await getUserById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json({ user })
  } catch (error) {
    next(error)
  }
}

export function logoutHandler(_req: AuthRequest, res: Response) {
  res.clearCookie('token', { path: '/' })
  res.json({ success: true })
}
