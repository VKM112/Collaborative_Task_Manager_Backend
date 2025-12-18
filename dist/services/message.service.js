"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTeamMessages = listTeamMessages;
exports.createTeamMessage = createTeamMessage;
const prisma_1 = __importDefault(require("../config/prisma"));
async function listTeamMessages(teamId) {
    return prisma_1.default.message.findMany({
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
    });
}
async function createTeamMessage(data) {
    return prisma_1.default.message.create({
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
    });
}
