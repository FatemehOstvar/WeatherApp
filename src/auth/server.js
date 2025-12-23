import { validateLoginPayload, validateSignupPayload } from "./validation.js";

const userStorageKey = "auth.users";

function readUsers() {
  try {
    const stored = localStorage.getItem(userStorageKey);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.warn("Could not read users from storage", error);
    return [];
  }
}

function writeUsers(users) {
  try {
    localStorage.setItem(userStorageKey, JSON.stringify(users));
  } catch (error) {
    console.warn("Could not persist users to storage", error);
  }
}

const users = readUsers();

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function structuredError(status, code, message, fieldErrors = []) {
  return { ok: false, status, body: { error: { code, message, fieldErrors } } };
}

function structuredSuccess(status, body) {
  return { ok: true, status, body };
}

export function describeAuthContract() {
  return {
    endpoints: {
      signup: {
        method: "POST",
        path: "/api/auth/signup",
        requires: ["name", "email", "password"],
        errors: [
          "REQUIRED",
          "MIN_LENGTH",
          "MAX_LENGTH",
          "FORMAT",
          "COMPLEXITY",
          "EMAIL_EXISTS",
        ],
      },
      login: {
        method: "POST",
        path: "/api/auth/login",
        requires: ["email", "password"],
        errors: ["REQUIRED", "MIN_LENGTH", "MAX_LENGTH", "FORMAT", "COMPLEXITY", "INVALID_CREDENTIALS"],
      },
    },
    responses: {
      success: {
        token: "Opaque session token string",
        user: { id: "string", name: "string", email: "string" },
      },
      error: { code: "CODE", message: "Description", fieldErrors: [] },
    },
  };
}

export async function postSignup(payload) {
  const validation = validateSignupPayload(payload);
  if (!validation.isValid) {
    return structuredError(400, "VALIDATION_FAILED", "Signup payload is invalid.", validation.errors);
  }

  const normalizedEmail = normalizeEmail(payload.email);
  const duplicate = users.find((user) => normalizeEmail(user.email) === normalizedEmail);
  if (duplicate) {
    return structuredError(409, "EMAIL_EXISTS", "Account already exists for this email.");
  }

  const user = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: payload.name.trim(),
    email: payload.email.trim(),
    password: payload.password,
  };
  users.push(user);
  writeUsers(users);

  const token = btoa(`${user.id}:${user.email}:${Date.now()}`);
  return structuredSuccess(201, {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}

export async function postLogin(payload) {
  const validation = validateLoginPayload(payload);
  if (!validation.isValid) {
    return structuredError(400, "VALIDATION_FAILED", "Login payload is invalid.", validation.errors);
  }

  const normalizedEmail = normalizeEmail(payload.email);
  const user = users.find((candidate) => normalizeEmail(candidate.email) === normalizedEmail);
  if (!user || user.password !== payload.password) {
    return structuredError(401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
  }

  const token = btoa(`${user.id}:${user.email}:${Date.now()}`);
  return structuredSuccess(200, {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
}
