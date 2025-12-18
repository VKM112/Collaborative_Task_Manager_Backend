"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTeamSocket = registerTeamSocket;
function registerTeamSocket(io) {
    io.on('connection', (socket) => {
        socket.on('join-team', (teamId) => {
            socket.join(`team-${teamId}`);
        });
        socket.on('leave-team', (teamId) => {
            socket.leave(`team-${teamId}`);
        });
    });
}
