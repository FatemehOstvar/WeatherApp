import { searchCities } from "../services/citySearchService.js";
import {
  normalizeCityLabel,
  validateCityLabel,
} from "../validation/cityValidation.js";
import { sendJson } from "../utils/http.js";

export async function searchCityController(req, res) {
  const url = new URL(req.url, "http://localhost");
  const query = url.searchParams.get("query") ?? "";
  const normalizedQuery = normalizeCityLabel(query);
  const errors = validateCityLabel(query);

  if (errors.length) {
    sendJson(res, 400, { errors });
    return;
  }

  try {
    const results = await searchCities(normalizedQuery);
    sendJson(res, 200, { query: normalizedQuery, results });
  } catch (error) {
    sendJson(res, 502, { error: "City search proxy failed.", detail: error.message });
  }
}
