import { NextFunction, Request, Response } from 'express'

export default function jsonParser(
  parser: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  parser()(req, res, (err: Error) => {
    if (err) {
      return res.status(400).json({ error: 'Invalid JSON format' })
    }
    next()
  })
}
