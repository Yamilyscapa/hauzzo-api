import { Error } from "../types/global"

export default function errorHelper(message: string, status: number = 400) { 
    return {
        message,
        status
    } as Error
}