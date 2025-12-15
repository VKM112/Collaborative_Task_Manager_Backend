"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTaskHandler = createTaskHandler;
exports.listTasksHandler = listTasksHandler;
const task_service_1 = require("../services/task.service");
async function createTaskHandler(req, res, next) {
    try {
        const task = await (0, task_service_1.createTask)(req.body);
        res.json(task);
    }
    catch (error) {
        next(error);
    }
}
async function listTasksHandler(_req, res, next) {
    try {
        const tasks = await (0, task_service_1.listTasks)();
        res.json(tasks);
    }
    catch (error) {
        next(error);
    }
}
