"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskHandler = createTaskHandler;
exports.listTasksHandler = listTasksHandler;
exports.updateTaskHandler = updateTaskHandler;
exports.deleteTaskHandler = deleteTaskHandler;
const errors_1 = require("../types/errors");
const task_service_1 = require("../services/task.service");
const team_service_1 = require("../services/team.service");
async function createTaskHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        const { teamId } = req.body;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Missing user context.');
        }
        if (!teamId || typeof teamId !== 'string') {
            throw new errors_1.ApiError(400, 'Team id is required when creating a task.');
        }
        await (0, team_service_1.ensureTeamMembership)(userId, teamId);
        const task = await (0, task_service_1.createTask)({
            ...req.body,
            creatorId: userId,
            teamId,
        });
        res.json(task);
    }
    catch (error) {
        next(error);
    }
}
async function listTasksHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        const { status, priority, assignedToId, creatorId, sortBy, overdue, teamId } = req.query;
        const parsedOverdue = overdue === 'true';
        if (!teamId || typeof teamId !== 'string') {
            throw new errors_1.ApiError(400, 'Team id is required to fetch tasks.');
        }
        if (!userId) {
            throw new errors_1.ApiError(401, 'Missing user context.');
        }
        await (0, team_service_1.ensureTeamMembership)(userId, teamId);
        const tasks = await (0, task_service_1.listTasks)({
            teamId,
            status: status,
            priority: priority,
            assignedToId: assignedToId,
            creatorId: creatorId,
            sortBy: sortBy === 'createdAt' ? 'createdAt' : 'dueDate',
            overdue: parsedOverdue,
        });
        res.json(tasks);
    }
    catch (error) {
        next(error);
    }
}
async function updateTaskHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Missing user context.');
        }
        const { id } = req.params;
        const task = await (0, task_service_1.getTaskById)(id);
        if (!task) {
            throw new errors_1.ApiError(404, 'Task not found.');
        }
        const taskTeamId = task.teamId;
        if (!taskTeamId) {
            throw new errors_1.ApiError(500, 'Task missing team context.');
        }
        await (0, team_service_1.ensureTeamMembership)(userId, taskTeamId);
        const { teamId, ...body } = req.body;
        const updatedTask = await (0, task_service_1.updateTask)(id, body);
        res.json(updatedTask);
    }
    catch (error) {
        next(error);
    }
}
async function deleteTaskHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new errors_1.ApiError(401, 'Missing user context.');
        }
        const { id } = req.params;
        const task = await (0, task_service_1.getTaskById)(id);
        if (!task) {
            throw new errors_1.ApiError(404, 'Task not found.');
        }
        const taskTeamId = task.teamId;
        if (!taskTeamId) {
            throw new errors_1.ApiError(500, 'Task missing team context.');
        }
        await (0, team_service_1.ensureTeamMembership)(userId, taskTeamId);
        const deleted = await (0, task_service_1.deleteTask)(id);
        res.json(deleted);
    }
    catch (error) {
        next(error);
    }
}
