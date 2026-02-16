
import React from "react";
import { auth, currentUser } from "@/server/auth";
import { api } from "@/lib/api";
import { AnalysisView } from "@/components/analysis/AnalysisView";

export default async function AnalysisPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  const user = await currentUser();
  const { getToken } = await auth();

  const token = await getToken();

  if (!user || !user.id || !token) {
      return <div>Authentication required.</div>;
  }

  let result = null;
  try {
     result = await api.getExamSession(sessionId, { headers: { Authorization: `Bearer ${token}` } });
  } catch (error: unknown) {
      console.error("❌ Failed to fetch analysis for session:", sessionId);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return (
        <div className="p-10 text-center space-y-4">
            <h2 className="text-xl font-bold text-red-600">Failed to load response data</h2>
            <p className="text-gray-600">Error: {errorMessage}</p>
            <p className="text-xs text-gray-400 font-mono">Session: {sessionId}</p>
        </div>
      );
  }

  if (!result) return <div>Analysis not found.</div>;

  return (
      <AnalysisView
        initialResult={result}
        sessionId={sessionId}
        token={token}
      />
  );
}
