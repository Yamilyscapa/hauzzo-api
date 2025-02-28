import { Response } from "express";

interface Res {
    status: string,
    message: string,
    data?: object,
    error?: any
}

export function successResponse(res: Response, data: object, message: string = "Successful request", statusCode: number = 200) {
    const response: Res = {
        status: 'Success',
        message,
        data
    }

    return res.status(statusCode).json(response)
}


export function errorResponse(res: Response, message: string = "Something went wrong", statusCode: number = 500, error?: any) {
    const response: Res = {
        status: 'Error',
        message,
        error
    }
    
    return res.status(statusCode).json(response)
}