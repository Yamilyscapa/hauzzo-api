import express from 'express'
import { config as dotenv } from 'dotenv'
import router from './routes/'
import { db } from './database/client'
// Types
import type { Application } from 'express'

// Initializations
dotenv()
const app: Application = express();

// Router
app.use(router)

// Constants
const PORT = process.env.PORT || 8080

// Server
app.listen(PORT, () => {
    console.log('Server listening on port:', PORT);
})