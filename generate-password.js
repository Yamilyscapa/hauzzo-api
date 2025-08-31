const bcrypt = require('bcrypt')

async function generateHash(password) {
  const saltRounds = 10
  const hash = await bcrypt.hash(password, saltRounds)
  console.log(`Contraseña: ${password}`)
  console.log(`Hash: ${hash}`)
  return hash
}

// Generar hash para la contraseña por defecto
generateHash('password123')
  .then(() => {
    console.log('\n✅ Hash generado exitosamente')
    console.log('💡 Copia este hash al archivo seed-properties.js')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error generando hash:', error)
    process.exit(1)
  })
