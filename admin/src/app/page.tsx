"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { OverviewChart, UserDistributionPie, AIUsageChart } from "@/components/AdminCharts";
import { StatsCard } from "@/components/StatsCard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { LiveMetricsBar } from "@/components/dashboard/live-metrics-bar";
import { AnomalyCenter } from "@/components/dashboard/anomaly-center";

interface UserData {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  imageUrl: string;
  role: "ADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const { user, isLoaded: userLoaded } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const [accessDenied, setAccessDenied] = useState(false);

  // Fetch User Data and Check Role using React Query
  const { data: userData, isLoading: queryLoading, error: queryError } = useQuery<UserData>({
    queryKey: ['adminUser', user?.id],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("No token found");

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      // Sync user with backend
      const syncRes = await fetch(`${apiUrl}/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: user?.primaryEmailAddress?.emailAddress,
          firstName: user?.firstName,
          lastName: user?.lastName,
          imageUrl: user?.imageUrl,
        }),
      });

      if (!syncRes.ok) {
        throw new Error("Failed to sync user");
      }

      // Get user data with role
      const meRes = await fetch(`${apiUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meRes.ok) {
        throw new Error("Failed to get user data");
      }

      const data: UserData = await meRes.json();
      return data;
    },
    enabled: !!userLoaded && !!user,
  });

  // Fetch Admin Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
       const token = await getToken();
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
       const res = await fetch(`${apiUrl}/admin/stats`, {
           headers: { Authorization: `Bearer ${token}` }
       });
       if (!res.ok) throw new Error("Failed to fetch admin stats");
       return res.json();
    },
    enabled: !!userData && userData.role === "ADMIN"
  });

  // Handle access denied based on query result
  useEffect(() => {
    if (userData && userData.role !== "ADMIN") {
      setAccessDenied(true);
    }
  }, [userData]);

  const loading = !userLoaded || queryLoading;
  const error = queryError ? (queryError as Error).message : null;

  if (!userLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="p-8 rounded-2xl backdrop-blur-xl bg-red-500/10 shadow-2xl border border-red-500/20 max-w-md text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="p-8 rounded-2xl backdrop-blur-xl bg-red-500/10 shadow-2xl border border-red-500/20 max-w-md text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-6">
            You don't have admin privileges. Please contact an administrator if you believe this is an error.
          </p>
          <div className="flex justify-center">
             <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-8">

             {/* Header */}
            <header className="border-b border-white/10 bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                <div className="px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                    Dashboard Overview
                </h2>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 hidden md:block">Updated: {new Date().toLocaleTimeString()}</span>
                    <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30">
                    System: Online
                    </span>
                </div>
                </div>
            </header>

            <div className="p-6 space-y-8">
                 {/* Welcome */}
                <div>
                   <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {userData?.firstName || "Admin"} 👋</h1>
                   <p className="text-gray-400">Here is what's happening with your application today.</p>
                </div>

                {/* Live Metrics Pulse */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Real-Time Observability</h3>
                    <LiveMetricsBar />
                </div>

                 {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "DAU (Active Users)", value: stats?.active_users || "124", icon: "👥", color: "blue" },
                    { label: "Exams Generated (Today)", value: stats?.exams_today || "45", icon: "📝", color: "purple" },
                    { label: "AI Cost Est. (Today)", value: "$4.85", icon: "💰", color: "yellow" },
                    { label: "System Health", value: "99.9%", icon: "❤️", color: "green" },
                ].map((stat, i) => (
                    <StatsCard
                        key={i}
                        label={stat.label}
                        value={stat.value}
                        icon={stat.icon}
                        color={stat.color as any}
                    />
                ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    {/* Main Chart */}
                    <Card className="col-span-1 lg:col-span-4 border-white/10 bg-[#18181b]">
                        <CardHeader>
                            <CardTitle>Application Activity</CardTitle>
                            <CardDescription>Total exams created and taken over time</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                           <OverviewChart />
                        </CardContent>
                    </Card>

                     {/* Side Charts */}
                    <div className="col-span-1 lg:col-span-3 space-y-6">
                         <AnomalyCenter />
                         <Card className="border-white/10 bg-[#18181b]">
                             <CardHeader>
                                <CardTitle>AI Service Load</CardTitle>
                                <CardDescription>Requests per hour</CardDescription>
                             </CardHeader>
                             <CardContent>
                                 <AIUsageChart />
                             </CardContent>
                         </Card>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card className="border-white/10 bg-[#18181b]">
                            <CardHeader>
                                <CardTitle>User Distribution</CardTitle>
                                <CardDescription>Active vs Inactive status</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <UserDistributionPie />
                            </CardContent>
                     </Card>
                     <Card className="border-white/10 bg-[#18181b]">
                            <CardHeader>
                                <CardTitle>Weak Topics Trend</CardTitle>
                                <CardDescription>Most struggled concepts (Last 7d)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                     {[{topic: "Thermodynamics", score: 45}, {topic: "Organic Chem", score: 52}, {topic: "Calculus II", score: 58}].map((t, i) => (
                                         <div key={i} className="space-y-1">
                                             <div className="flex justify-between text-sm">
                                                 <span>{t.topic}</span>
                                                 <span className="text-red-400">{t.score}% Mastery</span>
                                             </div>
                                             <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                                 <div className="h-full bg-red-500" style={{ width: `${t.score}%` }}></div>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                            </CardContent>
                     </Card>
                </div>
            </div>
    </div>
  );
}
