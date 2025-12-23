-- 002_seed_cities.sql
-- Demonstrates a safe seed/lookup pattern that avoids duplicate city rows.
-- The generated `normalized_name` column and the composite constraint (`cities_dedup`)
-- are used as the conflict target, so incoming data cannot create duplicates even if
-- capitalization differs.

INSERT INTO cities (name, country_code, latitude, longitude, timezone)
VALUES
    ('New York', 'US', 40.712776, -74.005974, 'America/New_York'),
    ('Paris', 'FR', 48.856613, 2.352222, 'Europe/Paris'),
    ('Sydney', 'AU', -33.868820, 151.209290, 'Australia/Sydney')
ON CONFLICT ON CONSTRAINT cities_dedup DO UPDATE
SET timezone = EXCLUDED.timezone;

-- For bulk imports, prefer ON CONFLICT DO NOTHING to keep the first-seen coordinates
-- authoritative while still leveraging the unique composite key:
-- INSERT INTO cities (name, country_code, latitude, longitude, timezone)
-- SELECT name, country, lat, lon, tz FROM staging_cities
-- ON CONFLICT ON CONSTRAINT cities_dedup DO NOTHING;
