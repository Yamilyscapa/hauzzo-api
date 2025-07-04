import { pool } from '../database/client'
import { Property } from '@shared/global'

interface StdRes<T> {
    data?: T
    error?: string
}

export async function findPropertyByTags(tags: string[]): Promise<StdRes<Property[]>> {
    const query = `
    SELECT * FROM properties
    WHERE tags && $1::text[]
  `
    const values = [tags]

    try {
        const { rows } = await pool.query(query, values)
        return { data: rows as Property[] }
    } catch (error) {
        console.error('Error executing query', error)
        return { error: 'Database query failed' }
    }
}

export async function findPropertyByDescription(description: string): Promise<StdRes<Property[]>> {
    const query = `
    SELECT * FROM properties
    WHERE description ILIKE $1
  `
    const values = [`%${description}%`]

    try {
        const { rows } = await pool.query(query, values)
        return { data: rows as Property[] }
    } catch (error) {
        console.error('Error executing query', error)
        return { error: 'Database query failed' }
    }
}