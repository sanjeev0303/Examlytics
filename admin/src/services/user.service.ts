import { ApiClient } from "./api.client";

export const UserService = {
  onboard: (data: { email: string; name: string; role: string; examTypes: string[] }, options?: RequestInit) =>
    ApiClient.fetchWithAuth("/users/onboarding", {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  getProfile: (options?: RequestInit) => ApiClient.fetchWithAuth("/users", options),

  getAdminStats: (options?: RequestInit) => ApiClient.fetchWithAuth("/admin/stats", options),
};
