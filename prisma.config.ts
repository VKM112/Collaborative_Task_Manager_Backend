import { loadEnv } from './src/config/loadEnv'
loadEnv()

import { defineConfig, env } from '@prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL'),        // <- just the URL
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'), // optional
  },
})
