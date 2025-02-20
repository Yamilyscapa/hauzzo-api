import { Router } from 'express';
import { Request, Response } from "express";
import { errorResponse, successResponse } from '../helpers/responseHelper';
import type { User } from '../types/global';
import { createUser } from '../controllers/authController';
import { signAuth } from '../middleware/auth';

const router = Router()

router.post('/create/user', async (req: Request, res: Response): Promise<any> => {
    try {
        const { role }: { role: string } = req.body
        const userData = req.body as User

        if (!role) return errorResponse(res, 'Role is required', 400)


        if (role !== 'user' && role !== 'broker') return errorResponse(res, 'Invalid role', 400)

        let user = await createUser(userData)

        if (!user) return errorResponse(res, 'Error creating user', 400)

        const token = await signAuth(user)
        
        successResponse(res, {user, token: token}, 'User created successfully', 201)
    } catch (err) {
        return errorResponse(res, 'Error creating the user', 400, err)
    }
})

export default router