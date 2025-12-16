import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { listUsersHandler } from '../controllers/user.controller'

const router = Router()

router.use(requireAuth)
router.get('/', listUsersHandler)

export default router
