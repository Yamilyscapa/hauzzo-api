import { Error } from './global'

export default function errorHelper(message: string, status: number = 400) {
  console.log(message)

  return {
    message,
    status,
  } as Error
}
