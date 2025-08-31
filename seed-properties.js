const { Pool } = require('pg')

// Configuración de la base de datos
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'hauzzo',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
})

// Datos de prueba para brokers (si no existen)
const sampleBrokers = [
  {
    first_name: 'María',
    last_name: 'González',
    email: 'maria.gonzalez@hauzzo.com',
    phone: '+52 55 1234 5678',
    password: '$2b$10$rQZ8K9mN2pL7sT4vX6yQ1wE3rT5yU8i9o0p1q2r3s4t5u6v7w8x9y0z', // "password123"
    role: 'broker',
    admin: true,
  },
  {
    first_name: 'Carlos',
    last_name: 'Rodríguez',
    email: 'carlos.rodriguez@hauzzo.com',
    phone: '+52 55 9876 5432',
    password: '$2b$10$rQZ8K9mN2pL7sT4vX6yQ1wE3rT5yU8i9o0p1q2r3s4t5u6v7w8x9y0z', // "password123"
    role: 'broker',
    admin: false,
  },
]

// Datos de prueba para propiedades
const sampleProperties = [
  {
    title: 'Casa moderna en Polanco',
    description:
      'Hermosa casa de 3 recámaras en una de las zonas más exclusivas de la Ciudad de México. Cuenta con acabados de lujo, cocina equipada y terraza privada.',
    price: 8500000,
    tags: ['moderna', 'exclusiva', 'lujo', 'terraza', 'cocina equipada'],
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    transaction: 'sale',
    location: {
      zip: '11560',
      city: 'Ciudad de México',
      state: 'CDMX',
      street: 'Av. Presidente Masaryk',
      address: 'Av. Presidente Masaryk 123',
      neighborhood: 'Polanco',
      addressNumber: '123',
    },
    type: 'house',
    images: [
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1582407947304-fd87fbe76ec6?w=1200&f=webp&q=80',
    ],
    active: true,
  },
  {
    title: 'Departamento en Condesa',
    description:
      'Acogedor departamento de 2 recámaras en el corazón de la Condesa. Perfecto para jóvenes profesionales, con amenidades y transporte público a la vuelta.',
    price: 3500000,
    tags: ['acogedor', 'céntrico', 'amenidades', 'transporte público'],
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    transaction: 'sale',
    location: {
      zip: '06140',
      city: 'Ciudad de México',
      state: 'CDMX',
      street: 'Av. Tamaulipas',
      address: 'Av. Tamaulipas 456',
      neighborhood: 'Condesa',
      addressNumber: '456',
    },
    type: 'apartment',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&f=webp&q=80',
    ],
    active: true,
  },
  {
    title: 'Casa en renta en San Miguel',
    description:
      'Casa familiar de 4 recámaras disponible en renta. Amplio jardín, cochera para 3 autos y ubicación privilegiada cerca de escuelas y centros comerciales.',
    price: 25000,
    tags: [
      'familiar',
      'jardín',
      'amplia',
      'cochera múltiple',
      'cerca de escuelas',
    ],
    bedrooms: 4,
    bathrooms: 3,
    parking: 3,
    transaction: 'rent',
    location: {
      zip: '52140',
      city: 'San Miguel de Allende',
      state: 'Guanajuato',
      street: 'Calle del Panteón',
      address: 'Calle del Panteón 789',
      neighborhood: 'Centro',
      addressNumber: '789',
    },
    type: 'house',
    images: [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&f=webp&q=80',
    ],
    active: true,
  },
  {
    title: 'Loft industrial en Roma Norte',
    description:
      'Loft de estilo industrial con techos altos y grandes ventanales. Una recámara principal, cocina abierta y terraza privada. Ideal para artistas o profesionales creativos.',
    price: 4200000,
    tags: ['industrial', 'techos altos', 'ventanales', 'terraza', 'creativo'],
    bedrooms: 1,
    bathrooms: 1,
    parking: 1,
    transaction: 'sale',
    location: {
      zip: '06700',
      city: 'Ciudad de México',
      state: 'CDMX',
      street: 'Calle Orizaba',
      address: 'Calle Orizaba 321',
      neighborhood: 'Roma Norte',
      addressNumber: '321',
    },
    type: 'apartment',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&f=webp&q=80',
    ],
    active: true,
  },
  {
    title: 'Casa colonial en Querétaro',
    description:
      'Hermosa casa colonial restaurada con 5 recámaras, patios interiores y acabados tradicionales. Ubicada en el centro histórico, perfecta para eventos y familia grande.',
    price: 12000000,
    tags: ['colonial', 'restaurada', 'patios', 'histórico', 'eventos'],
    bedrooms: 5,
    bathrooms: 4,
    parking: 4,
    transaction: 'sale',
    location: {
      zip: '76000',
      city: 'Querétaro',
      state: 'Querétaro',
      street: 'Calle Allende',
      address: 'Calle Allende 654',
      neighborhood: 'Centro Histórico',
      addressNumber: '654',
    },
    type: 'house',
    images: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&f=webp&q=80',
    ],
    active: true,
  },
  {
    title: 'Departamento en renta en Guadalajara',
    description:
      'Departamento moderno de 2 recámaras en zona residencial de Guadalajara. Incluye amenidades como alberca, gimnasio y seguridad 24/7.',
    price: 18000,
    tags: ['moderno', 'amenidades', 'alberca', 'gimnasio', 'seguridad'],
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    transaction: 'rent',
    location: {
      zip: '45040',
      city: 'Guadalajara',
      state: 'Jalisco',
      street: 'Av. Vallarta',
      address: 'Av. Vallarta 987',
      neighborhood: 'Providencia',
      addressNumber: '987',
    },
    type: 'apartment',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&f=webp&q=80',
    ],
    active: true,
  },
  {
    title: 'Casa de playa en Puerto Vallarta',
    description:
      'Casa de playa de 3 recámaras con vista al mar. Terraza amplia, acceso directo a la playa y diseño tropical. Perfecta para vacaciones o inversión.',
    price: 8500000,
    tags: ['playa', 'vista al mar', 'tropical', 'terraza', 'inversión'],
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    transaction: 'sale',
    location: {
      zip: '48300',
      city: 'Puerto Vallarta',
      state: 'Jalisco',
      street: 'Calle del Mar',
      address: 'Calle del Mar 147',
      neighborhood: 'Zona Romántica',
      addressNumber: '147',
    },
    type: 'house',
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&f=webp&q=80',
    ],
    active: true,
  },
  {
    title: 'Penthouse en Monterrey',
    description:
      'Lujoso penthouse de 4 recámaras con vista panorámica de la ciudad. Acabados premium, cocina gourmet y terraza con jacuzzi. El máximo en lujo urbano.',
    price: 15000000,
    tags: ['lujoso', 'panorámico', 'premium', 'gourmet', 'jacuzzi'],
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    transaction: 'sale',
    location: {
      zip: '64000',
      city: 'Monterrey',
      state: 'Nuevo León',
      street: 'Av. Constitución',
      address: 'Av. Constitución 258',
      neighborhood: 'Centro',
      addressNumber: '258',
    },
    type: 'apartment',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&f=webp&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&f=webp&q=80',
    ],
    active: true,
  },
]

