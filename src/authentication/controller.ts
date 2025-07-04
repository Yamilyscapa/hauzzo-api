import { getBrokerByEmail } from '../brokers/controller'
import { comparePassword } from '@shared/passwordHash'
import { Broker } from '@shared/global'

// Standarize the response of the service functions
interface stdRes {
  broker: Broker | null
  error: any
}

export async function auth(email: string, password: string): Promise<stdRes> {
  let response = {
    broker: null,
    error: null,
  } as stdRes

  const { broker, error } = await getBrokerByEmail(email)

  if (error) {
    response.error = `Error fetching broker by email: ${error}`
    return response
  }

  if (!broker) {
    response.error = 'No broker found with the provided email'
    return response
  }

  const isPasswordValid = await comparePassword(password, broker.password)

  if (isPasswordValid) {
    response.broker = broker
    response.error = null
    return response
  }

  throw new Error('The provided password is incorrect')
}
