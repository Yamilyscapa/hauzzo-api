import { Router } from 'express'
import type { Request, Response } from 'express'

import { createLead, listLeadsForBroker } from './controller'
import { successResponse, errorResponse } from '@shared/responseHelper'
import { auth, AuthenticatedRequest } from '@shared/auth'

const router = Router()

// POST /leads/create
// Body: { propertyId: string, email?: string, phone?: string, brokerId?: string }
router.post('/create', async (req: Request, res: Response): Promise<void> => {
  try {
    const { propertyId, email, phone, brokerId } = req.body || {}

    const { data, error } = await createLead({
      propertyId,
      email,
      phone,
      brokerId,
    })

    if (error) {
      errorResponse(
        res,
        typeof error === 'string' ? error : 'Error creating lead',
        400,
        error
      )
      return
    }

    successResponse(res, data, 'Lead created', 201)
  } catch (error: any) {
    errorResponse(res, error?.message || 'Error creating lead', 400)
  }
})

export default router

// GET /leads/mine - list leads for the authenticated broker
router.get(
  '/mine',
  auth,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const brokerId = req.userId || ''
      const search = typeof req.query.q === 'string' ? req.query.q : undefined
      const { data, error } = await listLeadsForBroker(brokerId, search)
      if (error) {
        errorResponse(
          res,
          typeof error === 'string' ? error : 'Error fetching leads',
          400,
          error
        )
        return
      }
      successResponse(res, data, 'Leads fetched', 200)
    } catch (error: any) {
      errorResponse(res, error?.message || 'Error fetching leads', 400)
    }
  }
)
