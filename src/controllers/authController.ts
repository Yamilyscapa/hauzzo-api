import { pool } from '../database/client'
import { User, Broker, Error } from '../types/global'
import { hashPassword } from '../utils/passwordHash'

export async function createUser(user: User): Promise<{user: User | null, error: Error | null}> {
    // Check if all fields are filled
    if (!user.firstName || !user.lastName || !user.email || !user.password || !user.role) {
        return <{user: User | null, error: Error}>{
            user: null,
            error: {
                message: 'All fields are required',
                status: 400
            }
        }
    };

    // Check if user already exists
    const userAlreadyExists = await pool.query(`SELECT * FROM users WHERE email = $1`, [user.email])

    if (userAlreadyExists.rows.length > 0) {
        return <{user: User | null, error: Error}>{
            user: null,
            error: {
                message: 'User already exists',
                status: 400
            },
        }
    }

    // Hash password
    const hashedPassword = await hashPassword(user.password)

    // Create user
    const { rows } = await pool.
        query(
            `INSERT INTO users (first_name, last_name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [user.firstName, user.lastName, user.email, user.phone, hashedPassword, user.role])

    // Return user            
    const newUser: User = rows[0]

    return {
        user: newUser,
        error: null
    }
}