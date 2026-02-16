import { ApiClient } from "./api.client";

export const AnalyticsService = {
  getWeakTopics: (options?: RequestInit) => ApiClient.fetchWithAuth("/exams/weak-topics", options),
  getStreaks: (options?: RequestInit) => ApiClient.fetchWithAuth("/analytics/streaks", options),
};
