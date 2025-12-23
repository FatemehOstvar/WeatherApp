import { createServer } from "node:http";
import { parse } from "node:url";
import { readFileSync, existsSync } from "node:fs";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map();

loadEnvFile();

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.WEATHER_API_KEY;

if (!API_KEY) {
  console.warn("WEATHER_API_KEY is not set. Requests will fail.");
}

const server = createServer(async (req, res) => {
  const { pathname, query } = parse(req.url, true);

  if (req.method === "GET" && pathname === "/api/weather") {
    handleWeatherRequest(query, res);
    return;
  }

  res.statusCode = 404;
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

async function handleWeatherRequest(query, res) {
  setCors(res);
  const { city, unit } = query;

  if (!city || !unit) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Missing required query params: city, unit" }));
    return;
  }

  const cacheKey = `${city.toLowerCase()}|${unit}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(cached.data));
    return;
  }

  if (!API_KEY) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "WEATHER_API_KEY is not configured on the server" }));
    return;
  }

  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(
    city,
  )}?unitGroup=${encodeURIComponent(unit)}&key=${API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      const text = await response.text();
      res.statusCode = response.status;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Upstream weather API error",
          details: text || response.statusText,
        }),
      );
      return;
    }

    const data = await response.json();
    const trimmed = {
      currentConditions: data.currentConditions,
      days: data.days,
    };

    cache.set(cacheKey, { data: trimmed, timestamp: now });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(trimmed));
  } catch (error) {
    console.error("Weather fetch failed", error);
    res.statusCode = 502;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Failed to fetch weather data" }));
  }
}

function loadEnvFile() {
  const envPath = ".env";
  if (!existsSync(envPath)) return;
  try {
    const contents = readFileSync(envPath, "utf-8");
    contents
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const [key, ...rest] = line.split("=");
        if (!key || rest.length === 0) return;
        if (!(key in process.env)) {
          process.env[key] = rest.join("=");
        }
      });
  } catch (error) {
    console.warn("Could not load .env file", error);
  }
}
