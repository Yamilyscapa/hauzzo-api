# 🌱 Seed de Propiedades de Prueba - Hauzzo

Este script te permite poblar tu base de datos con propiedades de prueba realistas para desarrollo y testing.

## 📋 Contenido del Seed

### Brokers de Prueba

- **María González** - Admin (maria.gonzalez@hauzzo.com)
- **Carlos Rodríguez** - Broker regular (carlos.rodriguez@hauzzo.com)

**Contraseña para ambos:** `password123`

### Propiedades de Prueba

El seed incluye 8 propiedades variadas:

1. **Casa moderna en Polanco** - $8,500,000 MXN (Venta)
2. **Departamento en Condesa** - $3,500,000 MXN (Venta)
3. **Casa en renta en San Miguel** - $25,000 MXN/mes (Renta)
4. **Loft industrial en Roma Norte** - $4,200,000 MXN (Venta)
5. **Casa colonial en Querétaro** - $12,000,000 MXN (Venta)
6. **Departamento en renta en Guadalajara** - $18,000 MXN/mes (Renta)
7. **Casa de playa en Puerto Vallarta** - $8,500,000 MXN (Venta)
8. **Penthouse en Monterrey** - $15,000,000 MXN (Venta)

## 🚀 Cómo Ejecutar el Seed

### 1. Configurar Variables de Entorno

Copia el archivo `env.example` a `.env` y configura tus credenciales de base de datos:

```bash
cp env.example .env
```

Edita `.env` con tus credenciales:

```env
DB_USER=tu_usuario
DB_HOST=localhost
DB_NAME=hauzzo
DB_PASSWORD=tu_password
DB_PORT=5432
```

### 2. Ejecutar el Seed

```bash
# Usando npm
npm run seed

# Usando yarn
yarn seed

# Usando bun
bun run seed

# Directamente con Node
node seed-properties.js
```

## 🔧 Personalización

### Agregar Más Propiedades

Edita el array `sampleProperties` en `seed-properties.js` para agregar más propiedades:

```javascript
{
  title: 'Nueva Propiedad',
  description: 'Descripción de la propiedad',
  price: 5000000,
  tags: ['tag1', 'tag2'],
  bedrooms: 3,
  bathrooms: 2,
  parking: 1,
  transaction: 'sale', // o 'rent'
  location: {
    zip: '12345',
    city: 'Ciudad',
    state: 'Estado',
    street: 'Calle',
    address: 'Dirección Completa',
    neighborhood: 'Colonia',
    addressNumber: '123'
  },
  type: 'house', // o 'apartment'
  images: ['url1', 'url2'],
  active: true
}
```

### Agregar Más Brokers

Edita el array `sampleBrokers` en `seed-properties.js`:

```javascript
{
  first_name: 'Nombre',
  last_name: 'Apellido',
  email: 'email@hauzzo.com',
  phone: '+52 55 1234 5678',
  password: '$2b$10$...', // Hash de bcrypt
  role: 'broker',
  admin: false
}
```

## 🗄️ Estructura de la Base de Datos

El seed crea automáticamente:

- **Brokers** en la tabla `brokers`
- **Propiedades** en la tabla `properties`
- **Relaciones** entre brokers y propiedades

## 🔒 Seguridad

- Las contraseñas están hasheadas con bcrypt
- El script usa parámetros preparados para prevenir SQL injection
- Maneja conflictos de email con `ON CONFLICT DO UPDATE`

## 🐛 Solución de Problemas

### Error de Conexión

- Verifica que PostgreSQL esté corriendo
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos `hauzzo` exista

### Error de Permisos

- Verifica que el usuario tenga permisos de INSERT en las tablas
- Confirma que las tablas existan (ejecuta `db.sql` primero)

### Error de UUID

- Asegúrate de que la extensión `pgcrypto` esté habilitada
- Verifica que PostgreSQL soporte UUID

## 📊 Verificar el Seed

Después de ejecutar el seed, puedes verificar en tu base de datos:

```sql
-- Ver brokers creados
SELECT * FROM brokers;

-- Ver propiedades creadas
SELECT p.*, b.first_name || ' ' || b.last_name as broker_name
FROM properties p
JOIN brokers b ON p.broker_id = b.id;

-- Contar propiedades por broker
SELECT b.first_name || ' ' || b.last_name as broker_name, COUNT(p.id) as properties_count
FROM brokers b
LEFT JOIN properties p ON b.id = p.broker_id
GROUP BY b.id, b.first_name, b.last_name;
```

## 🎯 Casos de Uso

- **Desarrollo local**: Poblar base de datos vacía
- **Testing**: Datos consistentes para pruebas
- **Demo**: Mostrar funcionalidades con datos realistas
- **Onboarding**: Nuevos desarrolladores pueden empezar rápido

## 📝 Notas

- El script es idempotente: puedes ejecutarlo múltiples veces
- Las imágenes usan URLs de Unsplash para simular fotos reales
- Los precios están en pesos mexicanos (MXN)
- Las ubicaciones incluyen ciudades reales de México
