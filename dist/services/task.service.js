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
    const baseWhere = {};
    if (filters.status)
        baseWhere.status = filters.status;
    if (filters.priority)
        baseWhere.priority = filters.priority;
    if (filters.assignedToId)
        baseWhere.assignedToId = filters.assignedToId;
    if (filters.creatorId)
        baseWhere.creatorId = filters.creatorId;
    if (filters.overdue)
        baseWhere.dueDate = { lt: new Date() };
    const orderBy = filters.sortBy ?? 'dueDate';
    const scope = filters.scope ?? (filters.teamId ? 'team' : 'all');
    const memberships = await prisma_1.default.teamMember.findMany({
        where: { userId: filters.userId },
        select: { teamId: true },
    });
    const ownedTeams = await prisma_1.default.team.findMany({
        where: { createdById: filters.userId },
        select: { id: true },
    });
    const teamIds = Array.from(new Set([...memberships.map((member) => member.teamId), ...ownedTeams.map((team) => team.id)]));
    let scopeWhere;
    if (scope === 'personal') {
        scopeWhere = { teamId: null, creatorId: filters.userId };
    }
    else if (scope === 'team') {
        if (filters.teamId) {
            scopeWhere = { teamId: filters.teamId };
        }
        else if (teamIds.length) {
            scopeWhere = { teamId: { in: teamIds } };
        }
        else {
            return [];
        }
    }
    else {
        const orConditions = [
            { creatorId: filters.userId },
            { assignedToId: filters.userId },
        ];
        if (teamIds.length) {
            orConditions.unshift({ teamId: { in: teamIds } });
        }
        scopeWhere = { OR: orConditions };
    }
    return prisma_1.default.task.findMany({
        where: {
            AND: [baseWhere, scopeWhere],
        },
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
