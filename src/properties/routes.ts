import { Router } from 'express'
import { Request, Response, NextFunction } from 'express'
import {
  createProperty,
  editProperty,
  findManyProperties,
  findOneProperty,
  handleImagesUpload,
  updatePropertyImages,
} from './controller'
import { successResponse, errorResponse } from '@shared/responseHelper'
import { auth, AuthenticatedRequest } from '@shared/auth'
import multer from 'multer'

const router = Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Types
import { Property } from '@shared/global'

// POST
router.post(
  '/create',
  upload.array('images', 10),
  auth,
  async (req: AuthenticatedRequest, res: Response): Promise<any> => {
    try {
      const propertyData = req.body
      const brokerId = req.userId || ''

      // Create property first
      let { data: property, error } = await createProperty(
        propertyData as Property,
        brokerId
      )

      if (error) {
        return errorResponse(res, error, 400)
      }

      // Handle image upload if files are present
      if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        console.log(`Processing ${req.files.length} images...`);
        
        const { data: images, error: imagesError } = await handleImagesUpload(req.files)
        
        if (imagesError) {
          console.error('Image upload error:', imagesError);
          return errorResponse(res, imagesError, 400)
        }

        if (images && images.length > 0) {
          const { data: updatedProperty, error: updateError } = await updatePropertyImages(property?.id, images)
          if (updateError) {
            console.error('Property update error:', updateError);
            return errorResponse(res, updateError, 400)
          }
          property = updatedProperty
        }
      }

      successResponse(res, property, 'Property created', 201)
    } catch (error: any) {
      console.error('Property creation error:', error);
      errorResponse(res, error.message || 'Error creating the property', 400)
    }
  }
)

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
router.get(
  '/:id',
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const id: string = req.params.id
      if (!id) return

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
  }
)

// EDIT
router.put(
  '/edit/:id',
  auth,
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const id: string = req.params.id
      const { title, description, tags, price, location } = req.body

      if (!id) return errorResponse(res, 'No property id provided', 400)

      const { data: property, error } = await editProperty(id, {
        title,
        description,
        tags,
        price,
        location,
      } as Property)

      if (error) {
        return errorResponse(res, error, 400)
      } else if (!property) {
        return errorResponse(res, 'Error editing the property', 400)
      }

      successResponse(res, property, 'Property edited', 200)
    } catch (error) {
      errorResponse(res, 'Error editing the property', 400)
    }
  }
)

// DELETE

export default router
