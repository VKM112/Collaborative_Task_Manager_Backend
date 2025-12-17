import path from 'path'
import dotenv from 'dotenv'

export function loadEnv() {
  const shouldLoad =
    process.env.NODE_ENV !== 'production' || process.env.FORCE_DOTENV === 'true'

  // Skip loading the local `.env` in production unless explicitly forced.

  if (!shouldLoad) {
    return
  }

  const envPath = path.resolve(process.cwd(), '.env')
  const { error } = dotenv.config({ path: envPath })

  if (error && error.code !== 'ENOENT') {
    throw error
  }
}
