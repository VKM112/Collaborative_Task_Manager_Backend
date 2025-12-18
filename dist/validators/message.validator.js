"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageSchema = void 0;
const zod_1 = require("zod");
const createRequestSchema = (bodySchema) => zod_1.z.object({
    body: bodySchema,
    params: zod_1.z.object({}).passthrough(),
    query: zod_1.z.object({}).passthrough(),
});
const messageBodySchema = zod_1.z.object({
    content: zod_1.z.string().min(1, { message: 'Message cannot be empty.' }),
});
exports.messageSchema = createRequestSchema(messageBodySchema);
