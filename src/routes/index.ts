// Router setup
import { Router } from 'express'
const router = Router()

// Importing routes
import propertyService from '../properties/routes'
import userService from '../users/routes'
import brokerService from '../brokers/routes'
import authService from '../authentication/routes'
import searchService from '../search/routes'
import leadService from '../leads/routes'
import healthService from '../health/routes'

// Using routes
router.use('/health', healthService)
router.use('/properties', propertyService)
router.use('/users', userService)
router.use('/brokers', brokerService)
router.use('/auth', authService)
router.use('/search', searchService)
router.use('/leads', leadService)

export default router
