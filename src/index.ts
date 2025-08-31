import express from 'express'
import { config as dotenv } from 'dotenv'
import router from './routes/'
import jsonParser from '@shared/jsonParser'
import path from 'path'
import cors from 'cors'
import cookieParser from 'cookie-parser'

// Types
import type { Application, NextFunction, Request, Response } from 'express'

// Initializations
dotenv()
const app: Application = express()

// JSON parser
app.use((req: Request, res: Response, next: NextFunction) =>
  jsonParser(express.json, req, res, next)
)

// Cookie parser middleware
app.use(cookieParser())

// CORS
app.use(
  cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
)

// Router
app.use(router)

// Static files
app.use('/public', express.static(path.join(__dirname, 'public/upload')))

// Constants
const PORT = process.env.PORT || 8080

// Server
app.listen(PORT, () => {
  console.log('Server listening on port:', PORT)
})
