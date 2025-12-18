import prisma from '../config/prisma'

export async function listTeamMessages(teamId: string) {
  return prisma.message.findMany({
    where: { teamId },
    orderBy: { createdAt: 'asc' },
    include: {
      sender: {
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

export async function createTeamMessage(data: {
  content: string
  teamId: string
  senderId: string
}) {
  return prisma.message.create({
    data: {
      content: data.content.trim(),
      teamId: data.teamId,
      senderId: data.senderId,
    },
    include: {
      sender: {
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
