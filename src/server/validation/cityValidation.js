export const CITY_LABEL_MAX_LENGTH = 80;
export const CITY_LABEL_PATTERN = /^[\p{L}\d'.\\-\\s]+$/u;

export function normalizeCityLabel(label = "") {
  const trimmed = label.trim().replace(/\s+/g, " ");
  if (!trimmed) {
    return "";
  }

  return trimmed
    .split(" ")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join(" ");
}

export function validateCityLabel(label) {
  const errors = [];
  if (!label || !label.trim()) {
    errors.push("City label is required.");
    return errors;
  }

  const normalized = label.trim();
  if (normalized.length > CITY_LABEL_MAX_LENGTH) {
    errors.push(`City label must be ${CITY_LABEL_MAX_LENGTH} characters or fewer.`);
  }

  if (!CITY_LABEL_PATTERN.test(normalized)) {
    errors.push("City label must contain only letters, numbers, spaces, apostrophes, periods, or hyphens.");
  }

  return errors;
}

export function validateCoordinates(latitude, longitude) {
  const errors = [];
  if (latitude !== undefined) {
    if (typeof latitude !== "number" || Number.isNaN(latitude)) {
      errors.push("Latitude must be a number.");
    } else if (latitude < -90 || latitude > 90) {
      errors.push("Latitude must be between -90 and 90.");
    }
  }

  if (longitude !== undefined) {
    if (typeof longitude !== "number" || Number.isNaN(longitude)) {
      errors.push("Longitude must be a number.");
    } else if (longitude < -180 || longitude > 180) {
      errors.push("Longitude must be between -180 and 180.");
    }
  }

  return errors;
}

export function validateCityPayload(payload = {}) {
  const { label, latitude, longitude, country, state } = payload;
  const errors = [...validateCityLabel(label), ...validateCoordinates(latitude, longitude)];

  if (country !== undefined) {
    if (typeof country !== "string" || !country.trim()) {
      errors.push("Country must be a non-empty string when provided.");
    } else if (country.trim().length > 60) {
      errors.push("Country must be 60 characters or fewer.");
    }
  }

  if (state !== undefined) {
    if (typeof state !== "string" || !state.trim()) {
      errors.push("State/Region must be a non-empty string when provided.");
    } else if (state.trim().length > 60) {
      errors.push("State/Region must be 60 characters or fewer.");
    }
  }

  return errors;
}
