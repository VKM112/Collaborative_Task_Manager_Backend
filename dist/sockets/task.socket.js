"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTaskSocket = registerTaskSocket;
function registerTaskSocket(io) {
    io.on('connection', (socket) => {
        socket.on('join-room', (room) => {
            socket.join(room);
        });
        socket.on('task:update', (data) => {
            io.to(data.room).emit('task:updated', data.task);
        });
    });
}
