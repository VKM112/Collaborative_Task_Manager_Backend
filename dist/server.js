"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const cors_1 = require("./config/cors");
const PORT = process.env.PORT || 5000;
const server = http_1.default.createServer(app_1.default);
exports.io = new socket_io_1.Server(server, {
    cors: {
        origin: cors_1.handleCorsOrigin,
        credentials: true,
    },
});
exports.io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);
    socket.on('join', (userId) => {
        socket.join(`user-${userId}`);
    });
    socket.on('disconnect', () => {
        console.log('Socket disconnected', socket.id);
    });
});
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
