import { Router } from 'express'
import type { Request, Response } from 'express'
const router = Router()

// Imports
import { auth } from '../controllers/authController'
import { signAuth } from '../middleware/auth'
import { successResponse, errorResponse } from '../helpers/responseHelper'

router.post('/broker', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const { broker, error } = await auth(email, password)

    if (!broker) {
      throw new Error('No broker found with the provided email')
    } else if (error) {
      errorResponse(res, error, 400)
    } else {
      const token = await signAuth(broker)

      successResponse(res, { broker, token })
    }
  } catch (error) {
    errorResponse(res, `${error ? error : 'Error authenticating'}`, 400)
  }
})

export default router
