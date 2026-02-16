"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export function ExamGenerationLoader({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  /* Removed Clerk hooks */
  const [error, setError] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      if (transitioning) return;

      try {
        const session = await api.getExamSession(sessionId);

        if (session.status === "COMPLETED" || (session.questions && session.questions.length > 0)) {
           setTransitioning(true);
           clearInterval(intervalId);
           router.refresh();
        } else if (session.status === "FAILED") {
           setError("Exam generation failed. Please try again.");
           clearInterval(intervalId);
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    // Initial check
    void checkStatus();

    intervalId = setInterval(checkStatus, 3000);

    return () => clearInterval(intervalId);
  }, [sessionId, router, transitioning]);

  if (error) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
            <div className="text-red-500 font-bold mb-4">Error</div>
            <p className="text-gray-700 text-center">{error}</p>
            <button
                onClick={() => router.push("/dashboard")}
                className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
                Back to Dashboard
            </button>
        </div>
     );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 font-sans">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-800">Generating Your Exam</h2>
      <p className="text-gray-600 mt-2">Our AI is crafting personalized questions for you...</p>
      <p className="text-xs text-gray-400 mt-4">Please wait, this usually takes 10-20 seconds.</p>
    </div>
  );
}
