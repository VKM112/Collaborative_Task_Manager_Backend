import crypto from 'crypto'
import type { MembershipRole } from '@prisma/client'
import prisma from '../config/prisma'
import { ApiError } from '../types/errors'

const ROLE_PRIORITY: Record<MembershipRole, number> = {
  MEMBER: 0,
  ADMIN: 1,
  OWNER: 2,
}

async function createUniqueInviteCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const next = crypto.randomBytes(3).toString('hex').toUpperCase()
    const existing = await prisma.team.findUnique({ where: { inviteCode: next } })
    if (!existing) {
      return next
    }
  }
  throw new ApiError(500, 'Unable to generate a unique invite code. Try again.')
}

export async function listTeamsForUser(userId: string) {
  return prisma.team.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })
}

export async function getTeamById(teamId: string) {
  return prisma.team.findUnique({
    where: { id: teamId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          role: 'desc',
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

export async function getTeamMember(teamId: string, userId: string) {
  return prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
  })
}

export async function ensureTeamMembership(userId: string, teamId: string) {
  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId,
        userId,
      },
    },
  })

  if (!membership) {
    throw new ApiError(403, 'You must be a member of this team.')
  }

  return membership
}

export async function ensureTeamRole(
  userId: string,
  teamId: string,
  requiredRoles: MembershipRole[],
) {
  const membership = await ensureTeamMembership(userId, teamId)
  const hasPermission = requiredRoles.some((role) => membership.role === role)
  if (!hasPermission) {
    throw new ApiError(403, 'You need additional permissions for that action.')
  }
  return membership
}

export async function createTeam(data: {
  name: string
  description?: string | null
  createdById: string
}) {
  const inviteCode = await createUniqueInviteCode()
  return prisma.team.create({
    data: {
      name: data.name.trim(),
      description: data.description?.trim(),
      inviteCode,
      createdById: data.createdById,
      members: {
        create: {
          userId: data.createdById,
          role: 'OWNER',
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  })
}

export async function updateTeam(teamId: string, data: { name?: string; description?: string | null }) {
  return prisma.team.update({
    where: { id: teamId },
    data: {
      name: data.name?.trim(),
      description: data.description?.trim(),
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  })
}

export async function deleteTeam(teamId: string) {
  return prisma.$transaction([
    prisma.task.deleteMany({ where: { teamId } }),
    prisma.message.deleteMany({ where: { teamId } }),
    prisma.teamMember.deleteMany({ where: { teamId } }),
    prisma.team.delete({ where: { id: teamId } }),
  ])
}

export async function listTeamMembers(teamId: string) {
  return prisma.teamMember.findMany({
    where: { teamId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      role: 'desc',
    },
  })
}

export async function removeTeamMember(teamId: string, memberId: string) {
  return prisma.teamMember.delete({
    where: {
      teamId_userId: {
        teamId,
        userId: memberId,
      },
    },
  })
}

export async function joinTeam({
  userId,
  teamId,
  inviteCode,
}: {
  userId: string
  teamId?: string
  inviteCode?: string
}) {
  if (!teamId && !inviteCode) {
    throw new ApiError(400, 'Team identifier or invite code is required.')
  }

  const team = teamId
    ? await prisma.team.findUnique({ where: { id: teamId } })
    : await prisma.team.findUnique({ where: { inviteCode } })

  if (!team) {
    throw new ApiError(404, 'Team not found.')
  }

  if (inviteCode && team.inviteCode !== inviteCode) {
    throw new ApiError(400, 'Invalid invite code.')
  }

  const membership = await prisma.teamMember.findUnique({
    where: {
      teamId_userId: {
        teamId: team.id,
        userId,
      },
    },
  })

  if (membership) {
    return team
  }

  await prisma.teamMember.create({
    data: {
      teamId: team.id,
      userId,
    },
  })

  return team
}

export async function leaveTeam(teamId: string, userId: string) {
  const membership = await ensureTeamMembership(userId, teamId)
  if (membership.role === 'OWNER') {
    const ownerCount = await prisma.teamMember.count({
      where: {
        teamId,
        role: 'OWNER',
      },
    })
    if (ownerCount <= 1) {
      throw new ApiError(400, 'Transfer ownership before leaving this team.')
    }
  }
  return removeTeamMember(teamId, userId)
}

export async function countTeamOwners(teamId: string) {
  return prisma.teamMember.count({
    where: {
      teamId,
      role: 'OWNER',
    },
  })
}

export function canManageMembership(role: MembershipRole) {
  return role === 'ADMIN' || role === 'OWNER'
}

export function isOwner(role: MembershipRole) {
  return role === 'OWNER'
}

export function isRoleAtLeast(current: MembershipRole, required: MembershipRole) {
  return ROLE_PRIORITY[current] >= ROLE_PRIORITY[required]
}
