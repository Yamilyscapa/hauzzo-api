import { Router } from 'express';
import { Request, Response, NextFunction } from "express";
import { createProperty, editProperty, findManyProperties, findOneProperty, handleImagesUpload, updatePropertyImages } from '../controllers/propertyController';
import { successResponse, errorResponse } from '../helpers/responseHelper'
import { auth, AuthenticatedRequest } from '../middleware/auth'
import multer from 'multer'


const router = Router()
const upload = multer()


// Types
import { Property } from '../types/global'

// POST
router.post('/create', upload.array('images', 10), auth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<any> => {
    try {
        const propertyData = req.body
        const brokerId = req.userId || ''
        
        const files: Express.Multer.File[] = req.files as Express.Multer.File[]
        
        let { data: images, error: imagesError } = await handleImagesUpload(files)
        
        const { data: property, error } = await createProperty(propertyData as Property, brokerId)

        if (property && images) {
            const { error: imagesUpdateError } = await updatePropertyImages(property.id, images)
            if (imagesUpdateError) {
                return errorResponse(res, imagesUpdateError, 400)
            }
        }
        
        if (error) {
            return errorResponse(res, error, 400)
        } else if (!property) {
            return errorResponse(res, error, 400)
        }
        
        successResponse(res, {}, 'Property created', 201)
    } catch (error) {
        errorResponse(res, 'Error creating the property', 400)
    }
})

// GET
router.get('/all', async (req: Request, res: Response): Promise<any> => {
    try {
        const limit = Number(req.query?.limit)

        if (isNaN(limit)) {
            return errorResponse(res, 'Invalid limit value', 400)
        }

        const { data: properties, error } = await findManyProperties(limit)

        if (error) {
            return errorResponse(res, error, 400)
        } else if (!properties) {
            return errorResponse(res, error, 404)
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

        const { data: property, error } = await findOneProperty(id)

        if (error) {
            return errorResponse(res, error, 400)
        } else if (!property) {
            return errorResponse(res, 'Property not found', 404)
        }

        successResponse(res, property, 'Property found', 200)
    } catch (error) {
        errorResponse(res, 'Error finding the property', 400)
    }
})

// EDIT
router.put('/edit/:id', auth, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const id: string = req.params.id
        const { title, description, tags, price, location } = req.body

        if (!id) return errorResponse(res, 'No property id provided', 400);

        const { data: property, error } = await editProperty(id, { title, description, tags, price, location } as Property)

        if (error) {
            return errorResponse(res, error, 400)
        } else if (!property) {
            return errorResponse(res, 'Error editing the property', 400)
        }

        successResponse(res, property, 'Property edited', 200)
    } catch (error) {
        errorResponse(res, 'Error editing the property', 400)
    }
})

// DELETE

export default router