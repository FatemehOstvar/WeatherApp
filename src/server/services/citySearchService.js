import { normalizeCityLabel } from "../validation/cityValidation.js";

const GEOCODING_ENDPOINT = "https://geocoding-api.open-meteo.com/v1/search";

export async function searchCities(query) {
  const url = new URL(GEOCODING_ENDPOINT);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Upstream search failed with status ${response.status}`);
  }

  const payload = await response.json();
  const results = payload?.results ?? [];

  return results.map((result) => {
    const components = [result.name, result.admin1, result.country].filter(Boolean);
    const label = normalizeCityLabel(components.join(", "));

    return {
      label,
      normalizedLabel: normalizeCityLabel(result.name),
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      state: result.admin1,
      timezone: result.timezone,
    };
  });
}
