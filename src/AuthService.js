export class AuthService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  async login(credentials) {
    const response = await this.apiClient.request("/auth/login", {
      method: "POST",
      body: credentials,
    });

    if (response?.token) {
      this.apiClient.setToken(response.token);
    }

    return response;
  }

  async logout() {
    await this.apiClient.request("/auth/logout", { method: "POST" });
    this.apiClient.clearToken();
  }

  async refresh() {
    const response = await this.apiClient.request("/auth/refresh", {
      method: "POST",
    });

    if (response?.token) {
      this.apiClient.setToken(response.token);
    }

    return response;
  }
}
