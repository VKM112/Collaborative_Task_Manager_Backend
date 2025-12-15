import prisma from '../config/prisma'

export async function createTask(data: {
  title: string
  priority: string
  status: string
  creatorId: string
  description?: string
  dueDate?: Date
  assignedToId?: string
}) {
  return prisma.task.create({ data })
}

export async function listTasks() {
  return prisma.task.findMany()
}
