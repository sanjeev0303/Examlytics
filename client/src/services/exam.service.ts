import { ApiClient } from "./api.client";

export const ExamService = {
  getAll: (options?: RequestInit) => ApiClient.fetchWithAuth("/exams", options),

  getTopics: (options?: RequestInit) => ApiClient.fetchWithAuth("/topics", options),

  start: (data: {
    type: string;
    mode: string;
    difficulty: string;
    questionCount: number;
    topicId: string;
    language?: string;
    jobCategory?: string;
    subjects?: string[];
    examId?: string;
  }, options?: RequestInit) =>
    ApiClient.fetchWithAuth("/exams/start", {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  submit: (data: { sessionId: string; answers: any; timeTaken: number }, options?: RequestInit) =>
    ApiClient.fetchWithAuth("/exams/submit", {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),

  getSession: (sessionId: string, options?: RequestInit) =>
    ApiClient.fetchWithAuth(`/exams/session/${sessionId}`, options),

  getHistory: (options?: RequestInit) => ApiClient.fetchWithAuth("/exams/history", options),

  getExamStatus: (jobId: string, options?: RequestInit) =>
    ApiClient.fetchWithAuth(`/exams/status/${jobId}`, options),
};
