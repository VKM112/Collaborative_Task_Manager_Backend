import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import prisma from '../config/prisma'
import { hashPassword, comparePassword } from '../utils/password.util'
import { ApiError } from '../types/errors'

async function verifyGoogleToken(idToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('Missing Google client ID')
  }

  const client = new OAuth2Client(clientId)
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId,
  })

  const payload = ticket.getPayload()
  if (!payload || !payload.email || !payload.sub) {
    throw new Error('Failed to verify Google token')
  }

  return {
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    avatar: payload.picture ?? null,
    googleId: payload.sub,
  }
}

export async function registerUser(data: { name: string; email: string; password: string }) {
  const hashed = await hashPassword(data.password)
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    throw new ApiError(409, 'Email already registered')
  }
  return prisma.user.create({
    data: {
      ...data,
      password: hashed,
      provider: 'local',
    },
  })
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const match = await comparePassword(password, user.password)
  return match ? user : null
}

export async function loginWithGoogle(idToken: string) {
  const profile = await verifyGoogleToken(idToken)
  const hashed = await hashPassword(crypto.randomBytes(32).toString('hex'))

  return prisma.user.upsert({
    where: { email: profile.email },
    update: {
      name: profile.name,
      avatar: profile.avatar,
      googleId: profile.googleId,
      provider: 'google',
    },
    create: {
      name: profile.name,
      email: profile.email,
      password: hashed,
      avatar: profile.avatar,
      googleId: profile.googleId,
      provider: 'google',
    },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}
