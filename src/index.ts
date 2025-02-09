import express from 'express'
import { config as dotenv } from 'dotenv'
import router from './routes/'
// Types
import type { Application } from 'express'

// Initializations
dotenv()
const app: Application = express();

// Middleware
app.use(express.json())
// Router
app.use(router)

// Constants
const PORT = process.env.PORT || 8080

// Server
app.listen(PORT, () => {
    console.log('Server listening on port:', PORT);
})