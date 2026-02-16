import { ApiClient } from "./api.client";

export const AuthService = {
  login: (data: any) =>
    ApiClient.fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: any) =>
    ApiClient.fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    ApiClient.fetchWithAuth("/auth/logout", {
      method: "POST",
    }),

  getMe: () => ApiClient.fetchWithAuth("/auth/me"),
};
