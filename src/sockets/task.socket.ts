import { Server, Socket } from 'socket.io';

export function registerTaskSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    socket.on('join-room', (room: string) => {
      socket.join(room);
    });

    socket.on('task:update', (data) => {
      io.to(data.room).emit('task:updated', data.task);
    });
  });
}
