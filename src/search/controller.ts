import { pool } from '../database/client'
import { Property } from '@shared/global'

interface StdRes<T> {
  data?: T
  error?: string
}

export async function findPropertyByTags(
  tags: string[]
): Promise<StdRes<Property[]>> {
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

export async function findPropertyByDescription(
  description: string
): Promise<StdRes<Property[]>> {
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

// Advanced search function using full-text search with dynamic filters
export async function searchProperties(
  query: string,
  filters: {
    transaction?: 'rent' | 'sale'
    type?: 'house' | 'apartment'
    min_price?: number
    max_price?: number
    min_bedrooms?: number
    max_bedrooms?: number
    city?: string
    state?: string
  } = {}
): Promise<StdRes<Property[]>> {
  try {
    // Build dynamic WHERE clause
    const conditions: string[] = []
    const values: any[] = []
    let paramIndex = 1

    // Always include the search_vector condition (required)
    conditions.push(
      `search_vector @@ plainto_tsquery('spanish', $${paramIndex})`
    )
    values.push(query)
    paramIndex++

    // Add optional filters
    if (filters.transaction) {
      conditions.push(`transaction = $${paramIndex}`)
      values.push(filters.transaction)
      paramIndex++
    }

    if (filters.type) {
      conditions.push(`type = $${paramIndex}`)
      values.push(filters.type)
      paramIndex++
    }

    if (filters.min_price !== undefined) {
      conditions.push(`price >= $${paramIndex}`)
      values.push(filters.min_price)
      paramIndex++
    }

    if (filters.max_price !== undefined) {
      conditions.push(`price <= $${paramIndex}`)
      values.push(filters.max_price)
      paramIndex++
    }

    if (filters.min_bedrooms !== undefined) {
      conditions.push(`bedrooms >= $${paramIndex}`)
      values.push(filters.min_bedrooms)
      paramIndex++
    }

    if (filters.max_bedrooms !== undefined) {
      conditions.push(`bedrooms <= $${paramIndex}`)
      values.push(filters.max_bedrooms)
      paramIndex++
    }

    if (filters.city) {
      conditions.push(`location ->> 'city' ILIKE $${paramIndex}`)
      values.push(`%${filters.city}%`)
      paramIndex++
    }

    if (filters.state) {
      conditions.push(`location ->> 'state' ILIKE $${paramIndex}`)
      values.push(`%${filters.state}%`)
      paramIndex++
    }

    // Add active filter to only show active properties
    conditions.push('active = true')

    // Build final query with ranking
    const finalQuery = `
      SELECT 
        *,
        ts_rank_cd(search_vector, plainto_tsquery('spanish', $1)) AS rank
      FROM properties
      WHERE ${conditions.join(' AND ')}
      ORDER BY rank DESC, id DESC
      LIMIT 20
    `

    const { rows } = await pool.query(finalQuery, values)
    return { data: rows as Property[] }
  } catch (error) {
    console.error('Error executing search query:', error)
    return { error: 'Database query failed' }
  }
}
