import { Router } from 'express';
import { Request, Response } from "express";
import { errorResponse, successResponse } from '../helpers/responseHelper';
import type { User, Broker, UserType, Error } from '../types/global';
import { createUser } from '../controllers/authController';
import { signAuth } from '../middleware/auth';

const router = Router()

router.post('/create/user', async (req: Request, res: Response): Promise<any> => {
    try {
        const { role } = req.body

        if (!role) return errorResponse(res, 'Role is required', 400)


        if (role !== 'user' && role !== 'broker') return errorResponse(res, 'Invalid role', 400)
        if (role == 'broker') {
            req.body.role = 'broker'
        }

        let { user, error } = await createUser(<User>req.body)

        if (error) {
            return errorResponse(res, error.message, error.status, error.error)
        }

        if (!user) return errorResponse(res, 'Error creating user', 400)

        const token = await signAuth(user)
        console.log(token);
        
        successResponse(res, {user, token: token}, 'User created successfully', 201)
    } catch (err) {
        return errorResponse(res, 'Error creating user', 400, err)
    }
})

router.post('/create/broker', async (req: Request, res: Response): Promise<any> => {

})

export default router