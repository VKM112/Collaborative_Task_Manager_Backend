import { env } from './env'

const renderFrontendPattern =
  /^https:\/\/collaborative-task-manager-frontend(-[A-Za-z0-9]+)?\.onrender\.com$/

const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'https://taskflowmanagervkm.netlify.app',
    env.FRONTEND_URL,
  ].filter(Boolean)
)

export function isAllowedOrigin(origin?: string) {
  if (!origin) {
    return true
  }

  if (allowedOrigins.has(origin)) {
    return true
  }

  return renderFrontendPattern.test(origin)
}

export function handleCorsOrigin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  if (isAllowedOrigin(origin)) {
    return callback(null, true)
  }

  callback(new Error('Not allowed by CORS'))
}
