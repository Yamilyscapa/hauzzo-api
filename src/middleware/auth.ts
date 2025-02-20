import jwt from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { errorResponse } from '../helpers/responseHelper'
import { User } from '../types/global'

export function auth(req: Request, res: Response, next: NextFunction): void {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '') ?? ''
        const SECRET: string = process.env.JWT_SECRET || ''

        if (!token) errorResponse(res, 'No token provided', 401)

        jwt.verify(token, SECRET)
        next()
    } catch (err) {
        errorResponse(res, 'Invalid token', 401, err)
    }
}

export async function signAuth(user: User) {
    const { email } = user

    const SECRET: string = process.env.JWT_SECRET || ''

    const token = jwt.sign(email, SECRET)
    return token
}