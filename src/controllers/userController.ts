import { pool } from '../database/client';

export async function getUserById(id: string) {
    try {
        const query = {
            text: 'SELECT * FROM users WHERE id = $1',
            values: [id]
        }

        const { rows } = await pool.query(query)

        if (rows.length === 0) return false

        return rows[0]
    }
    catch (error) {
        console.error(error);
        return error
    }
}

export async function getUserByEmail(email: string) {
    try {
        const query = {
            text: 'SELECT * FROM users WHERE email = $1',
            values: [email]
        }

        const { rows } = await pool.query(query)

        if (rows.length === 0) return false

        return rows[0]
    }
    catch (error) {
        console.error(error);
        return error
    }
}