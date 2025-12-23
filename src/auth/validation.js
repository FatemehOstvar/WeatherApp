const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{8,64}$/;

const nameLimits = { min: 2, max: 50 };

function normalize(value) {
  return typeof value === "string" ? value.trim() : "";
}

function buildError(field, code, message) {
  return { field, code, message };
}

function validateEmail(value) {
  const normalized = normalize(value);
  if (!normalized) {
    return buildError("email", "REQUIRED", "Email is required.");
  }
  if (normalized.length > 120) {
    return buildError("email", "MAX_LENGTH", "Email must be 120 characters or less.");
  }
  if (!emailPattern.test(normalized)) {
    return buildError("email", "FORMAT", "Email must look like a valid address.");
  }
  return null;
}

function validatePassword(value) {
  const normalized = normalize(value);
  if (!normalized) {
    return buildError("password", "REQUIRED", "Password is required.");
  }
  if (normalized.length < 8) {
    return buildError("password", "MIN_LENGTH", "Password must be at least 8 characters long.");
  }
  if (normalized.length > 64) {
    return buildError("password", "MAX_LENGTH", "Password must be 64 characters or less.");
  }
  if (!passwordPattern.test(normalized)) {
    return buildError(
      "password",
      "COMPLEXITY",
      "Password must include letters and numbers.",
    );
  }
  return null;
}

function validateName(value) {
  const normalized = normalize(value);
  if (!normalized) {
    return buildError("name", "REQUIRED", "Name is required.");
  }
  if (normalized.length < nameLimits.min) {
    return buildError(
      "name",
      "MIN_LENGTH",
      `Name must be at least ${nameLimits.min} characters long.`,
    );
  }
  if (normalized.length > nameLimits.max) {
    return buildError(
      "name",
      "MAX_LENGTH",
      `Name must be ${nameLimits.max} characters or less.`,
    );
  }
  return null;
}

function compileErrors(...potentialErrors) {
  return potentialErrors.filter(Boolean);
}

function summarize(errors) {
  return {
    isValid: errors.length === 0,
    errors,
    fieldErrors: errors.reduce((acc, error) => {
      if (!acc[error.field]) acc[error.field] = [];
      acc[error.field].push(error);
      return acc;
    }, {}),
  };
}

export function validateSignupPayload(payload) {
  const errors = compileErrors(
    validateName(payload?.name),
    validateEmail(payload?.email),
    validatePassword(payload?.password),
  );
  return summarize(errors);
}

export function validateLoginPayload(payload) {
  const errors = compileErrors(
    validateEmail(payload?.email),
    validatePassword(payload?.password),
  );
  return summarize(errors);
}

export const authValidationRules = {
  fields: {
    name: {
      required: true,
      minLength: nameLimits.min,
      maxLength: nameLimits.max,
      description: "Display name used for your account",
    },
    email: {
      required: true,
      maxLength: 120,
      pattern: emailPattern.toString(),
      description: "Email address used to sign in",
    },
    password: {
      required: true,
      minLength: 8,
      maxLength: 64,
      pattern: passwordPattern.toString(),
      description: "Must contain letters and numbers",
    },
  },
};
