import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { handleCorsOrigin } from './config/cors';

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: handleCorsOrigin,
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Socket connected', socket.id);

  socket.on('join', (userId: string) => {
    socket.join(`user-${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
