import { pool } from '../database/client'
import { User, Broker, Error } from '../types/global'
import { hashPassword } from '../utils/passwordHash'
import { UserType } from '../types/global'
import errorHelper from '../helpers/errorHelper'

export async function findUser(id: string, role: UserType): Promise<User | Broker | Error> {
    if (!id) return errorHelper('User ID is required', 400)

    if (role !== 'user' && role !== 'broker') return errorHelper('Invalid role', 400)
    
    const table = role === 'user' ? 'users' : 'brokers'
    
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1;`, [id])
    
    if (!rows[0]) return errorHelper('User not found', 404)
    
    return rows[0]
}

export async function createUser(user: User): Promise<User | null> {
    let response = { user: null, error: null }
    
    // Check if all fields are filled
    if (!user.firstName || !user.lastName || !user.email || !user.password || !user.role) {
        console.error('All fields are required');
        return null
    };

    const role = user.role === 'user' ? 'users' : 'brokers'

    // Check if user already exists
    const userExists = await findUser(user.id, user.role)

    if (!userExists) {
        console.error('User already exists');
        return null
    }

    // Hash password
    const hashedPassword = await hashPassword(user.password)

    // Create user
    const { rows } = await pool.
        query(
            `INSERT INTO ${role} (first_name, last_name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
            [user.firstName, user.lastName, user.email, user.phone, hashedPassword, user.role])

    // Return user            
    const newUser: User = rows[0]
            
    return newUser
}