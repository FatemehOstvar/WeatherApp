export class AuthService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_AUTH_API_URL ?? "http://localhost:4000";
    this.tokenKey = "weatherapp_auth_token";
    this.user = null;
  }

  isAuthenticated() {
    return Boolean(this.user) && Boolean(this.getToken());
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  async restoreSession() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const profile = await this.fetchProfile(token);
      this.user = profile;
      return true;
    } catch (error) {
      this.logout();
      console.error("Failed to restore session", error);
      return false;
    }
  }

  async register({ email, password, name }) {
    const response = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message ?? "Registration failed");
    }

    const { token, user } = await response.json();
    this.persistSession(token, user);
    return user;
  }

  async login({ email, password }) {
    const response = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const { message } = await response.json();
      throw new Error(message ?? "Login failed");
    }

    const { token, user } = await response.json();
    this.persistSession(token, user);
    return user;
  }

  async fetchProfile(token) {
    const response = await fetch(`${this.baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Session expired");
    }

    const { user } = await response.json();
    return user;
  }

  persistSession(token, user) {
    localStorage.setItem(this.tokenKey, token);
    this.user = user;
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.user = null;
  }
}
