import { Response } from "express";

interface Res {
    status: string,
    message: string,
    data?: object,
    error?: any
}

export function successResponse(res: Response, data: object, message: string = "Successful request", statusCode: number = 200) {
    return res.status(statusCode).json(<Res>{
        status: 'success',
        message,
        data
    })
}

export function errorResponse(res: Response, message: string = "Something went wrong", statusCode: number = 500, error?: any) {
    return res.status(statusCode).json(<Res>{
        status: 'error',
        message,
        error
    })
}