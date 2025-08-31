import { Router } from 'express'
import { successResponse } from '@shared/responseHelper'

const router = Router()

router.get('/', (req, res) => {
  successResponse(
    res,
    {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    },
    '',
    200
  )
})

export default router
