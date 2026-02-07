import { useQuery } from "@tanstack/react-query";

export interface Anomaly {
  id: string;
  category: "USER" | "SYSTEM" | "COST" | "CONTENT";
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  ai_insight: {
    summary: string;
    likely_causes: string[];
    confidence: number;
    recommended_actions: string[];
    false_positive_risk: "Low" | "Moderate" | "High";
  };
}

const fetchAnomalies = async (): Promise<Anomaly[]> => {
  const response = await fetch("/api/anomalies");
  if (!response.ok) {
    throw new Error("Failed to fetch anomalies");
  }
  return response.json();
};

export const useAnomalies = () => {
  return useQuery({
    queryKey: ["anomalies"],
    queryFn: fetchAnomalies,
    refetchInterval: 5000,
    staleTime: 2000,
  });
};
