
import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { api } from "@/lib/api";
import { RadialChart } from "@/components/analytics/RadialChart"; // Existing Client Component
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, Clock } from "lucide-react";
import { AnalysisActionButtons } from "@/components/analysis/AnalysisActionButtons"; // New Client Component
import { AnalysisView } from "@/components/analysis/AnalysisView";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function AnalysisPage({ params }: PageProps) {
  const { sessionId } = await params;
  const user = await currentUser();
  const { getToken } = await auth();

  if (!user || !user.id || !getToken) {
      return <div>Authentication required.</div>;
  }

  const token = await getToken();

    if (!token) {
        return <div>Authentication required.</div>;
    }

  const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
      "X-Clerk-User-ID": user.id
  };

  let result = null;
  try {
      result = await api.getExamSession(sessionId, { headers });
  } catch (error: any) {
      console.error("❌ Failed to fetch analysis for session:", sessionId);
      console.error("❌ Error Details:", error);
      if (error instanceof Error) {
          console.error("❌ Error Message:", error.message);
          console.error("❌ Error Stack:", error.stack);
      }
      return (
        <div className="p-10 text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Failed to load response data</h2>
            <p className="text-gray-600">Error: {error?.message || "Unknown error"}</p>
            <p className="text-xs text-gray-400 font-mono">Session: {sessionId}</p>
        </div>
      );
  }

  if (!result) return <div>Analysis not found.</div>;

  if (!result) return <div>Analysis not found.</div>;

  return (
      <AnalysisView
        initialResult={result}
        sessionId={sessionId}
        token={token}
      />
  );
}
