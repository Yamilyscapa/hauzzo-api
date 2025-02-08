import { Response } from "express";

export function successResponse(res: Response, data: object, message: string = "Successful request", statusCode: number = 200) {
    return res.status(statusCode).json({
        status: 'success',
        message,
        data
    })
}

export function errorResponse(res: Response, message: string = "Something went wrong", statusCode: number = 500, error?: any) {
    return res.status(statusCode).json({
        status: 'error',
        message,
        error
    })
}