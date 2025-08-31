import { Router } from 'express'
import { Request, Response } from 'express'

import { successResponse, errorResponse } from '@shared/responseHelper'
import {
  findPropertyByDescription,
  findPropertyByTags,
  searchProperties,
} from './controller'

const router = Router()

router.post('/tags', async (req: Request, res: Response): Promise<any> => {
  // Handle search request
  const { query }: { query: string[] } = req.body

  // Validate query
  if (!query || typeof query !== 'string') {
    return errorResponse(res, 'Invalid query', 400)
  }

  // Perform search
  const results = await findPropertyByTags(query)

  // Handle errors
  if (results.error) {
    return errorResponse(res, results.error, 500)
  }
  if (!results.data || results.data.length === 0) {
    return errorResponse(res, 'No results found', 404)
  }

  successResponse(res, results.data, 'Search results', 200)
})

router.post(
  '/description',
  async (req: Request, res: Response): Promise<any> => {
    // Handle search request
    const { query }: { query: string[] } = req.body

    // Validate query
    if (!query || typeof query !== 'string') {
      return errorResponse(res, 'Invalid query', 400)
    }

    // Perform search
    const results = await findPropertyByDescription(query)

    // Handle errors
    if (results.error) {
      return errorResponse(res, results.error, 500)
    }
    if (!results.data || results.data.length === 0) {
      return errorResponse(res, 'No results found', 404)
    }

    successResponse(res, results.data, 'Search results', 200)
  }
)

// Advanced search endpoint with full-text search and filters
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      query,
      transaction,
      type,
      min_price,
      max_price,
      min_bedrooms,
      max_bedrooms,
      city,
      state,
    } = req.query

    // Validate required query parameter
    if (!query || typeof query !== 'string' || query.trim() === '') {
      return errorResponse(
        res,
        'Query parameter is required and cannot be empty',
        400
      )
    }

    // Build filters object with type validation
    const filters: {
      transaction?: 'rent' | 'sale'
      type?: 'house' | 'apartment'
      min_price?: number
      max_price?: number
      min_bedrooms?: number
      max_bedrooms?: number
      city?: string
      state?: string
    } = {}

    // Validate and add optional filters
    if (transaction) {
      if (transaction !== 'rent' && transaction !== 'sale') {
        return errorResponse(
          res,
          'Transaction must be either "rent" or "sale"',
          400
        )
      }
      filters.transaction = transaction as 'rent' | 'sale'
    }

    if (type) {
      if (type !== 'house' && type !== 'apartment') {
        return errorResponse(
          res,
          'Type must be either "house" or "apartment"',
          400
        )
      }
      filters.type = type as 'house' | 'apartment'
    }

    if (min_price) {
      const minPriceNum = parseInt(min_price as string, 10)
      if (isNaN(minPriceNum) || minPriceNum < 0) {
        return errorResponse(
          res,
          'min_price must be a valid positive number',
          400
        )
      }
      filters.min_price = minPriceNum
    }

    if (max_price) {
      const maxPriceNum = parseInt(max_price as string, 10)
      if (isNaN(maxPriceNum) || maxPriceNum < 0) {
        return errorResponse(
          res,
          'max_price must be a valid positive number',
          400
        )
      }
      filters.max_price = maxPriceNum
    }

    if (min_bedrooms) {
      const minBedroomsNum = parseInt(min_bedrooms as string, 10)
      if (isNaN(minBedroomsNum) || minBedroomsNum < 0) {
        return errorResponse(
          res,
          'min_bedrooms must be a valid positive number',
          400
        )
      }
      filters.min_bedrooms = minBedroomsNum
    }

    if (max_bedrooms) {
      const maxBedroomsNum = parseInt(max_bedrooms as string, 10)
      if (isNaN(maxBedroomsNum) || maxBedroomsNum < 0) {
        return errorResponse(
          res,
          'max_bedrooms must be a valid positive number',
          400
        )
      }
      filters.max_bedrooms = maxBedroomsNum
    }

    if (city) {
      if (typeof city !== 'string' || city.trim() === '') {
        return errorResponse(res, 'city must be a valid non-empty string', 400)
      }
      filters.city = city.trim()
    }

    if (state) {
      if (typeof state !== 'string' || state.trim() === '') {
        return errorResponse(res, 'state must be a valid non-empty string', 400)
      }
      filters.state = state.trim()
    }

    // Additional validation: min values should not be greater than max values
    if (
      filters.min_price &&
      filters.max_price &&
      filters.min_price > filters.max_price
    ) {
      return errorResponse(
        res,
        'min_price cannot be greater than max_price',
        400
      )
    }

    if (
      filters.min_bedrooms &&
      filters.max_bedrooms &&
      filters.min_bedrooms > filters.max_bedrooms
    ) {
      return errorResponse(
        res,
        'min_bedrooms cannot be greater than max_bedrooms',
        400
      )
    }

    // Perform search
    const results = await searchProperties(query.trim(), filters)

    // Handle errors
    if (results.error) {
      return errorResponse(res, results.error, 500)
    }

    // Return results (even if empty array)
    return successResponse(
      res,
      results.data || [],
      results.data && results.data.length > 0
        ? `Found ${results.data.length} properties`
        : 'No properties found matching your criteria',
      200
    )
  } catch (error) {
    console.error('Error in search endpoint:', error)
    return errorResponse(res, 'Internal server error', 500)
  }
})

export default router
