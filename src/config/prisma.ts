import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { loadEnv } from './loadEnv'

loadEnv()
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to configure Prisma')
}

let normalizedConnectionString = connectionString
let sslMode: string | null = null

try {
  const url = new URL(connectionString)
  sslMode = url.searchParams.get('sslmode')?.toLowerCase() ?? null
  const shouldStripSslMode =
    sslMode === 'require' || sslMode === 'prefer' || sslMode === 'no-verify'
  if (shouldStripSslMode) {
    url.searchParams.delete('sslmode')
    normalizedConnectionString = url.toString()
  }
} catch {
  // Keep the raw connection string if URL parsing fails.
}

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
  connectionString: normalizedConnectionString,
  ssl: sslRequested ? (sslStrict ? true : { rejectUnauthorized: false }) : undefined,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma
