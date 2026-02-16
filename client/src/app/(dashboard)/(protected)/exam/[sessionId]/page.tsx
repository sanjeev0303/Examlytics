
import React from "react";
import { auth, currentUser } from "@/server/auth";
import { api } from "@/lib/api";
import { ExamRunnerWrapper } from "@/components/exam/ExamRunnerWrapper"; // Helper wrapper for mutation logic
import { ExamGenerationLoader } from "@/components/exam/ExamGenerationLoader";

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
    // The original call included headers and caching options.
    // The requested change simplifies the call to just sessionId.
    // Assuming the API client handles headers/auth implicitly or it's no longer needed for this specific call.
    // The caching options are also removed as per the requested change.
    session = await api.getExamSession(sessionId);
    // The line `const initialQuestions = (session as any).questions;: { revalidate: 0 }, // For Next.js App Router caching`
    // and subsequent `cache: 'no-store' } as any);` appear to be a malformed copy-paste from the original
    // `api.getExamSession` arguments.
    // To make it syntactically correct and follow the "Use proper type or suppress" hint,
    // we'll assume the intent was to remove the `headers` and `next`/`cache` options from the `getExamSession` call.
    // If `session.questions` needs to be explicitly typed or asserted, `as any` is a suppression.
    // However, without further context on `api.getExamSession`'s return type,
    // we'll keep the `session` variable as is, assuming its type is inferred correctly or handled downstream.
    // The `initialQuestions` declaration from the instruction is removed as it was syntactically incorrect
    // and its purpose unclear in the context of the full change.
  } catch (err) {
    console.error("Failed to load session:", err);
    return <div className="h-screen flex items-center justify-center text-red-500">Failed to load exam session.</div>;
  }
  if (!session) {
    return <div className="h-screen flex items-center justify-center text-red-500">Failed to load exam session data.</div>;
  }

  // Handle Generating State
  if (session.status === "PENDING" || session.status === "PROCESSING") {
      return <ExamGenerationLoader sessionId={sessionId} />;
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
