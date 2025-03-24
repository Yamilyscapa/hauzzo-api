// Router setup
import { Router } from 'express'
const router = Router()

// Importing routes
import propertyService from '../services/propertyService'
import userService from '../services/userService'
import brokerService from '../services/brokerService'
import authService from '../services/authService'
import uploadService from '../services/uploadService'

// Using routes
router.use('/properties', propertyService)
router.use('/users', userService)
router.use('/brokers', brokerService)
router.use('/auth', authService)
router.use('/upload', uploadService)

export default router
