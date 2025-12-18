import { Server, Socket } from 'socket.io'

export function registerTeamSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on('join-team', (teamId: string) => {
      socket.join(`team-${teamId}`)
    })

    socket.on('leave-team', (teamId: string) => {
      socket.leave(`team-${teamId}`)
    })
  })
}
