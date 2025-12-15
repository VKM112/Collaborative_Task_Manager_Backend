import http from 'node:http';
import { Server as SocketServer } from 'socket.io';
import app from './app';
import { registerTaskSocket } from './sockets/task.socket';
import { env } from './config/env';

const server = http.createServer(app);
const io = new SocketServer(server, { cors: { origin: '*' } });

registerTaskSocket(io);

const port = Number(env.port()) || 5000;

server.listen(port, () => {
  console.log(Server listening on port );
});
