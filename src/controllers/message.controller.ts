import { NextFunction, Response } from 'express'
import type { AuthRequest } from '../middleware/auth.middleware'
import { ApiError } from '../types/errors'
import { socketEvents } from '../utils/events'
import {
  createTeamMessage,
  listTeamMessages,
} from '../services/message.service'
import { ensureTeamMembership } from '../services/team.service'

export async function listMessagesHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    const { teamId } = req.params
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }
    if (!teamId) {
      throw new ApiError(400, 'Team id is required.')
    }

    await ensureTeamMembership(userId, teamId)
    const messages = await listTeamMessages(teamId)
    res.json({ messages })
  } catch (error) {
    next(error)
  }
}

export async function createMessageHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    const { teamId } = req.params
    const { content } = req.body
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }
    if (!teamId) {
      throw new ApiError(400, 'Team id is required.')
    }
    if (!content || !content.trim()) {
      throw new ApiError(400, 'Message cannot be empty.')
    }

    await ensureTeamMembership(userId, teamId)
    const message = await createTeamMessage({
      content,
      teamId,
      senderId: userId,
    })

    socketEvents.emit('team:message', { teamId, message })
    res.json({ message })
  } catch (error) {
    next(error)
  }
}
