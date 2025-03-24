import { pool } from "../database/client";
import { Property } from "../types/global";
import { getBrokerById } from './brokerController'
import { validate } from 'uuid'
import axios from "axios";

interface stdRes {
    data: any,
    error: any
}

export async function handleImagesUpload(images: Express.Multer.File[]): Promise<stdRes> {
    let response: stdRes = {
        data: null,
        error: null
    }

    try {
        const body = new FormData()

        // Append each image to the body
        images.forEach(image => {
            const blob = new Blob([image.buffer], { type: image.mimetype })
            body.append(image.fieldname, blob, image.originalname)
        })

        const { HOST, PORT } = process.env ?? ''
        const ENDPOINT = 'upload/images/property'
        const URL = `${HOST}:${PORT}/${ENDPOINT}`

        const res = await axios.post(URL, body, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })

        response.data = res.data.data
        return response
    } catch (error) {
        response.error = error
        return response
    }
}


// GET
export async function findManyProperties(limit?: number): Promise<stdRes> {
    let response: stdRes = {
        data: null,
        error: null
    }

    try {
        let query = 'SELECT * FROM properties'
        if (limit) query += ` LIMIT ${limit}`

        const { rows: properties } = await pool.query(query)
        response.data = properties

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
        data: null,
        error: null
    }

    try {
        const { rows: data } = await pool.query('SELECT * FROM properties WHERE id = $1', [id])
        response.data = data[0]

        return response
    } catch (error) {
        response.error = error
        return response
    }
}

// POST
export async function createProperty(property: Property, brokerId: string): Promise<stdRes> {
    let response: stdRes = {
        data: null,
        error: null
    }

    try {
        let {
            title,
            description,
            price,
            tags,
            bedrooms,
            bathrooms,
            parking,
            type,
            location,
            transaction
        } = property;
        const requiredFields = ['title', 'description', 'price', 'tags', 'bedrooms', 'bathrooms', 'parking', 'type', 'transaction']

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
        const locationRequiredFields = ['address', 'city', 'state', 'zip']
        const locationJson = JSON.parse(location as any)

        const includesAll = locationRequiredFields.every(field => Object.keys(locationJson).includes(field))

        if (!includesAll) {
            response.error = 'Missing location data (address, city, state, zip)'
            return response
        }

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
        (title, description, price, tags, bedrooms, bathrooms, parking, location, type, broker_id, transaction) 
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
                brokerId,
                transaction
            ]
        );

        if (!rows[0]) {
            response.error = 'Error creating data'
            return response
        }

        response.data = rows[0]
        return response
    } catch (error) {
        response.error = error
        return response
    }
}

// EDIT
export async function editProperty(id: string, { title, description, tags, price, location }: Property): Promise<stdRes> {
    let response: stdRes = {
        data: null,
        error: null
    }

    if (!validate(id)) {
        response.error = 'Invalid data ID'
        return response
    }

    const { data: property, error } = await findOneProperty(id)
    const data = property as Property

    if (error) {
        response.error = error
        return response
    } else if (!data) {
        response.error = 'data not found'
        return response
    }

    try {
        // Convert to key - values to make dynacmic the query
        const currentdata = {
            "title": title,
            "description": description,
            "tags": tags,
            "price": price,
            "location": location
        }

        const currentLocation: Property['location'] = {
            address: data.location.address,
            addressNumber: data.location.addressNumber,
            street: data.location.street,
            neighborhood: data.location.neighborhood,
            city: data.location.city,
            state: data.location.state,
            zip: data.location.zip,
        }

        const queryValues: (string | null)[] = Object.entries(currentdata)
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
                    if (!Array.isArray(data)) {

                        function getCommonKeys(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
                            return Object.keys(obj1)
                                .filter(key => key in obj2)
                                .reduce((acc, key) => {
                                    acc[key] = obj1[key];
                                    return acc;
                                }, {} as Record<string, any>);
                        }

                        const newLocation = getCommonKeys(currentLocation, value as Property['location'])

                        if (Object.keys(data.location).length === 0) return null
                        value = JSON.stringify({ ...data.location, ...(newLocation) })
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

        response.data = rows[0]
        return response
    } catch (error) {
        response.error = error
        return response
    }
}

export async function updatePropertyImages(id: string, images: string[]) {
    const response: stdRes = {
        data: null,
        error: null
    }
    
    if (!validate(id)) {
        response.error = 'Invalid data ID'
        return response
    }

    if (!images) {
        response.error = 'No images to update'
        return response
    }

    try {
        const query = {
            text: `UPDATE properties SET images = $1 WHERE id = $2 RETURNING *`,
            values: [images, id]
        }
        const { rows } = await pool.query(query)

        if (!rows[0]) {
            response.error = 'Error updating data'
            return response
        }

        response.data = rows[0]
        return response
    } catch (error) {
        response.error = error
        return response
    }

}

// DELETE
export async function deletedata(id: string) {
}