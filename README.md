# WeatherApp

## Setup

1. Copy `.env.example` to `.env` and set `WEATHER_API_KEY` to your Visual Crossing key. Optionally override `PORT` (defaults to `3001`).
2. Install dependencies with `npm install` (or your preferred package manager).

## Development

Run the backend and frontend in parallel:

- Backend: `npm run dev:server` (listens on `PORT`)
- Frontend: `npm run dev:client` (Vite proxies `/api` to the backend)

Visit the Vite dev server URL shown in the terminal. The app will request weather data via `/api/weather?city=<city>&unit=<unit>`.

## Production build

- Build assets: `npm run build`
- Start server: `npm start`
