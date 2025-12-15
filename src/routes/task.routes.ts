import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createTaskHandler, listTasksHandler } from '../controllers/task.controller'

const router = Router()

router.use(requireAuth)
router.get('/', listTasksHandler)
router.post('/', createTaskHandler)

export default router
