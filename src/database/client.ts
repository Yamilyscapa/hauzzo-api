import pg from 'pg'
const { Pool } = pg
import { config as dotenv } from 'dotenv'

dotenv()

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: <number>(process.env.DB_PORT || 0)
})

async function testConnection() {
   try {
    await pool.connect();
    console.log("✅ Conectado a PostgreSQL");

    // Verificar si la tabla existe
    const res = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"
    );
  } catch (error) {
    console.error("❌ Error en la conexión:", error);
  }
}

testConnection();