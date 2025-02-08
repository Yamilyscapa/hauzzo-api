-- Eliminar tablas y tipos si existen
DROP TABLE IF EXISTS user_saved_properties CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS brokers CASCADE;
DROP TABLE IF EXISTS users CASCADE;
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