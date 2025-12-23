-- 001_create_tables.sql
-- Base schema for authentication, location lookup, and personalization.

-- gen_random_uuid is used for deterministic UUID primary keys on supporting PostgreSQL versions.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT users_email_not_empty CHECK (length(trim(email)) > 3)
);

-- Case-insensitive uniqueness for user emails.
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

CREATE TABLE cities (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    normalized_name TEXT GENERATED ALWAYS AS (lower(name)) STORED,
    country_code CHAR(2) NOT NULL,
    latitude NUMERIC(9,6) NOT NULL,
    longitude NUMERIC(9,6) NOT NULL,
    timezone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT cities_name_not_empty CHECK (length(trim(name)) > 0),
    CONSTRAINT cities_latitude_range CHECK (latitude BETWEEN -90 AND 90),
    CONSTRAINT cities_longitude_range CHECK (longitude BETWEEN -180 AND 180),
    CONSTRAINT cities_country_format CHECK (country_code ~ '^[A-Za-z]{2}$'),
    CONSTRAINT cities_country_upper CHECK (country_code = upper(country_code)),
    CONSTRAINT cities_dedup UNIQUE (normalized_name, country_code, latitude, longitude)
);

-- Prevent duplicate city rows based on name, country, and exact coordinates.
CREATE INDEX cities_country_idx ON cities (country_code);
CREATE INDEX cities_coordinates_idx ON cities (latitude, longitude);

CREATE TABLE user_cities (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    city_id BIGINT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    is_home BOOLEAN NOT NULL DEFAULT false,
    label TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, city_id)
);

-- Fast reverse lookups and a constraint for a single home city per user.
CREATE INDEX user_cities_city_idx ON user_cities (city_id);
CREATE UNIQUE INDEX user_home_city_idx ON user_cities (user_id) WHERE is_home;

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT session_token_not_empty CHECK (length(session_token) > 24)
);

CREATE UNIQUE INDEX sessions_token_idx ON sessions (session_token);
CREATE INDEX sessions_user_idx ON sessions (user_id);
CREATE INDEX sessions_expiry_idx ON sessions (expires_at);

CREATE TABLE settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    units TEXT NOT NULL DEFAULT 'metric',
    theme TEXT DEFAULT 'system',
    language TEXT DEFAULT 'en',
    forecast_refresh_minutes INTEGER DEFAULT 30 CHECK (forecast_refresh_minutes BETWEEN 5 AND 360),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT settings_units_check CHECK (units IN ('metric', 'us'))
);
