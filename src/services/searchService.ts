import { Router } from 'express'
import { Request, Response } from 'express'

import { successResponse, errorResponse } from '../helpers/responseHelper'
import { findPropertyByDescription, findPropertyByTags } from '../controllers/searchController'

const router = Router()

router.post("/tags", async (req: Request, res: Response): Promise<any> => {
    // Handle search request
    const { query }: { query: string[] } = req.body

    // Validate query
    if (!query || typeof query !== 'string') {
        return errorResponse(res, "Invalid query", 400)

    }

    // Perform search
    const results = await findPropertyByTags(query)

    // Handle errors
    if (results.error) {
        return errorResponse(res, results.error, 500)
    }
    if (!results.data || results.data.length === 0) {
        return errorResponse(res, "No results found", 404)
    }

    successResponse(res, results.data, "Search results", 200)
})

router.post("/description", async (req: Request, res: Response): Promise<any> => {
    // Handle search request
    const { query }: { query: string[] } = req.body

    // Validate query
    if (!query || typeof query !== 'string') {
        return errorResponse(res, "Invalid query", 400)

    }

    // Perform search
    const results = await findPropertyByDescription(query)

    // Handle errors
    if (results.error) {
        return errorResponse(res, results.error, 500)
    }
    if (!results.data || results.data.length === 0) {
        return errorResponse(res, "No results found", 404)
    }

    successResponse(res, results.data, "Search results", 200)
})

export default router