async function seedDatabase() {
  const client = await pool.connect()

  try {
    console.log('🌱 Iniciando seed de la base de datos...')

    // 1. Insertar brokers
    console.log('📋 Insertando brokers...')
    const brokerIds = []

    for (const broker of sampleBrokers) {
      const result = await client.query(
        `INSERT INTO brokers (first_name, last_name, email, phone, password, role, admin) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (email) DO UPDATE SET 
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         phone = EXCLUDED.phone,
         password = EXCLUDED.password,
         role = EXCLUDED.role,
         admin = EXCLUDED.admin
         RETURNING id`,
        [
          broker.first_name,
          broker.last_name,
          broker.email,
          broker.phone,
          broker.password,
          broker.role,
          broker.admin,
        ]
      )

      brokerIds.push(result.rows[0].id)
      console.log(
        `✅ Broker insertado: ${broker.first_name} ${broker.last_name}`
      )
    }

    // 2. Insertar propiedades
    console.log('🏠 Insertando propiedades...')

    for (let i = 0; i < sampleProperties.length; i++) {
      const property = sampleProperties[i]
      const brokerId = brokerIds[i % brokerIds.length] // Distribuir propiedades entre brokers

      const result = await client.query(
        `INSERT INTO properties (
          title, description, price, tags, bedrooms, bathrooms, parking,
          transaction, location, type, images, active, broker_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id`,
        [
          property.title,
          property.description,
          property.price,
          property.tags,
          property.bedrooms,
          property.bathrooms,
          property.parking,
          property.transaction,
          JSON.stringify(property.location),
          property.type,
          property.images,
          property.active,
          brokerId,
        ]
      )

      console.log(`✅ Propiedad insertada: ${property.title}`)
    }

    console.log('🎉 Seed completado exitosamente!')
    console.log(`📊 Resumen:`)
    console.log(`   - ${brokerIds.length} brokers insertados`)
    console.log(`   - ${sampleProperties.length} propiedades insertadas`)
  } catch (error) {
    console.error('❌ Error durante el seed:', error)
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

// Ejecutar el seed si se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seed completado')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Error en el seed:', error)
      process.exit(1)
    })
}

module.exports = { seedDatabase, sampleProperties, sampleBrokers }
