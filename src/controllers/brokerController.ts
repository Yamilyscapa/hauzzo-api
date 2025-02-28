import { pool } from '../database/client';
import { Broker } from '../types/global';
import { hashPassword } from '../utils/passwordHash'

interface stdRes {
    broker: Broker | null,
    error: any
}

export async function createBroker(body: Broker): Promise<stdRes> {
    let response: stdRes = {
        broker: null,
        error: null
    }
    const ROLE = 'broker'

    try {
        const { firstName, lastName, email, phone, password } = body
        const hashedPassword = await hashPassword(password)

        // Check if the required fields are present 
        if (!firstName || !lastName || !email || !password) {
            throw new Error('Missing required fields')
        }

        // Check if the user already exists
        const brokerAlreadyExists = await getBrokerByEmail(email)

        if (brokerAlreadyExists.broker) {
            throw new Error('Broker already exists, email already in use')
        }

        const query = {
            text: 'INSERT INTO brokers (first_name, last_name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            values: [firstName, lastName, email, phone, hashedPassword, ROLE]
        }

        const { rows } = await pool.query(query)

        response.broker = rows[0]
        response.error = null
        return response
    } catch (error: Error | any) {
        response.broker = null
        response.error = error
        return response
    }
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

export async function getBrokerByEmail(email: string): Promise<stdRes> {
    let response = {} as stdRes

    try {
        const query = {
            text: 'SELECT * FROM brokers WHERE email = $1',
            values: [email]
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