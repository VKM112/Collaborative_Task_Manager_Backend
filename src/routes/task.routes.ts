import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { createTaskHandler, listTasksHandler } from '../controllers/task.controller';

const router = Router();

router.use(authMiddleware);
router.get('/', listTasksHandler);
router.post('/', createTaskHandler);

export default router;
