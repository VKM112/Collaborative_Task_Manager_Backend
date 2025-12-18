import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import {
  createTeamHandler,
  deleteTeamHandler,
  getTeamHandler,
  joinTeamHandler,
  leaveTeamHandler,
  listMembersHandler,
  listTeamsHandler,
  removeMemberHandler,
  updateTeamHandler,
} from '../controllers/team.controller'
import { validate } from '../middleware/validate.middleware'
import { createTeamSchema, joinTeamSchema, updateTeamSchema } from '../validators/team.validator'
import messageRoutes from './message.routes'

const router = Router()

router.use(requireAuth)

router.get('/', listTeamsHandler)
router.post('/', validate(createTeamSchema), createTeamHandler)
router.get('/:teamId', getTeamHandler)
router.put('/:teamId', validate(updateTeamSchema), updateTeamHandler)
router.delete('/:teamId', deleteTeamHandler)

router.post('/join', validate(joinTeamSchema), joinTeamHandler)
router.post('/:teamId/leave', leaveTeamHandler)

router.get('/:teamId/members', listMembersHandler)
router.delete('/:teamId/members/:memberId', removeMemberHandler)

router.use('/:teamId/messages', messageRoutes)

export default router
