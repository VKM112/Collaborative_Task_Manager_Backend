import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { loadEnv } from './loadEnv'

loadEnv()
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is required to configure Prisma')
}

const sslEnv = process.env.DATABASE_SSL
const sslRequested =
  sslEnv === 'true' || sslEnv === '1'
    ? true
    : sslEnv === 'false' || sslEnv === '0'
      ? false
      : process.env.NODE_ENV === 'production'
const sslInConnectionString = /[?&]ssl(mode)?=/i.test(connectionString)

const pool = new Pool({
  connectionString,
  ssl: sslRequested && !sslInConnectionString ? { rejectUnauthorized: false } : undefined,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

export default prisma
