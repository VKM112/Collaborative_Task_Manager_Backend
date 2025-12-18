"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinTeamSchema = exports.updateTeamSchema = exports.createTeamSchema = void 0;
const zod_1 = require("zod");
const createRequestSchema = (bodySchema) => zod_1.z.object({
    body: bodySchema,
    params: zod_1.z.object({}).passthrough(),
    query: zod_1.z.object({}).passthrough(),
});
const baseTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, { message: 'Team name must be at least 2 characters.' }),
    description: zod_1.z.string().max(250, { message: 'Keep the description under 250 characters.' }).optional(),
});
const updateTeamBodySchema = zod_1.z
    .object({
    name: zod_1.z.string().min(2, { message: 'Team name must be at least 2 characters.' }).optional(),
    description: zod_1.z.string().max(250, { message: 'Keep the description under 250 characters.' }).optional(),
})
    .refine((value) => value.name || value.description, {
    message: 'Update must include name or description.',
    path: ['name'],
});
const joinTeamBodySchema = zod_1.z
    .object({
    teamId: zod_1.z.string().uuid().optional(),
    inviteCode: zod_1.z.string().min(3).max(12).optional(),
})
    .refine((value) => value.teamId || value.inviteCode, {
    message: 'Provide a team id or invite code.',
});
exports.createTeamSchema = createRequestSchema(baseTeamSchema);
exports.updateTeamSchema = createRequestSchema(updateTeamBodySchema);
exports.joinTeamSchema = createRequestSchema(joinTeamBodySchema);
