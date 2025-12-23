import {
  normalizeCityLabel,
  validateCityPayload,
} from "../validation/cityValidation.js";
import {
  addUserCity,
  deleteUserCity,
  findUserCity,
  listUserCities,
  updateUserCity,
} from "../store/userCityStore.js";
import { readJsonBody, sendJson } from "../utils/http.js";

export function listCitiesController(req, res, { user }) {
  const cities = listUserCities(user.id);
  sendJson(res, 200, { cities });
}

export async function createCityController(req, res, { user }) {
  let payload = {};
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { errors: [error.message] });
    return;
  }

  const errors = validateCityPayload(payload);
  if (errors.length) {
    sendJson(res, 400, { errors });
    return;
  }

  const normalizedLabel = normalizeCityLabel(payload.label);
  const result = addUserCity(user.id, {
    ...payload,
    label: normalizedLabel,
    normalizedLabel,
  });

  if (result.error === "duplicate") {
    sendJson(res, 409, { error: "City already saved for this user." });
    return;
  }

  sendJson(res, 201, { city: result.city });
}

export async function updateCityController(req, res, { user, params }) {
  let payload = {};
  try {
    payload = await readJsonBody(req);
  } catch (error) {
    sendJson(res, 400, { errors: [error.message] });
    return;
  }

  const errors = validateCityPayload(payload);
  if (errors.length) {
    sendJson(res, 400, { errors });
    return;
  }

  const normalizedLabel = normalizeCityLabel(payload.label);
  const result = updateUserCity(user.id, params.id, {
    ...payload,
    label: normalizedLabel,
    normalizedLabel,
  });

  if (result.error === "notFound") {
    sendJson(res, 404, { error: "Saved city not found." });
    return;
  }

  if (result.error === "duplicate") {
    sendJson(res, 409, { error: "City already saved for this user." });
    return;
  }

  sendJson(res, 200, { city: result.city });
}

export function getCityController(req, res, { user, params }) {
  const city = findUserCity(user.id, params.id);
  if (!city) {
    sendJson(res, 404, { error: "Saved city not found." });
    return;
  }

  sendJson(res, 200, { city });
}

export function deleteCityController(req, res, { user, params }) {
  const result = deleteUserCity(user.id, params.id);
  if (result.error === "notFound") {
    sendJson(res, 404, { error: "Saved city not found." });
    return;
  }

  res.statusCode = 204;
  res.end();
}
