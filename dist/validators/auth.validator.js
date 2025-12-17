"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
const createRequestSchema = (bodySchema) => zod_1.z.object({
    body: bodySchema,
    params: zod_1.z.object({}).passthrough(),
    query: zod_1.z.object({}).passthrough(),
});
const loginBodySchema = zod_1.z.object({
    email: zod_1.z.string().email({ message: 'Provide a valid email address.' }),
    password: zod_1.z.string().min(1, { message: 'Password is required.' }),
});
const registerBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, { message: 'Name is required.' }),
    email: zod_1.z.string().email({ message: 'Provide a valid email address.' }),
    password: zod_1.z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});
exports.loginSchema = createRequestSchema(loginBodySchema);
exports.registerSchema = createRequestSchema(registerBodySchema);
