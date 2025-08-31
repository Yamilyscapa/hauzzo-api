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
// Read allowed origins from a single comma-separated env var: ALLOED_ORIGINS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    // Allow non-browser requests (no origin) and any explicitly allowed origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(null, false)
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}

app.use(cors(corsOptions))
// Explicitly handle preflight for all routes (Express 5: avoid '*' pattern)
app.options(/.*/, cors(corsOptions))

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
