import { Router } from 'express'
import {
  registerHandler,
  loginHandler,
  googleLoginHandler,
  profileHandler,
  logoutHandler,
} from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { loginSchema, registerSchema } from '../validators/auth.validator'

const router = Router()

router.post('/register', validate(registerSchema), registerHandler)
router.post('/login', validate(loginSchema), loginHandler)
router.post('/google', googleLoginHandler)
router.post('/logout', logoutHandler)
router.get('/me', requireAuth, profileHandler)

export default router
