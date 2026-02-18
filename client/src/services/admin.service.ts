import { ApiClient } from "./api.client";

export interface AIModelStat {
  status: "OPEN" | "CLOSED";
  used: number;
  limit: number;
  remaining: number;
}

export interface SystemStats {
  ai_models: Record<string, AIModelStat>;
  server: {
    status: string;
    time: string;
  };
  db: "online" | "offline";
  redis: "online" | "offline";
}

export const AdminService = {
  getSystemStats: (): Promise<SystemStats> =>
    ApiClient.fetchWithAuth("/admin/stats"),

  getExams: (): Promise<any[]> =>
    ApiClient.fetchWithAuth("/admin/exams"),
};
