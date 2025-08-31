import { pool } from '../database/client'
import { validate as validateUUID } from 'uuid'
import validateEmail from '@shared/emailValidation.'

interface StdRes {
  data: any
  error: any
}

type CreateLeadInput = {
  propertyId: string
  email?: string
  phone?: string
  brokerId?: string // Optional; if provided, must match property's broker
}

/**
 * Create a lead linked to a property and broker (derived from property).
 * If a lead with the same email/phone already exists for the broker,
 * it will reuse it and link it to the property.
 */
export async function createLead(input: CreateLeadInput): Promise<StdRes> {
  const response: StdRes = { data: null, error: null }

  try {
    const { propertyId, email, phone, brokerId } = input

    // Basic validation
    if (!propertyId || !validateUUID(propertyId)) {
      response.error = 'Invalid or missing propertyId'
      return response
    }

    if (!email && !phone) {
      response.error = 'At least one of email or phone is required'
      return response
    }

    if (email && !validateEmail(email)) {
      response.error = 'Invalid email format'
      return response
    }

    // 1) Ensure property exists and get its broker_id
    const propertyQuery = {
      text: 'SELECT id, broker_id FROM properties WHERE id = $1',
      values: [propertyId],
    }

    const { rows: propRows } = await pool.query(propertyQuery)
    if (propRows.length === 0) {
      response.error = 'Property not found'
      return response
    }

    const property = propRows[0] as { id: string; broker_id: string }

    if (brokerId && brokerId !== property.broker_id) {
      response.error = 'Provided brokerId does not match property owner'
      return response
    }

    const effectiveBrokerId = property.broker_id

    // 2) Insert or reuse lead per-broker uniqueness (email/phone)
    // Try to find existing by email or phone first
    let leadId: string | null = null

    if (email) {
      const { rows } = await pool.query(
        'SELECT id FROM leads WHERE broker_id = $1 AND lead_email = $2',
        [effectiveBrokerId, email]
      )
      if (rows[0]) leadId = rows[0].id
    }

    if (!leadId && phone) {
      const { rows } = await pool.query(
        'SELECT id FROM leads WHERE broker_id = $1 AND lead_phone = $2',
        [effectiveBrokerId, phone]
      )
      if (rows[0]) leadId = rows[0].id
    }

    // Create lead if not found
    if (!leadId) {
      try {
        const insertLead = {
          text: 'INSERT INTO leads (broker_id, lead_email, lead_phone) VALUES ($1, $2, $3) RETURNING id, broker_id, lead_email, lead_phone, created_at',
          values: [effectiveBrokerId, email || null, phone || null],
        }
        const { rows } = await pool.query(insertLead)
        leadId = rows[0].id
      } catch (err: any) {
        // Handle unique violation (duplicate by email/phone per broker)
        if (err && err.code === '23505') {
          // Re-select existing lead (try both keys)
          const { rows } = await pool.query(
            `SELECT id FROM leads 
             WHERE broker_id = $1 AND (lead_email = $2 OR lead_phone = $3)
             LIMIT 1`,
            [effectiveBrokerId, email || null, phone || null]
          )
          if (rows[0]) {
            leadId = rows[0].id
          } else {
            response.error =
              'Duplicate lead detected but could not resolve existing record'
            return response
          }
        } else {
          response.error = err
          return response
        }
      }
    } else {
      // If lead exists but missing one of email/phone, try to enrich it
      if (email || phone) {
        try {
          await pool.query(
            `UPDATE leads
             SET lead_email = COALESCE(lead_email, $2),
                 lead_phone = COALESCE(lead_phone, $3)
             WHERE id = $1`,
            [leadId, email || null, phone || null]
          )
        } catch (_) {
          // Ignore enrichment conflicts
        }
      }
    }

    // 3) Link lead to property (idempotent)
    await pool.query(
      `INSERT INTO lead_properties (lead_id, property_id)
       VALUES ($1, $2)
       ON CONFLICT (lead_id, property_id) DO NOTHING`,
      [leadId, propertyId]
    )

    // 4) Load and return lead with linked properties
    const { rows: leadRows } = await pool.query(
      `SELECT l.id, l.broker_id, l.lead_email, l.lead_phone, l.created_at,
              ARRAY(SELECT lp.property_id FROM lead_properties lp WHERE lp.lead_id = l.id) AS property_ids
         FROM leads l
        WHERE l.id = $1`,
      [leadId]
    )

    response.data = leadRows[0]
    return response
  } catch (error) {
    response.error = error
    return response
  }
}

export async function listLeadsForBroker(
  brokerId: string,
  search?: string
): Promise<StdRes> {
  const response: StdRes = { data: null, error: null }
  try {
    if (!brokerId) {
      response.error = 'Missing brokerId'
      return response
    }

    const params: any[] = [brokerId]
    let where = 'WHERE l.broker_id = $1'

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`)
      params.push(`%${search.trim()}%`)
      where += ` AND (l.lead_email ILIKE $${params.length - 1} OR l.lead_phone ILIKE $${params.length})`
    }

    const query = {
      text: `SELECT 
              l.id,
              l.broker_id,
              l.lead_email,
              l.lead_phone,
              l.created_at,
              COUNT(lp.property_id) AS properties_count,
              ARRAY_AGG(DISTINCT lp.property_id) FILTER (WHERE lp.property_id IS NOT NULL) AS property_ids,
              COALESCE(
                JSON_AGG(DISTINCT JSONB_BUILD_OBJECT('id', p.id, 'title', p.title))
                FILTER (WHERE p.id IS NOT NULL), '[]'::json
              ) AS properties
            FROM leads l
            LEFT JOIN lead_properties lp ON lp.lead_id = l.id
            LEFT JOIN properties p ON p.id = lp.property_id
            ${where}
            GROUP BY l.id
            ORDER BY COALESCE(l.created_at, NOW()) DESC
            LIMIT 500`,
      values: params,
    }

    const { rows } = await pool.query(query)
    response.data = rows
    return response
  } catch (error) {
    response.error = error
    return response
  }
}
