import { pool } from "../database/client";
import { Property } from "../types/global";
import { getBrokerById } from './brokerController'

interface stdRes {
    property: Property | Property[] | null,
    error: any
}

// GET
export async function findManyProperties(limit?: number): Promise<stdRes> {
    let response: stdRes = {
        property: null,
        error: null
    }

    try {
        const query = 'SELECT * FROM properties'

        if (limit) {
            query.concat(` LIMIT ${limit}`)
        }

        const { rows: properties } = await pool.query(query)
        response.property = properties

        if (properties.length === 0) {
            response.error = 'No properties found'
        }

        return response
    } catch (error) {
        response.error = error
        return response
    }
}

export async function findOneProperty(id: string): Promise<stdRes> {
    let response: stdRes = {
        property: null,
        error: null
    }

    try {
        const { rows: property } = await pool.query('SELECT * FROM properties WHERE id = $1', [id])
        response.property = property[0]

        return response
    } catch (error) {
        response.error = error
        return response
    }
}

// POST
export async function createProperty(property: Property, brokerId: string): Promise<stdRes> {
    let response: stdRes = {
        property: null,
        error: null
    }

    try {
        const {
            title,
            description,
            price,
            tags,
            bedrooms,
            bathrooms,
            parking,
            type,
            location,
            images,
        } = property;
        const requiredFields = ['title', 'description', 'price', 'tags', 'bedrooms', 'bathrooms', 'parking', 'type', 'images']

        // Validate that all of the data is present
        for (const key of requiredFields) {
            if (!property[key as keyof typeof property]) {
                response.error = `Missing ${key} data`
                return response
            }

            // Validate that address is present
            for (const key in location) {
                if (!location[key as keyof typeof location]) {
                    response.error = 'Missing location data'
                    return response
                }
            }
        }

        // Validate that the location data is complete
        Object.entries(location).forEach(([key, value], index) => {
            const locationRequiredFields = ['address', 'city', 'state', 'zip']
            const includesAll = locationRequiredFields.every(field => Object.keys(location).includes(field))

            if (!includesAll) {
                response.error = 'Missing location data (address, city, state, zip)'
                return response
            }
        })

        // Validate that the broker exists
        if (!brokerId) {
            response.error = 'Missing broker ID'
            return response
        }

        const { broker, error } = await getBrokerById(brokerId)

        if (!broker) {
            response.error = 'Broker not found'
            return response
        } else if (error) {
            response.error = error
            return response
        }

        // Insert into database
        const { rows } = await pool.query(
            `INSERT INTO properties 
        (title, description, price, tags, bedrooms, bathrooms, parking, location, type, images, broker_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
        RETURNING *`,
            [
                title,
                description,
                price,
                tags,
                bedrooms,
                bathrooms,
                parking,
                JSON.stringify(location), // Stringify to store as JSON in Postgres
                type,
                images,
                brokerId
            ]
        );

        if (!rows[0]) {
            response.error = 'Error creating property'
            return response
        }

        response.property = rows[0]
        return response
    } catch (error) {
        response.error = error
        return response
    }
}

// EDIT
export async function editProperty(id: string, { title, description, tags, price, location }: Property): Promise<Property | false> {
    const property = findOneProperty(id)

    if (!property) return false

    if (title || description || tags || price || location) {
        const { rows } = await pool.query(
            'UPDATE properties SET title = $1, description = $2, tags = $3, price = $4, location = $5 WHERE id = $6 RETURNING *',
            [title, description, tags, price, location, id]
        )

        return rows[0]
    }

    return {} as Property
}

// DELETE
export async function deleteProperty(id: string) {
}