import path from 'path'
import dotenv from 'dotenv'

export function loadEnv() {
  const shouldLoad =
    process.env.NODE_ENV !== 'production' || process.env.FORCE_DOTENV === 'true'

  if (!shouldLoad) {
    return
  }

  const envPath = path.resolve(process.cwd(), '.env')
  const { error } = dotenv.config({ path: envPath })

  if (!error) {
    return
  }

  const nodeError = error as NodeJS.ErrnoException
  if (nodeError.code === 'ENOENT') {
    return
  }

  throw error
}
