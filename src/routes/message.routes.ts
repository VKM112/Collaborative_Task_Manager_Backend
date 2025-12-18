import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { createMessageHandler, listMessagesHandler } from '../controllers/message.controller'
import { validate } from '../middleware/validate.middleware'
import { messageSchema } from '../validators/message.validator'

const router = Router({ mergeParams: true })

router.use(requireAuth)
router.get('/', listMessagesHandler)
router.post('/', validate(messageSchema), createMessageHandler)

export default router
