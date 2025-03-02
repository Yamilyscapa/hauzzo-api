import { pool } from "../database/client";
import { Property } from "../types/global";
import { getBrokerById } from './brokerController'
import { validate } from 'uuid'

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
export async function editProperty(id: string, { title, description, tags, price, location }: Property): Promise<stdRes> {
    let response: stdRes = {
        property: null,
        error: null
    }

    if (!validate(id)) {
        response.error = 'Invalid property ID'
        return response
    }

    const { property, error } = await findOneProperty(id)

    if (error) {
        response.error = error
        return response
    } else if (!property) {
        response.error = 'Property not found'
        return response
    }

    try {
        // Convert to key - values to make dynacmic the query
        const currentProperty = {
            "title": title,
            "description": description,
            "tags": tags,
            "price": price,
            "location": location
        }

        const queryValues: (string | null)[] = Object.entries(currentProperty)
            .map(([key, value]) => {
                // Validate value is not empty
                if (value === " ") {
                    response.error = `Value for ${key} cannot be empty`
                    return null
                }

                if (!value) return null

                // Convert tags to JSON string to store in Postgres
                if (key === "tags") {
                    value = JSON.stringify(value).replace("[", "{").replace("]", "}")
                }

                // Merge location data without overwriting the rest of the location data
                if (key === "location") {
                    if (!Array.isArray(property)) {

                        function getCommonKeys(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
                            return Object.keys(obj1)
                                .filter(key => key in obj2)
                                .reduce((acc, key) => {
                                    acc[key] = obj1[key];
                                    return acc;
                                }, {} as Record<string, any>);
                        }

                        const newLocation = getCommonKeys(property.location, value as object)

                        if (Object.keys(property.location).length === 0) return null
                        value = JSON.stringify({ ...property.location, ...(newLocation) })
                    }
                }

                return `${key} = '${value}'`
            })

        const queryValuesNotNull = queryValues.filter(value => value !== null)

        // If no values to update, return error
        if (queryValuesNotNull.length === 0) {
            response.error = 'No values to update'
            return response
        }

        const query = {
            text: `UPDATE properties SET ${queryValuesNotNull.join(', ')} WHERE id = $1 RETURNING *`,
            values: [id]
        }

        const { rows } = await pool.query(query)

        response.property = rows[0]
        return response
    } catch (error) {
        response.error = error
        return response
    }
}

// DELETE
export async function deleteProperty(id: string) {
}