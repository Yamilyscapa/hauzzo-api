import { Router } from 'express'
import type { Request, Response } from 'express'
const router = Router()

// Imports
import { errorResponse, successResponse } from '../helpers/responseHelper'
import {
  getBrokerById,
  getBrokerByEmail,
  createBroker,
  editBroker,
} from '../controllers/brokerController'
import { Broker } from '../types/global'

// POST /brokers/new
router.post('/new', async (req: Request, res: Response) => {
  try {
    const body = req.body

    if (Object.keys(body).length === 0) {
      errorResponse(res, 'Empty body', 400)
      return
    }

    const { broker, error } = await createBroker(body)

    if (error) {
      errorResponse(res, error.message, 400, error)
      return
    } else if (!broker) {
      errorResponse(res, 'Error creating the broker', 400)
      return
    } else {
      successResponse(res, broker as Broker, 'Broker created', 201)
      return
    }
  } catch (error) {
    errorResponse(res, 'Error creating the broker', 400)
  }
})

// GET /brokers/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id

    if (!id) {
      errorResponse(res, 'Invalid id', 400)
      return
    }

    const { broker, error } = await getBrokerById(id)

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

// GET /brokers/:email
router.get('/email/:email', async (req: Request, res: Response) => {
  try {
    const email: string = req.params.email

    if (!email) {
      errorResponse(res, 'Invalid email', 400)
      return
    }

    const { broker, error } = await getBrokerByEmail(email)

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

router.put('/edit/:id', async (req: Request, res: Response) => {
  try {
    const id: string = req.params.id
    const body = req.body

    if (!id) {
      errorResponse(res, 'Invalid id', 400)
      return
    }

    if (Object.keys(body).length === 0) {
      errorResponse(res, 'No changes made, empty body', 400)
      return
    }

    const { broker, error } = await editBroker(id, body)

    if (error) {
      errorResponse(res, error.message, 400, error)
      return
    } else if (!broker) {
      errorResponse(res, 'Error updating the broker', 400)
      return
    } else {
      successResponse(res, broker as Broker, 'Broker updated', 200)
      return
    }
  } catch (error) {
    errorResponse(res, 'Error updating the broker', 400)
  }
})

export default router
