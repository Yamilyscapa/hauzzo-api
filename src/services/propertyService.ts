import { Router } from 'express';
import { Request, Response, NextFunction } from "express";
import { createProperty, editProperty, findManyProperties, findOneProperty } from '../controllers/propertyController';
import { successResponse, errorResponse } from '../helpers/responseHelper'
import { auth, AuthenticatedRequest } from '../middleware/auth'

const router = Router()

// Types
import { Property } from '../types/global'

// GET
router.get('/all', async (req: Request, res: Response): Promise<any> => {
    try {
        const limit = Number(req.query?.limit)

        if (isNaN(limit)) {
            return errorResponse(res, 'Invalid limit value', 400)
        }

        const { property: properties, error } = await findManyProperties(limit)

        if (!properties) {
            return errorResponse(res, error, 404)
        } else if (error) {
            return errorResponse(res, error, 400)
        }

        return successResponse(res, properties, 'Properties found', 200)
    } catch (error) {
        return errorResponse(res, 'Error finding the properties', 400)
    }
})

// Get by id
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const id: string = req.params.id
        if (!id) return;

        const { property, error } = await findOneProperty(id)

        if (!property) {
            return errorResponse(res, 'Property not found', 404)
        } else if (error) {
            return errorResponse(res, error, 400)
        }

        successResponse(res, property, 'Property found', 200)
    } catch (error) {
        errorResponse(res, 'Error finding the property', 400)
    }
})

// POST
router.post('/create', auth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const propertyData = req.body as Property
        const brokerId = req.userId || ''

        const { property, error } = await createProperty(propertyData, brokerId)

        if (!property) {
            return errorResponse(res, error, 400)
        } else if (error) {
            return errorResponse(res, error, 400)
        }
        
        successResponse(res, property, 'Property created', 201)
    } catch (error) {
        errorResponse(res, 'Error creating the property', 400)
    }
})

// EDIT
router.put('/edit/:id', auth, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const id: string = req.params.id
        const { title, description, tags, price, location } = req.body

        if (!id) return errorResponse(res, 'No property id provided', 400);

        const property = await editProperty(id, { title, description, tags, price, location } as Property)

        if (!property) return errorResponse(res, 'Error editing the property', 400)

        if (Object.keys(property).length === 0) return errorResponse(res, 'No changes to edit', 400)

        successResponse(res, property, 'Property edited', 200)
    } catch (error) {
        errorResponse(res, 'Error editing the property', 400)
    }
})

// DELETE

export default router