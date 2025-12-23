const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export class ApiClient {
  constructor(tokenProvider) {
    this.tokenProvider = tokenProvider;
  }

  async signup(payload) {
    return this.#request("/auth/signup", "POST", payload);
  }

  async login(payload) {
    return this.#request("/auth/login", "POST", payload);
  }

  async currentUser() {
    return this.#request("/auth/me", "GET");
  }

  async #request(path, method, body) {
    const token = this.tokenProvider();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const text = await response.text();
      let message = text;
      try {
        const parsed = JSON.parse(text);
        message = parsed.message ?? text;
      } catch {
        // use plain text
      }
      throw new Error(
        message || `Request failed with status ${response.status}`,
      );
    }

    return response.json();
  }
}
