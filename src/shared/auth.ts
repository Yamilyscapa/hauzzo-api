import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { JwtPayload } from 'jsonwebtoken'
import { errorResponse } from './responseHelper'
import { Broker, User } from './global'

export interface AuthenticatedRequest extends Request {
  userId?: string
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

export function auth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const SECRET: string = process.env.JWT_SECRET || ''
    const token = req.cookies?.accessToken || ''

    if (!token) {
      errorResponse(res, 'No token provided', 401)
      return
    }

    const decoded = jwt.verify(token, SECRET) as JwtPayload
    req.userId = decoded.id

    next()
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      errorResponse(res, 'Token expired', 401, { expired: true })
    } else {
      errorResponse(res, 'Invalid token', 401, err)
    }
  }
}

export async function signAuth(user: User | Broker): Promise<TokenPair> {
  const { email, id, role } = user
  const SECRET: string = process.env.JWT_SECRET || ''
  const REFRESH_SECRET: string =
    process.env.JWT_REFRESH_SECRET || SECRET + '_refresh'

  // Access token - short lived (15 minutes)
  const accessToken = jwt.sign({ email, id, role, type: 'access' }, SECRET, {
    expiresIn: '15m',
  })

  // Refresh token - long lived (7 days)
  const refreshToken = jwt.sign({ id, type: 'refresh' }, REFRESH_SECRET, {
    expiresIn: '7d',
  })

  return { accessToken, refreshToken }
}

export function verifyRefreshToken(token: string): { id: string } | null {
  try {
    const REFRESH_SECRET: string =
      process.env.JWT_REFRESH_SECRET ||
      (process.env.JWT_SECRET || '') + '_refresh'
    const decoded = jwt.verify(token, REFRESH_SECRET) as JwtPayload

    if (decoded.type !== 'refresh') {
      return null
    }

    return { id: decoded.id }
  } catch (err) {
    return null
  }
}
