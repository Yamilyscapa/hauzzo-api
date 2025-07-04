import { pool } from '../database/client'
import { Broker } from '@shared/global'
import { hashPassword } from '@shared/passwordHash'
import validateEmail from '@shared/emailValidation.'
import validatePassword from '@shared/passwordValidation'
import { v4 as uuid4 } from 'uuid'

// Standarize the response of the service functions
interface stdRes {
  broker: Broker | null
  error: any
}

export async function createBroker(body: Broker): Promise<stdRes> {
  let response: stdRes = {
    broker: null,
    error: null,
  }

  // Define the role of the broker
  const ROLE = 'broker'

  try {
    const { firstName, lastName, email, phone, password } = body
    const generatedId = uuid4() // Generate a unique ID for the broker    

    // Check if the required fields are present
    if (!firstName || !lastName || !email || !password) {
      throw new Error('Missing required fields')
    }

    if (email && !validateEmail(email)) {
      throw new Error('Invalid email format')
    }

    //  Validate password
    if (!validatePassword(password)) {
      throw new Error(
        'Invalid password format; Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
      )
    }

    const hashedPassword = await hashPassword(password)

    // Check if the user already exists
    const brokerAlreadyExists = await getBrokerByEmail(email)

    if (brokerAlreadyExists.broker) {
      throw new Error('Broker already exists, email already in use')
    }

    const query = {
      text: 'INSERT INTO brokers (first_name, last_name, email, phone, password, role, id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      values: [firstName, lastName, email, phone, hashedPassword, ROLE, generatedId],
    }

    console.log(query);
    

    const { rows } = await pool.query(query)

    console.log(query);
    

    response.broker = rows[0]
    response.error = null
    return response
  } catch (error: Error | any) {
    response.broker = null
    response.error = error
    return response
  }
}

export async function editBroker(
  id: string,
  { firstName, lastName, email, phone, password }: Broker
): Promise<stdRes> {
  let response: stdRes = {
    broker: null,
    error: null,
  }

  // Convert to key - values to make dynacmic the query
  const currentBroker = {
    first_name: firstName,
    last_name: lastName,
    email: email,
    phone: phone,
    password: password,
  }

  try {
    const queryValues: (string | null)[] = Object.entries(currentBroker).map(
      ([key, value]) => {
        if (key === 'email') {
          if (value && !validateEmail(value))
            throw new Error('Invalid email format')
        }

        if (key === 'password') {
          if (value && !validatePassword(value))
            throw new Error(
              'Invalid password format; Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character'
            )
        }

        if (value === ' ') {
          throw new Error(`Value for ${key} cannot be empty`)
        }

        if (!value) return null

        return `${key} = '${value}'`
      }
    )

    const queryValuesNotNull = queryValues.filter((value) => value !== null)

    const query = {
      text: `UPDATE brokers SET ${queryValuesNotNull.join(', ')} WHERE id = $1 RETURNING *`,
      values: [id],
    }

    const { rows } = await pool.query(query)

    response.broker = rows[0]
    response.error = null

    return response
  } catch (error) {
    response.broker = null
    response.error = error
    return response
  }
}

export async function getBrokerById(id: string): Promise<stdRes> {
  let response: stdRes = {
    broker: null,
    error: null,
  }

  try {
    console.log('getBrokerById - Received ID:', id);
    const query = {
      text: 'SELECT * FROM brokers WHERE id = $1',
      values: [id],
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
      values: [email],
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
