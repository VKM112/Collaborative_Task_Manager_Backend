import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { loadEnv } from './loadEnv'

loadEnv()
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to configure Prisma')
}

const sslModeMatch = connectionString.match(/(?:^|[?&])sslmode=([^&]+)/i)
const sslMode = sslModeMatch ? decodeURIComponent(sslModeMatch[1]).toLowerCase() : null

const sslEnv = process.env.DATABASE_SSL
const sslModeDisabled = sslMode === 'disable'
const sslModeRequested = Boolean(sslMode && !sslModeDisabled)
const isRender = Boolean(
  process.env.RENDER ||
    process.env.RENDER_SERVICE_ID ||
    process.env.RENDER_EXTERNAL_URL
)
const sslRequested =
  sslModeDisabled
    ? false
    : sslModeRequested
      ? true
    : sslEnv === 'true' || sslEnv === '1'
      ? true
      : sslEnv === 'false' || sslEnv === '0'
        ? false
        : process.env.NODE_ENV === 'production' || isRender
const sslStrict =
  process.env.DATABASE_SSL_STRICT === 'true' ||
  sslMode === 'verify-full' ||
  sslMode === 'verify-ca'

const pool = new Pool({
  connectionString,
  ssl: sslRequested
    ? sslStrict
      ? { rejectUnauthorized: true }
      : { rejectUnauthorized: false }
    : undefined,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma
