-- POSTGRES
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Eliminar tablas y tipos si existen (orden: tablas dependientes -> tablas base -> tipos)
DROP TABLE IF EXISTS lead_properties CASCADE;
DROP TABLE IF EXISTS user_saved_properties CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS leads CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS user_type CASCADE;

-- ENUM
CREATE TYPE property_type AS ENUM ('house', 'apartment');
CREATE TYPE transaction_type AS ENUM ('rent', 'sale');
CREATE TYPE user_type AS ENUM ('user', 'broker');

-- Crear la tabla de brokers
CREATE TABLE brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    role user_type NOT NULL,
    admin BOOLEAN
);

-- Crear la tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    role user_type NOT NULL
);

-- Crear la tabla de propiedades
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price INT NOT NULL CHECK (price >= 0),
    tags TEXT[],
    bedrooms INT,
    bathrooms INT,
    parking INT,
    transaction transaction_type NOT NULL,
    location JSONB NOT NULL,
    type property_type NOT NULL,
    images TEXT[],
    active BOOLEAN DEFAULT true,
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE
);

-- Tabla de propiedades guardadas por los usuarios
CREATE TABLE user_saved_properties (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, property_id)
);

-- Add refresh tokens table for token revocation capability
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    device_info TEXT NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_broker_id ON refresh_tokens(broker_id);
-- (No index on token_hash: UNIQUE already creates one)
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Clean up expired tokens function
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens 
    WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Añadir columna search_vector
ALTER TABLE properties ADD COLUMN search_vector TSVECTOR;

-- Función que genera el search_vector con pesos según ubicación, tags y texto
CREATE OR REPLACE FUNCTION update_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('spanish',
      COALESCE(NEW.location ->> 'city', '') || ' ' ||
      COALESCE(NEW.location ->> 'state', '') || ' ' ||
      COALESCE(NEW.location ->> 'neighborhood', '') || ' ' ||
      COALESCE(NEW.location ->> 'street', '') || ' ' ||
      COALESCE(NEW.location ->> 'zip', '')
    ), 'A') ||
    setweight(to_tsvector('spanish',
      COALESCE(array_to_string(NEW.tags, ' '), '')
    ), 'B') ||
    setweight(to_tsvector('spanish',
      COALESCE(NEW.title, '') || ' ' || COALESCE(NEW.description, '')
    ), 'C');

  RETURN NEW;
END
$$ LANGUAGE plpgsql;

-- Trigger que actualiza el search_vector automáticamente
CREATE TRIGGER trg_search_vector
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION update_search_vector();

-- Índice GIN para búsquedas rápidas por search_vector
CREATE INDEX idx_properties_search_vector ON properties USING GIN (search_vector);

-- Ensure all required location fields are present
ALTER TABLE properties ADD CONSTRAINT check_location_structure 
CHECK (
    location ? 'zip' AND 
    location ? 'city' AND
    location ? 'state' AND
    location ? 'street' AND
    location ? 'address' AND
    location ? 'neighborhood' AND
    location ? 'addressNumber' AND
    location ->> 'city' != '' AND
    location ->> 'state' != ''
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_id UUID NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
  lead_phone TEXT,
  lead_email TEXT,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Many-to-many link between leads and properties
CREATE TABLE lead_properties (
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  PRIMARY KEY (lead_id, property_id)
);

-- Helpful reverse-lookup index
CREATE INDEX idx_lead_properties_property_id ON lead_properties (property_id);

-- Per-broker uniqueness (NULL-safe)
CREATE UNIQUE INDEX uniq_lead_phone_per_broker
  ON leads (broker_id, lead_phone)
  WHERE lead_phone IS NOT NULL;

CREATE UNIQUE INDEX uniq_lead_email_per_broker
  ON leads (broker_id, lead_email)
  WHERE lead_email IS NOT NULL;

-- Indexes for location-based searches (uso correcto de btree)
CREATE INDEX idx_properties_location_city  ON properties ((location ->> 'city'));
CREATE INDEX idx_properties_location_state ON properties ((location ->> 'state'));
CREATE INDEX idx_properties_location_zip   ON properties ((location ->> 'zip'));