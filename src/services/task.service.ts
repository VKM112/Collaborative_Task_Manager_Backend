import type { Prisma } from '@prisma/client'
import { ApiError } from '../types/errors'
import prisma from '../config/prisma'

type TaskFilters = {
  teamId: string
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
  teamId: string
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
  if (!filters.teamId) {
    throw new ApiError(400, 'Team id is required to list tasks.')
  }

  const where: Prisma.TaskWhereInput = {
    teamId: filters.teamId,
  }

  if (filters.status) {
    where.status = filters.status
  }
  if (filters.priority) {
    where.priority = filters.priority
  }
  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId
  }
  if (filters.creatorId) {
    where.creatorId = filters.creatorId
  }
  if (filters.overdue) {
    where.dueDate = { lt: new Date() }
  }

  const orderBy = filters.sortBy ?? 'dueDate'

  return prisma.task.findMany({
    where,
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
