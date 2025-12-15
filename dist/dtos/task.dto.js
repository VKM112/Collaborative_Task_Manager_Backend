"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskFilterSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    priority: zod_1.z.enum(['low', 'medium', 'high']),
});
exports.updateTaskSchema = exports.createTaskSchema.partial();
exports.taskFilterSchema = zod_1.z.object({
    status: zod_1.z.string().optional(),
    assignedToId: zod_1.z.string().optional(),
});
