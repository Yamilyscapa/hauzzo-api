import express from 'express'
import { config as dotenv } from 'dotenv'
import router from './routes/'
import jsonParser from './middleware/jsonParser'
import path from 'path'
// Types
import type { Application, NextFunction, Request, Response } from 'express'
import multer from 'multer'

// Initializations
dotenv()
const app: Application = express();

// Middleware with error validation
app.use((req: Request, res: Response, next: NextFunction) => jsonParser(express.json, req, res, next))

// Router
app.use(router)

// Static files
app.use(express.static(path.join(__dirname, 'public')))

// Constants
const PORT = process.env.PORT || 8080

// Server
app.listen(PORT, () => {
    console.log('Server listening on port:', PORT);
})