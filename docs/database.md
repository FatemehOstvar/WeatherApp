# Database Schema Notes

## Tables and constraints
- **users**: UUID primary key with `gen_random_uuid()`, case-insensitive unique emails via the `users_email_lower_idx` index. Rejects blank addresses with `users_email_not_empty`.
- **cities**: Generated column `normalized_name` plus a composite constraint (`cities_dedup`) on `normalized_name`, `country_code`, `latitude`, and `longitude` prevents duplicate location rows even when casing differs. Range checks enforce valid latitude/longitude, and `cities_country_upper` keeps the ISO country code uppercase.
- **user_cities**: Bridge table keyed on `(user_id, city_id)` with cascade deletes. The partial unique index `user_home_city_idx` guarantees a single home city per user.
- **sessions**: UUID primary key with unique `session_token` and indexes on `user_id` and `expires_at` for cleanup/lookup. Tokens must be longer than 24 characters.
- **settings**: Optional per-user preferences keyed by `user_id` with a `units` check constraint limiting values to `metric` or `us`. Includes refresh interval guardrails (`forecast_refresh_minutes` between 5 and 360 minutes).

## Units and enums
- Weather units are intentionally constrained to `metric` or `us` in `settings.units` (`settings_units_check`). Additional units (e.g., `imperial`) should be added by extending this check constraint in a follow-up migration.

## Seeding and lookup strategy
- Seed city data with `INSERT ... ON CONFLICT ON CONSTRAINT cities_dedup` to reuse existing rows when the same name/country/coordinates appear again (see `migrations/002_seed_cities.sql`).
- For bulk imports, prefer `ON CONFLICT ... DO NOTHING` to trust the earliest ingested coordinates while still preventing duplicates.
- Queries can leverage the `cities_country_idx` and `cities_coordinates_idx` indexes for quick reverse lookups by country or bounding box.
