import { ApiClient } from "./api.client";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const AuthService = {
  login: (data: LoginData) =>
    ApiClient.fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data: RegisterData) =>
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
