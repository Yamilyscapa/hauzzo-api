import { Router } from "express";
const router = Router()
import propertyService from '../services/propertyService'

router.use('/properties', propertyService)

export default router