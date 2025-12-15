"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
exports.listTasks = listTasks;
const prisma_1 = __importDefault(require("../config/prisma"));
async function createTask(data) {
    return prisma_1.default.task.create({ data });
}
async function listTasks() {
    return prisma_1.default.task.findMany();
}
