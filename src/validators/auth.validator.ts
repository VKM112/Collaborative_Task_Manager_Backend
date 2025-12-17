import { z, type ZodTypeAny } from 'zod'

const createRequestSchema = <Body extends ZodTypeAny>(bodySchema: Body) =>
  z.object({
    body: bodySchema,
    params: z.object({}).passthrough(),
    query: z.object({}).passthrough(),
  })

const loginBodySchema = z.object({
  email: z.string().email({ message: 'Provide a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
})

const registerBodySchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Provide a valid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
})

export const loginSchema = createRequestSchema(loginBodySchema)
export const registerSchema = createRequestSchema(registerBodySchema)
