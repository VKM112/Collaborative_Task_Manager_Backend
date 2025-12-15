import { Request, Response, NextFunction } from 'express'
import { ZodError, type ZodTypeAny } from 'zod'

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      })
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        return next(error)
      }
      next(error)
    }
  }
}
