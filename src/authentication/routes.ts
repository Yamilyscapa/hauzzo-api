import { Router } from 'express'
import type { Request, Response } from 'express'
const router = Router()

// Imports
import { auth } from './controller'
import { signAuth, verifyRefreshToken, auth as authMiddleware } from '@shared/auth'
import { successResponse, errorResponse } from '@shared/responseHelper'
import { getBrokerById, createBroker } from '../brokers/controller'
import { 
  storeRefreshToken, 
  verifyRefreshToken as verifyRefreshTokenInDB, 
  revokeRefreshToken, 
  revokeAllTokensForBroker,
  rotateRefreshToken
} from '@shared/refreshTokenManager'

router.post('/broker/signup', async (req: Request, res: Response) => {
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
    }

    if (!broker) {
      errorResponse(res, 'Error creating the broker', 400)
      return
    }

    // Generate JWT tokens for the newly created broker
    const tokens = await signAuth(broker)
    
    // Store refresh token in database
    const deviceInfo = req.headers['user-agent'] || 'Unknown device'
    await storeRefreshToken(broker.id, tokens.refreshToken, deviceInfo)
    
    successResponse(res, {
      broker: {
        id: broker.id,
        firstName: broker.firstName,
        lastName: broker.lastName,
        email: broker.email,
        phone: broker.phone,
        role: broker.role
      },
      ...tokens
    }, 'Broker created and logged in successfully', 201)

  } catch (error) {
    errorResponse(res, 'Error creating the broker', 400)
  }
})

router.post('/broker/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      errorResponse(res, 'Email and password are required', 400)
      return
    }

    const { broker, error } = await auth(email, password)

    if (error) {
      errorResponse(res, error, 401)
      return
    }

    if (!broker) {
      errorResponse(res, 'Authentication failed', 401)
      return
    }

    const tokens = await signAuth(broker)
    
    // Store refresh token in database
    const deviceInfo = req.headers['user-agent'] || 'Unknown device'
    await storeRefreshToken(broker.id, tokens.refreshToken, deviceInfo)
    
    successResponse(res, {
      broker: {
        id: broker.id,
        firstName: broker.firstName,
        lastName: broker.lastName,
        email: broker.email,
        phone: broker.phone,
        role: broker.role
      },
      ...tokens
    }, 'Login successful', 200)

  } catch (error) {
    errorResponse(res, 'Authentication failed', 401)
  }
})

router.post('/broker/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      errorResponse(res, 'Refresh token is required', 400)
      return
    }

    // Verify refresh token in database
    const tokenData = await verifyRefreshTokenInDB(refreshToken)
    
    if (!tokenData) {
      errorResponse(res, 'Invalid or expired refresh token', 401)
      return
    }

    const { broker, error } = await getBrokerById(tokenData.broker_id)

    if (error || !broker) {
      errorResponse(res, 'Broker not found', 404)
      return
    }

    // Generate new tokens
    const newTokens = await signAuth(broker)
    
    // Rotate refresh token (revoke old + store new) using functional composition
    const deviceInfo = req.headers['user-agent'] || 'Unknown device'
    await rotateRefreshToken(refreshToken, broker.id, newTokens.refreshToken, deviceInfo)
    
    successResponse(res, newTokens, 'Tokens refreshed successfully', 200)

  } catch (error) {
    errorResponse(res, 'Token refresh failed', 401)
  }
})

router.post('/broker/logout', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      errorResponse(res, 'Refresh token is required', 400)
      return
    }

    // Revoke refresh token
    await revokeRefreshToken(refreshToken)
    
    successResponse(res, {}, 'Logged out successfully', 200)

  } catch (error) {
    errorResponse(res, 'Logout failed', 500)
  }
})

router.post('/broker/logout-all', authMiddleware, async (req: any, res: Response) => {
  try {
    const brokerId = req.userId

    if (!brokerId) {
      errorResponse(res, 'User ID not found', 400)
      return
    }

    // Revoke all refresh tokens for this broker
    await revokeAllTokensForBroker(brokerId)
    
    successResponse(res, {}, 'Logged out from all devices successfully', 200)

  } catch (error) {
    errorResponse(res, 'Logout failed', 500)
  }
})

export default router
