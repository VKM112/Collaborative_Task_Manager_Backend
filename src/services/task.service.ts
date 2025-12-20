import type { Prisma } from '@prisma/client'
import prisma from '../config/prisma'

type TaskScope = 'team' | 'personal' | 'all'

type TaskFilters = {
  userId: string
  teamId?: string
  scope?: TaskScope
  status?: string
  priority?: string
  assignedToId?: string
  creatorId?: string
  overdue?: boolean
  sortBy?: 'dueDate' | 'createdAt'
}

const normalizeDueDate = (value?: Date | string) => {
  if (!value) return undefined
  return typeof value === 'string' ? new Date(value) : value
}

export async function createTask(data: {
  title: string
  priority: string
  status: string
  creatorId: string
  teamId?: string
  description?: string
  dueDate?: Date | string
  assignedToId?: string
}) {
  return prisma.task.create({
    data: {
      title: data.title,
      priority: data.priority,
      status: data.status,
      creatorId: data.creatorId,
      teamId: data.teamId,
      assignedToId: data.assignedToId ?? data.creatorId,
      description: data.description,
      dueDate: normalizeDueDate(data.dueDate),
    },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      creator: {
        select: { id: true, name: true, email: true },
      },
      team: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function updateTask(id: string, data: {
  title?: string
  priority?: string
  status?: string
  description?: string
  dueDate?: Date | string
  assignedToId?: string | null
}) {
  const normalizedData: Prisma.TaskUncheckedUpdateInput = {
    title: data.title,
    priority: data.priority,
    status: data.status,
    description: data.description,
    dueDate: data.dueDate ? normalizeDueDate(data.dueDate) : undefined,
    assignedToId: data.assignedToId ?? undefined,
  }

  return prisma.task.update({
    where: { id },
    data: normalizedData,
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      creator: {
        select: { id: true, name: true, email: true },
      },
      team: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function deleteTask(id: string) {
  return prisma.task.delete({ where: { id } })
}

export async function getTaskById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      creator: {
        select: { id: true, name: true, email: true },
      },
      team: {
        select: { id: true, name: true },
      },
    },
  })
}

export async function listTasks(filters: TaskFilters) {
  const baseWhere: Prisma.TaskWhereInput = {}

  if (filters.status) baseWhere.status = filters.status
  if (filters.priority) baseWhere.priority = filters.priority
  if (filters.assignedToId) baseWhere.assignedToId = filters.assignedToId
  if (filters.creatorId) baseWhere.creatorId = filters.creatorId
  if (filters.overdue) baseWhere.dueDate = { lt: new Date() }

  const orderBy = filters.sortBy ?? 'dueDate'
  const scope = filters.scope ?? (filters.teamId ? 'team' : 'all')

  const memberships = await prisma.teamMember.findMany({
    where: { userId: filters.userId },
    select: { teamId: true },
  })
  const ownedTeams = await prisma.team.findMany({
    where: { createdById: filters.userId },
    select: { id: true },
  })
  const teamIds = Array.from(
    new Set([...memberships.map((member) => member.teamId), ...ownedTeams.map((team) => team.id)]),
  )

  let scopeWhere: Prisma.TaskWhereInput
  if (scope === 'personal') {
    scopeWhere = { teamId: null, creatorId: filters.userId }
  } else if (scope === 'team') {
    if (filters.teamId) {
      scopeWhere = { teamId: filters.teamId }
    } else if (teamIds.length) {
      scopeWhere = { teamId: { in: teamIds } }
    } else {
      return []
    }
  } else {
    const orConditions: Prisma.TaskWhereInput[] = [
      { creatorId: filters.userId },
      { assignedToId: filters.userId },
    ]
    if (teamIds.length) {
      orConditions.unshift({ teamId: { in: teamIds } })
    }
    scopeWhere = { OR: orConditions }
  }

  return prisma.task.findMany({
    where: {
      AND: [baseWhere, scopeWhere],
    },
    orderBy: { [orderBy]: 'asc' },
    include: {
      assignedTo: {
        select: { id: true, name: true, email: true },
      },
      creator: {
        select: { id: true, name: true, email: true },
      },
      team: {
        select: { id: true, name: true },
      },
    },
  })
}
