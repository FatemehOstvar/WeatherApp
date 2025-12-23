# Weather App

An interactive weather dashboard built with Vite that lets users search for a city, view current conditions, and browse hourly and daily forecasts.

## Prerequisites

- **Node.js**: 20.x recommended (Vite requires active LTS or newer).
- **npm**: Ships with Node; used for installing dependencies and running scripts.
- **Browser**: Modern browser with JavaScript enabled to run the bundled app locally.

## Install & Run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (hot reload on file changes):
   ```bash
   npm run dev
   ```
   The dev server prints the local URL (typically http://localhost:5173).
3. Create a production build:
   ```bash
   npm run build
   ```
4. Preview the production build locally:
   ```bash
   npm run preview
   ```

## Environment Variables

The Visual Crossing weather API key is currently inlined for demo purposes. For production, set it via an environment variable and update the fetch URL in `src/Extractor.js` to read from it (e.g., `import.meta.env.VITE_VISUAL_CROSSING_KEY`). Recommended variables:

- `VITE_VISUAL_CROSSING_KEY`: API key for https://www.visualcrossing.com.
- `VITE_API_BASE_URL` (optional): Base URL for any backing API that handles authentication, saved cities, or user settings.

Store variables in a `.env` file at the project root for Vite to load, and restart the dev server after changes.

## Database Migration Steps

The front-end does not bundle a database. If you integrate a backing service with persistence (for auth, saved cities, or settings), run that service’s migrations before starting the UI:

1. Change into the backend project directory.
2. Apply migrations with the project’s tool (e.g., `npm run migrate`, `prisma migrate deploy`, or `knex migrate:latest`).
3. Seed any required baseline data (users, default settings) if your backend expects it.
4. Start the backend and confirm the migration version before running `npm run dev` for this UI.

## API Endpoints

The UI expects a backing API for auth, city search, saved cities, and user settings. Payloads are JSON unless noted.

### Auth

- **POST `/api/auth/register`** — Create an account.
  - Request: `{ "email": "user@example.com", "password": "P@ssw0rd", "name": "Jamie" }`
  - Response: `201 Created` `{ "userId": "u_123", "email": "user@example.com" }`
- **POST `/api/auth/login`** — Exchange credentials for tokens.
  - Request: `{ "email": "user@example.com", "password": "P@ssw0rd" }`
  - Response: `200 OK` `{ "accessToken": "jwt...", "refreshToken": "rjwt...", "expiresIn": 3600 }`
- **POST `/api/auth/refresh`** — Refresh the access token.
  - Request: `{ "refreshToken": "rjwt..." }`
  - Response: `200 OK` `{ "accessToken": "jwt...", "expiresIn": 3600 }`

### City Search

- **GET `/api/cities?query={text}`** — Search for cities by name or postal code.
  - Response: `200 OK`
    ```json
    {
      "results": [
        { "id": "g_4360", "name": "Rasht", "country": "IR", "lat": 37.27, "lon": 49.59 },
        { "id": "g_5128", "name": "Rashtrapati Bhavan", "country": "IN", "lat": 28.6142, "lon": 77.195 } 
      ]
    }
    ```

### Saved Cities

- **GET `/api/users/{userId}/cities`** — Retrieve saved cities.
  - Response: `200 OK` `{ "cities": ["g_4360", "g_5128"] }`
- **POST `/api/users/{userId}/cities`** — Save a new city.
  - Request: `{ "cityId": "g_4360", "label": "Home" }`
  - Response: `201 Created` `{ "cityId": "g_4360", "label": "Home" }`
- **DELETE `/api/users/{userId}/cities/{cityId}`** — Remove a saved city.
  - Response: `204 No Content`

### Settings

- **GET `/api/users/{userId}/settings`** — Fetch user preferences.
  - Response: `200 OK` `{ "unit": "metric", "theme": "system", "autoRefreshMinutes": 15 }`
- **PUT `/api/users/{userId}/settings`** — Update preferences.
  - Request: `{ "unit": "us", "theme": "dark", "autoRefreshMinutes": 30 }`
  - Response: `200 OK` (same shape as GET)

## Dashboard Usage Notes

- **City selection**: Use the map-pin button to enter a city name; the prompt value drives all current, hourly, and daily requests. The UI assumes a valid, resolvable city string (e.g., "Rasht" or "Paris, FR").
- **Unit toggle**: Click the thermometer icon to switch between metric (°C) and US (°F) units. The UI refetches data for the selected city with the new unit group.
- **Current conditions**: The header shows temperature, short description, feels-like value, and additional stats (humidity, UV index, etc.).
- **Hourly & daily forecasts**: Cards show the time/day, weather icon, and temperature using the active unit.

## Validation Expectations

- **City input**: Reject empty strings and optionally debounce rapid requests. Show a clear error when the weather API cannot resolve the city.
- **Authentication**: Enforce minimum password rules (e.g., 8+ chars, mixed case, digit/symbol) and return opaque error messages to avoid credential leakage.
- **Saved cities & settings**: Validate ownership on the server, require well-formed IDs, and sanitize display labels to prevent XSS.
- **Requests**: Treat all backing API responses as untrusted—handle non-200 codes with user-facing errors and avoid crashing the UI when payloads are missing fields.
