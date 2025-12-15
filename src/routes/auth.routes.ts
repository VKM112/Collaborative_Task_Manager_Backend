import { Router } from 'express'
import {
  registerHandler,
  loginHandler,
  googleLoginHandler,
  profileHandler,
  logoutHandler,
} from '../controllers/auth.controller'
import { requireAuth } from '../middleware/auth.middleware'

const router = Router()

router.post('/register', registerHandler)
router.post('/login', loginHandler)
router.post('/google', googleLoginHandler)
router.post('/logout', logoutHandler)
router.get('/me', requireAuth, profileHandler)

export default router
