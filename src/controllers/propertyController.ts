import { pool } from "../database/client";
import { Property } from "../types/global";

// GET
export async function findManyProperties(limit?: number | undefined) {
    let properties

    if (limit === undefined) {
        properties = { rows: properties } = await pool.query('SELECT * FROM properties')
    } else {
        properties = { rows: properties } = await pool.query('SELECT * FROM properties LIMIT $1', [limit])
    }

    return properties
}


export async function findOneProperty(id: string) {
    const { rows: property } = await pool.query('SELECT * FROM properties WHERE id = $1', [id])
    return property
}

// POST
export async function createProperty({ title, description, tags, price, brokerId, type, location }: Property) {
    if (!title || !description || !tags || !price || !brokerId || !type || !location) return false;

    const { rows } = await pool.query(
        'INSERT INTO properties (title, description, tags, price, broker_id, type, location) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [title, description, tags, price, brokerId, type, location]
    )

    return rows[0]
}

// EDIT
export async function editProperty(id: string) {
}

// DELETE
export async function deleteProperty(id: string) {
}