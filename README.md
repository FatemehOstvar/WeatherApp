# Weather Club

A Vite-powered frontend with authentication flows and a lightweight Express API backed by Postgres (Neon-friendly). Users can sign up or log in to unlock the weather experience, toggle units, and switch cities.

## Prerequisites

- Node 20+
- Access to a Postgres database (tested with Neon)
- A Visual Crossing API key for weather data

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the environment template and populate values:
   ```bash
   cp .env.example .env
   ```
3. Apply the database schema and seed the demo user:
   ```bash
   npm run db:setup
   ```
4. Start the API:
   ```bash
   npm run server
   ```
5. In a new terminal, start the Vite dev server:
   ```bash
   npm run dev
   ```

The Vite dev server proxies `/api` calls to the Express server by default.

## API Endpoints

- `POST /api/auth/signup` – Create a user with `firstName`, `lastName`, `email`, `password`.
- `POST /api/auth/login` – Authenticate and receive a JWT.
- `GET /api/auth/me` – Retrieve the authenticated user (requires `Authorization: Bearer <token>`).
- `GET /api/health` – Basic health check (also exercises DB connectivity).

## Database Schema

`server/db/schema.sql` defines a single `users` table:

- `id` (UUID primary key)
- `email` (unique)
- `password_hash`
- `first_name`
- `last_name`
- `created_at`

`scripts/setup-db.js` applies the schema and seeds a demo user (`demo@weatherclub.dev` / `ChangeMe123!`).

## Environment Variables

See `.env.example` for required values:

- `DATABASE_URL` (Neon/Postgres connection string)
- `JWT_SECRET` (signing secret for tokens)
- `CORS_ORIGIN` (allowed origins, comma-separated)
- `PORT` (API port, default `4000`)
- `VITE_API_BASE_URL` (frontend API base, default `http://localhost:4000/api`)
- `VITE_VISUAL_CROSSING_KEY` (Visual Crossing weather API key)
