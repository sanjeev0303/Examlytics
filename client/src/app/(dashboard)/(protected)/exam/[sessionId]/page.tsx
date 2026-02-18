
import React from "react";
import { auth, currentUser } from "@/server/auth";
import { api } from "@/lib/api";
import { ExamRunnerWrapper } from "@/components/exam/ExamRunnerWrapper";
import { ExamGenerationLoader } from "@/components/exams/ExamGenerationLoader";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ExamSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  const { getToken } = await auth();
  const user = await currentUser();

  const token = await getToken();

  if (!user || !user.id || !token) {
      return <div>Authentication required</div>;
  }

  let session = null;
  try {
    session = await api.getExamSession(sessionId, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
  } catch (err) {
    console.error("Failed to load session:", err);
    return <div className="h-screen flex items-center justify-center text-red-500">Failed to load exam session.</div>;
  }

  if (!session) {
    return <div className="h-screen flex items-center justify-center text-red-500">Failed to load exam session data.</div>;
  }

  // Handle Generating State
  if (session.status === "PENDING" || session.status === "PROCESSING") {
      return <ExamGenerationLoader jobId={sessionId} />;
  }

  if (!session.questions || session.questions.length === 0) {
      return (
        <div className="h-screen flex flex-col items-center justify-center space-y-4">
            <div className="text-red-500 font-semibold">Session data incomplete.</div>
            <p className="text-gray-500">Status: {session.status}</p>
            <p className="text-sm text-gray-400">Please try refreshing manually.</p>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-white">
       {/*
          Pass initial data to a client wrapper that handles:
          1. Timer
          2. Client-side Interaction
          3. Submission (Mutation)
       */}
       <ExamRunnerWrapper
         questions={session.questions}
         duration={session.duration || 600}
         sessionId={sessionId}
         userId={user.id}
       />
    </div>
  );
}
