import { Router } from 'express';
import { Request, Response, NextFunction } from "express";
import { createProperty, findManyProperties, findOneProperty } from '../controllers/propertyController';
import { successResponse, errorResponse } from '../helpers/responseHelper'
import { auth } from '../middleware/auth'

const router = Router()
// Types
import { Property } from '../types/global'

// GET
router.get('/all', async (req: Request, res: Response): Promise<any> => {
    try {

        const limit = Number(req.query?.limit || undefined)
        
        const properties = findManyProperties(limit)

        successResponse(res, properties, 'Properties found', 200)
    } catch (error) {
        errorResponse(res, 'Error finding the properties', 400)
    }
})

router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const id: string = req.params.id
        if (!id) return;

        const property = await findOneProperty(id)

        if (!property) return errorResponse(res, 'Property not found', 404)

        successResponse(res, property, 'Property found', 200)
    } catch (error) {
        errorResponse(res, 'Error finding the property', 400)
    }
})

// POST
router.get('/create', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    auth(req, res, next)
    
    try {

        const body = req.body
        createProperty(<Property>body)
    } catch (error) {
        errorResponse(res, 'Error creating the property', 400)
    }
})

// EDIT

// DELETE

export default router