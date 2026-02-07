import { useQuery } from "@tanstack/react-query";

interface LiveMetrics {
  active_users: number;
  exams_in_progress: number;
  ai_rpm: number;
  error_rate: number;
  system_status: "healthy" | "degraded" | "down";
}

const fetchLiveMetrics = async (): Promise<LiveMetrics> => {
  const response = await fetch("/api/metrics/live");
  if (!response.ok) {
    throw new Error("Failed to fetch live metrics");
  }
  return response.json();
};

export const useRealTimeMetrics = () => {
  return useQuery({
    queryKey: ["live-metrics"],
    queryFn: fetchLiveMetrics,
    refetchInterval: 2000, // Poll every 2 seconds (Tier 1 strategy)
    staleTime: 1000,
    refetchOnWindowFocus: true,
  });
};
