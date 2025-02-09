import { Router } from "express";
const router = Router()
import propertyService from '../services/propertyService'
import authService from '../services/authService'

router.use('/properties', propertyService)
router.use('/auth', authService)

export default router