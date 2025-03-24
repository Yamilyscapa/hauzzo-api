import { Router } from 'express'
const router = Router()

// Imports
import { errorResponse } from '../helpers/responseHelper'

router.get('/:id', (req, res) => {
  const id: string = req.params.id
  if (!id) {
    errorResponse(res, 'Invalid id', 400)
  }
})

export default router
