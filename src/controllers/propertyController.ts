import { pool } from "../database/client";
import { Property } from "../types/global";
import { findUser } from './authController'

// GET
export async function findManyProperties(limit?: number) {
    if (limit) {
        const { rows } = await pool.query('SELECT * FROM properties LIMIT $1', [limit])
        return rows
    } else {
        const { rows } = await pool.query('SELECT * FROM properties')
        return rows
    }
}

export async function findOneProperty(id: string) {
    const { rows: property } = await pool.query('SELECT * FROM properties WHERE id = $1', [id])
    return property
}

// POST
export async function createProperty(property: Property) {
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
            brokerId
        } = property as Property;

        // Validate that all of the data is present
        for (const key in property) {
            if (!property[key as keyof Property]) return
        }

        // Validate that address is present
        for (const key in location) {
            if (!location[key as keyof typeof location]) return false
        }

        // Validate that the broker exists
        const user = await findUser(brokerId, 'broker')

        if (!user) return false

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
            return null
        }

        return rows[0]
    } catch (error) {
        return error
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