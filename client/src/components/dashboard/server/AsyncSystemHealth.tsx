"use client";

import { useEffect, useState } from "react";
import { ServiceHealthCard } from "../ServiceHealthCard";
import { AIModelStatusCard } from "../AIModelStatusCard";
import { AdminService, SystemStats } from "@/services/admin.service";
import { Skeleton } from "@/components/ui/skeleton";

export function AsyncSystemHealth() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await AdminService.getSystemStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch system stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <>
        <Skeleton className="h-[200px] w-full rounded-3xl" />
        <Skeleton className="h-[200px] w-full rounded-3xl" />
      </>
    );
  }

  // Transform ai_models stats for the UI
  const modelStats = stats.ai_models ? Object.entries(stats.ai_models).map(([name, data]) => ({
    name: name.toUpperCase(),
    ...data
  })) : [];

  return (
    <>
      <ServiceHealthCard
        server={stats.server.status === "online" ? "online" : "offline"}
        ai="online" // Fast-api is online if we got stats.ai_models
        db={stats.db}
        redis={stats.redis}
      />
      <AIModelStatusCard models={modelStats} />
    </>
  );
}
