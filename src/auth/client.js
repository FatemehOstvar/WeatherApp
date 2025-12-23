import { postLogin, postSignup } from "./server.js";

function normalizeResponse(response) {
  return {
    ok: response.ok,
    status: response.status,
    data: response.ok ? response.body : null,
    error: response.ok ? null : response.body?.error,
  };
}

export class AuthClient {
  async signup(payload) {
    const response = await postSignup(payload);
    return normalizeResponse(response);
  }

  async login(payload) {
    const response = await postLogin(payload);
    return normalizeResponse(response);
  }
}
