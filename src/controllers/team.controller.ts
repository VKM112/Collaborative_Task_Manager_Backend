import { NextFunction, Response } from 'express'
import type { MembershipRole } from '@prisma/client'
import type { AuthRequest } from '../middleware/auth.middleware'
import { ApiError } from '../types/errors'
import {
  countTeamOwners,
  createTeam,
  deleteTeam,
  ensureTeamMembership,
  ensureTeamRole,
  getTeamById,
  getTeamMember,
  joinTeam,
  leaveTeam,
  listTeamMembers,
  listTeamsForUser,
  removeTeamMember,
  updateTeam,
} from '../services/team.service'

export async function listTeamsHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }

    const teams = await listTeamsForUser(userId)
    res.json({ teams })
  } catch (error) {
    next(error)
  }
}

export async function getTeamHandler(req: AuthRequest, res: Response, next: NextFunction) {
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
    const team = await getTeamById(teamId)
    if (!team) {
      throw new ApiError(404, 'Team not found.')
    }
    res.json({ team })
  } catch (error) {
    next(error)
  }
}

export async function createTeamHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }

    const team = await createTeam({
      createdById: userId,
      name: req.body.name,
      description: req.body.description,
    })
    res.json({ team })
  } catch (error) {
    next(error)
  }
}

export async function updateTeamHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    const { teamId } = req.params
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }
    if (!teamId) {
      throw new ApiError(400, 'Team id is required.')
    }

    await ensureTeamRole(userId, teamId, [MembershipRole.ADMIN, MembershipRole.OWNER])
    const team = await updateTeam(teamId, {
      name: req.body.name,
      description: req.body.description,
    })
    res.json({ team })
  } catch (error) {
    next(error)
  }
}

export async function deleteTeamHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    const { teamId } = req.params
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }
    if (!teamId) {
      throw new ApiError(400, 'Team id is required.')
    }

    await ensureTeamRole(userId, teamId, [MembershipRole.OWNER])
    await deleteTeam(teamId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function joinTeamHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }

    const team = await joinTeam({
      userId,
      teamId: req.body.teamId,
      inviteCode: req.body.inviteCode,
    })

    const hydrated = await getTeamById(team.id)
    if (!hydrated) {
      throw new ApiError(404, 'Team not found after joining.')
    }
    res.json({ team: hydrated })
  } catch (error) {
    next(error)
  }
}

export async function leaveTeamHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    const { teamId } = req.params
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }
    if (!teamId) {
      throw new ApiError(400, 'Team id is required.')
    }

    await leaveTeam(teamId, userId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}

export async function listMembersHandler(req: AuthRequest, res: Response, next: NextFunction) {
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
    const members = await listTeamMembers(teamId)
    res.json({ members })
  } catch (error) {
    next(error)
  }
}

export async function removeMemberHandler(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id
    const { teamId, memberId } = req.params
    if (!userId) {
      throw new ApiError(401, 'Unauthorized')
    }
    if (!teamId || !memberId) {
      throw new ApiError(400, 'Team id and member id are required.')
    }

    const membership = await ensureTeamRole(userId, teamId, [MembershipRole.ADMIN, MembershipRole.OWNER])
    if (!membership) {
      throw new ApiError(403, 'Membership required.')
    }

    if (membership.userId === memberId) {
      throw new ApiError(400, 'Use the leave endpoint to remove yourself.')
    }

    const target = await getTeamMember(teamId, memberId)
    if (!target) {
      throw new ApiError(404, 'Member not found.')
    }

    if (target.role === 'OWNER') {
      const ownerCount = await countTeamOwners(teamId)
      if (ownerCount <= 1) {
        throw new ApiError(400, 'Transfer ownership before removing the last owner.')
      }
    }

    await removeTeamMember(teamId, memberId)
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
}
