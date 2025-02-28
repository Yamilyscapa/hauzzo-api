import { Router } from 'express';
import type { Request, Response } from 'express';
const router = Router()

// Imports
import { errorResponse, successResponse } from '../helpers/responseHelper';
import { getBrokerById } from '../controllers/brokerController';

router.get('/:id', async (req: Request, res: Response) => {
    try {

        const id: string = req.params.id

        if (!id) {
            errorResponse(res, 'Invalid id', 400)
            return;
        }

        const { broker, error } = await getBrokerById(id);

        if (error) {
            errorResponse(res, error.message, 400, error)
        } else if (!broker) {
            errorResponse(res, 'Broker not found', 404)
        } else {
            successResponse(res, broker, 'Broker found', 200)
        }
    } catch (error) {
        errorResponse(res, 'Error finding the broker', 400)
    }
})

export default router