import { z, type ZodTypeAny } from 'zod'

const createRequestSchema = <Body extends ZodTypeAny>(bodySchema: Body) =>
  z.object({
    body: bodySchema,
    params: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
  })

const baseTeamSchema = z.object({
  name: z.string().min(2, { message: 'Team name must be at least 2 characters.' }),
  description: z.string().max(250, { message: 'Keep the description under 250 characters.' }).optional(),
})

const updateTeamBodySchema = z
  .object({
    name: z.string().min(2, { message: 'Team name must be at least 2 characters.' }).optional(),
    description: z.string().max(250, { message: 'Keep the description under 250 characters.' }).optional(),
  })
  .refine((value) => value.name || value.description, {
    message: 'Update must include name or description.',
    path: ['name'],
  })

const joinTeamBodySchema = z
  .object({
    teamId: z.string().uuid().optional(),
    inviteCode: z.string().min(3).max(12).optional(),
  })
  .refine((value) => value.teamId || value.inviteCode, {
    message: 'Provide a team id or invite code.',
  })

export const createTeamSchema = createRequestSchema(baseTeamSchema)
export const updateTeamSchema = createRequestSchema(updateTeamBodySchema)
export const joinTeamSchema = createRequestSchema(joinTeamBodySchema)
