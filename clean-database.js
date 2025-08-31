const { Pool } = require('pg')

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hauzzo',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
})

async function cleanDatabase() {
  const client = await pool.connect()

  try {
    console.log('🧹 Iniciando limpieza de la base de datos...')

    // Obtener lista de tablas
    const tablesResult = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      ORDER BY tablename;
    `)

    const tables = tablesResult.rows.map((row) => row.tablename)

    if (tables.length === 0) {
      console.log('ℹ️ No hay tablas para limpiar')
      return
    }

    console.log(`📋 Tablas encontradas: ${tables.join(', ')}`)

    // Deshabilitar triggers temporalmente
    await client.query('SET session_replication_role = replica;')

    // Limpiar todas las tablas en orden correcto (evitando problemas de FK)
    const cleanOrder = [
      'lead_properties',
      'leads',
      'user_saved_properties',
      'properties',
      'refresh_tokens',
      'brokers',
      'users',
    ]

    for (const table of cleanOrder) {
      if (tables.includes(table)) {
        try {
          await client.query(
            `TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE;`
          )
          console.log(`✅ Tabla ${table} limpiada`)
        } catch (error) {
          console.log(`⚠️ No se pudo limpiar ${table}: ${error.message}`)
        }
      }
    }

    // Rehabilitar triggers
    await client.query('SET session_replication_role = DEFAULT;')

    console.log('🎉 Base de datos limpiada exitosamente!')
    console.log('💡 Ahora puedes ejecutar el seed: npm run seed')
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar la limpieza si se llama directamente
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log('✅ Limpieza completada')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error en la limpieza:', error)
      process.exit(1)
    })
}

module.exports = { cleanDatabase }
