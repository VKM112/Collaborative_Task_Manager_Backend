import { z, type ZodTypeAny } from 'zod'

const createRequestSchema = <Body extends ZodTypeAny>(bodySchema: Body) =>
  z.object({
    body: bodySchema,
    params: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
  })

const messageBodySchema = z.object({
  content: z.string().min(1, { message: 'Message cannot be empty.' }),
})

export const messageSchema = createRequestSchema(messageBodySchema)
