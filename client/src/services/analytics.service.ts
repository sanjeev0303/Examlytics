import { ApiClient } from "./api.client";

export const AnalyticsService = {
  getWeakTopics: (options?: RequestInit) => ApiClient.fetchWithAuth("/exams/weak-topics", options),
};
