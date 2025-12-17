"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskHandler = createTaskHandler;
exports.listTasksHandler = listTasksHandler;
exports.updateTaskHandler = updateTaskHandler;
exports.deleteTaskHandler = deleteTaskHandler;
const task_service_1 = require("../services/task.service");
async function createTaskHandler(req, res, next) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Missing user context' });
        }
        const task = await (0, task_service_1.createTask)({
            ...req.body,
            creatorId: userId,
        });
        res.json(task);
    }
    catch (error) {
        next(error);
    }
}
async function listTasksHandler(req, res, next) {
    try {
        const { status, priority, assignedToId, creatorId, sortBy, overdue } = req.query;
        const parsedOverdue = overdue === 'true';
        const tasks = await (0, task_service_1.listTasks)({
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
        const { id } = req.params;
        const task = await (0, task_service_1.updateTask)(id, req.body);
        res.json(task);
    }
    catch (error) {
        next(error);
    }
}
async function deleteTaskHandler(req, res, next) {
    try {
        const { id } = req.params;
        const task = await (0, task_service_1.deleteTask)(id);
        res.json(task);
    }
    catch (error) {
        next(error);
    }
}
