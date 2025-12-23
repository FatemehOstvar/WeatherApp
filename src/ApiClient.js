export class ApiError extends Error {
  constructor(message, { status, payload } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }

  get fieldErrors() {
    if (!this.payload || typeof this.payload !== "object") return {};
    const { errors } = this.payload;
    if (!errors || typeof errors !== "object") return {};

    return Object.fromEntries(
      Object.entries(errors).map(([field, value]) => {
        if (Array.isArray(value)) {
          return [field, value.join(" ")];
        }
        if (value && typeof value === "object") {
          return [field, Object.values(value).join(" ")];
        }
        return [field, String(value)];
      }),
    );
  }

  get generalMessage() {
    if (this.payload && typeof this.payload === "object") {
      if (typeof this.payload.message === "string") return this.payload.message;
      if (typeof this.payload.error === "string") return this.payload.error;
    }
    return this.message;
  }
}

export class ApiClient {
  constructor({ baseUrl = "/api", onUnauthorized } = {}) {
    this.baseUrl = baseUrl;
    this.onUnauthorized = onUnauthorized;
    this.token = null;
  }

  setToken(token) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  setUnauthorizedHandler(handler) {
    this.onUnauthorized = handler;
  }

  async request(path, options = {}) {
    const { method = "GET", headers = {}, body } = options;
    const resolvedHeaders = new Headers(headers);

    if (body && !(body instanceof FormData) && !resolvedHeaders.has("Content-Type")) {
      resolvedHeaders.set("Content-Type", "application/json");
    }

    if (this.token) {
      resolvedHeaders.set("Authorization", `Bearer ${this.token}`);
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: resolvedHeaders,
      body:
        body && !(body instanceof FormData) && typeof body !== "string"
          ? JSON.stringify(body)
          : body,
    });

    const payload = await this.#readPayload(response);

    if (response.status === 401 && typeof this.onUnauthorized === "function") {
      this.clearToken();
      this.onUnauthorized();
    }

    if (!response.ok) {
      throw new ApiError(payload?.message ?? "Request failed", {
        status: response.status,
        payload,
      });
    }

    return payload;
  }

  async #readPayload(response) {
    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        return await response.json();
      } catch (error) {
        console.warn("Failed to parse JSON response", error);
        return null;
      }
    }

    try {
      return await response.text();
    } catch (error) {
      console.warn("Failed to read response body", error);
      return null;
    }
  }
}
