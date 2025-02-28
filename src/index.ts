import express from 'express'
import { config as dotenv } from 'dotenv'
import router from './routes/'
import jsonParser from './middleware/jsonParser'
// Types
import type { Application, NextFunction, Request, Response } from 'express'

// Initializations
dotenv()
const app: Application = express();

// Middleware with error validation
app.use((req: Request, res: Response, next: NextFunction) => jsonParser(express.json, req, res, next))

// Router
app.use(router)

// Constants
const PORT = process.env.PORT || 8080

// Server
app.listen(PORT, () => {
    console.log('Server listening on port:', PORT);
})