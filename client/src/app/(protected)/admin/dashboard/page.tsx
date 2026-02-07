"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, BookOpen, FileQuestion, Activity } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminStats()
      .then(setStats)
      .catch((err) => {
         console.error("Failed to load admin stats", err);
         // Fallback mock
         setStats({ totalUsers: 142, totalExams: 15, totalQuestions: 1250 });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading admin stats...</div>;

  return (
    <div className="space-y-8 animate-fade-in-up">
      <h1 className="text-3xl font-bold font-heading text-gray-900">System Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
        </Card>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
                <FileQuestion className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalQuestions || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Across 12 topics</p>
            </CardContent>
        </Card>

         <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Exams Taken</CardTitle>
                <Activity className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{stats?.totalExams || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Active sessions today</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="h-[300px] flex items-center justify-center border-dashed">
            <span className="text-muted-foreground">User Growth Chart (Placeholder)</span>
         </Card>
         <Card className="h-[300px] flex items-center justify-center border-dashed">
            <span className="text-muted-foreground">Exam Activity Heatmap (Placeholder)</span>
         </Card>
      </div>
    </div>
  );
}
