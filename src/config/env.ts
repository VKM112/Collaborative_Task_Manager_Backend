import 'dotenv/config'

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET', 'PORT', 'GOOGLE_CLIENT_ID'] as const

type EnvKey = (typeof requiredEnv)[number]

function getEnv(key: EnvKey) {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env: Record<EnvKey, string> = {
  DATABASE_URL: getEnv('DATABASE_URL'),
  JWT_SECRET: getEnv('JWT_SECRET'),
  PORT: getEnv('PORT'),
  GOOGLE_CLIENT_ID: getEnv('GOOGLE_CLIENT_ID'),
}
