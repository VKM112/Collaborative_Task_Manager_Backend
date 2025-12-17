"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsers = listUsers;
const prisma_1 = __importDefault(require("../config/prisma"));
async function listUsers() {
    return prisma_1.default.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
        },
    });
}
