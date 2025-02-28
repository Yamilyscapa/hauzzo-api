import { pool } from '../database/client';
import { Broker } from '../types/global';

interface stdRes {
    broker: Broker | null,
    error: any
}

export async function getBrokerById(id: string): Promise<stdRes> {
    let response = {} as stdRes

    try {
        const query = {
            text: 'SELECT * FROM brokers WHERE id = $1',
            values: [id]
        }

        const { rows } = await pool.query(query)

        // Return an object with the user and error to handle the response in the controller 
        if (rows.length === 0) {
            response.broker = null
            response.error = false
        } else {
            response.broker = rows[0]
            response.error = false
        }

        return response
    } catch (error: Error | any) {
        response.broker = null
        response.error = error

        return response
    }
}

export async function getBrokerByEmail(email: string): Promise<{ user: Broker | null, error: any }> {
    try {
        const query = {
            text: 'SELECT * FROM brokers WHERE email = $1',
            values: [email]
        }

        const { rows } = await pool.query(query)

        // Return an object with the user and error to handle the response in the controller 
        if (rows.length === 0) return { user: null, error: false }

        return { user: rows[0], error: false }
    } catch (error) {
        if (error instanceof Error) {
            return { user: null, error: error.message }
        } else {
            return { user: null, error }
        }
    }
}