import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createTaskHandler, deleteTaskHandler, listTasksHandler, updateTaskHandler } from '../controllers/task.controller'

const router = Router()

router.use(requireAuth)
router.get('/', listTasksHandler)
router.post('/', createTaskHandler)
router.put('/:id', updateTaskHandler)
router.delete('/:id', deleteTaskHandler)

export default router
