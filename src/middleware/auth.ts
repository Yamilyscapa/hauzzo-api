import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { errorResponse } from '../helpers/responseHelper'
import { Broker, User } from '../types/global'

export interface AuthenticatedRequest extends Request {
  userId?: string
}

export function auth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const SECRET: string = process.env.JWT_SECRET || ''
    const token = req.header('Authorization')?.replace('Bearer ', '') || ''

    if (!token) errorResponse(res, 'No token provided', 401)

    const decoded = jwt.verify(token, SECRET) as JwtPayload
    req.userId = decoded.id

    next()
  } catch (err) {
    errorResponse(res, 'Invalid token', 401, err)
  }
}

export async function signAuth(user: User | Broker): Promise<string> {
  const { email, id } = user

  const SECRET: string = process.env.JWT_SECRET || ''

  const token = jwt.sign({ email, id }, SECRET)
  return token
}
