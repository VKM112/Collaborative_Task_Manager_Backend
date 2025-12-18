"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = createTask;
exports.updateTask = updateTask;
exports.deleteTask = deleteTask;
exports.getTaskById = getTaskById;
exports.listTasks = listTasks;
const errors_1 = require("../types/errors");
const prisma_1 = __importDefault(require("../config/prisma"));
const normalizeDueDate = (value) => {
    if (!value)
        return undefined;
    return typeof value === 'string' ? new Date(value) : value;
};
async function createTask(data) {
    return prisma_1.default.task.create({
        data: {
            title: data.title,
            priority: data.priority,
            status: data.status,
            creatorId: data.creatorId,
            teamId: data.teamId,
            assignedToId: data.assignedToId ?? data.creatorId,
            description: data.description,
            dueDate: normalizeDueDate(data.dueDate),
        },
        include: {
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            creator: {
                select: { id: true, name: true, email: true },
            },
            team: {
                select: { id: true, name: true },
            },
        },
    });
}
async function updateTask(id, data) {
    const normalizedData = {
        title: data.title,
        priority: data.priority,
        status: data.status,
        description: data.description,
        dueDate: data.dueDate ? normalizeDueDate(data.dueDate) : undefined,
        assignedToId: data.assignedToId ?? undefined,
    };
    return prisma_1.default.task.update({
        where: { id },
        data: normalizedData,
        include: {
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            creator: {
                select: { id: true, name: true, email: true },
            },
            team: {
                select: { id: true, name: true },
            },
        },
    });
}
async function deleteTask(id) {
    return prisma_1.default.task.delete({ where: { id } });
}
async function getTaskById(id) {
    return prisma_1.default.task.findUnique({
        where: { id },
        include: {
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            creator: {
                select: { id: true, name: true, email: true },
            },
            team: {
                select: { id: true, name: true },
            },
        },
    });
}
async function listTasks(filters) {
    if (!filters.teamId) {
        throw new errors_1.ApiError(400, 'Team id is required to list tasks.');
    }
    const where = {
        teamId: filters.teamId,
    };
    if (filters.status) {
        where.status = filters.status;
    }
    if (filters.priority) {
        where.priority = filters.priority;
    }
    if (filters.assignedToId) {
        where.assignedToId = filters.assignedToId;
    }
    if (filters.creatorId) {
        where.creatorId = filters.creatorId;
    }
    if (filters.overdue) {
        where.dueDate = { lt: new Date() };
    }
    const orderBy = filters.sortBy ?? 'dueDate';
    return prisma_1.default.task.findMany({
        where,
        orderBy: { [orderBy]: 'asc' },
        include: {
            assignedTo: {
                select: { id: true, name: true, email: true },
            },
            creator: {
                select: { id: true, name: true, email: true },
            },
            team: {
                select: { id: true, name: true },
            },
        },
    });
}
