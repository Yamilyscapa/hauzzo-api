// Router setup
import { Router } from "express";
const router = Router()

// Importing routes
import propertyService from '../services/propertyService'
import userService from '../services/userService'
import brokerService from '../services/brokerService'

// Using routes
router.use('/properties', propertyService)
router.use('/users', userService)
router.use('/brokers', brokerService)

export default router