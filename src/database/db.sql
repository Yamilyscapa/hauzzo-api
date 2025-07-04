-- Eliminar tablas y tipos si existen
DROP TABLE IF EXISTS user_saved_properties CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TYPE IF EXISTS property_type CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
-- ENUM
CREATE TYPE property_type AS ENUM ('house', 'apartment');
CREATE TYPE user_role AS ENUM ('user', 'broker');
-- Crear la tabla de brokers
CREATE TABLE brokers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone VARCHAR(20),
    password TEXT NOT NULL
);
-- Crear la tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone VARCHAR(20),
    password TEXT NOT NULL,
    role user_role NOT NULL
);
-- Crear la tabla de propiedades
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type property_type NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    tags TEXT [],
    price INT NOT NULL CHECK (price >= 0),
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
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Clean up expired tokens function
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens 
    WHERE expires_at < NOW() OR revoked_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;