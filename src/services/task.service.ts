import prisma from '../config/prisma';

export async function createTask(data: { title: string; priority: string }) {
  return prisma.task.create({ data });
}

export async function listTasks() {
  return prisma.task.findMany();
}
