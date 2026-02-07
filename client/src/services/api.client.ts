const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiClient {
  static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const res = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `API request failed: ${res.statusText}`);
    }

    return res.json();
  }
}
