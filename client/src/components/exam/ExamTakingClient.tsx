"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ExamRunner } from "./ExamRunner";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@clerk/nextjs";

interface ExamTakingClientProps {
  examId: string;
}

export default function ExamTakingClient({ examId }: ExamTakingClientProps) {
  const router = useRouter();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examData, setExamData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const token = await getToken();
        if (!token) {
            setError("Authentication required");
            setLoading(false);
            return;
        }

        // Fetch Exam Session Details
        // We assume the API returns { exam: { title, ... }, questions: [], duration: 3600 }
        // Adjust based on actual API response if needed.
        // If the API endpoint is different, update api.ts
        const data = await api.getExamSession(examId, {
            headers: { Authorization: `Bearer ${token}` }
        });

        // Map backend questions to frontend format if necessary
        const mappedQuestions = (data.questions || []).map((q: any) => ({
            id: q.id,
            text: q.questionText || q.text, // Handle potential naming differences
            options: q.options || [],
            type: q.questionType || q.type || "MCQ"
        }));

        setExamData({ ...data, questions: mappedQuestions });
      } catch (err: any) {
        console.error("Failed to load exam:", err);
        setError(err.message || "Failed to load exam session.");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [examId, getToken]);

  const handleExamSubmit = async (answers: { questionId: string; answer: string; timeSpent: number }[]) => {
    setIsSubmitting(true);
    try {
        const token = await getToken();
        await api.submitExam({
            examId,
            answers
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        toast.success("Exam submitted successfully!");
        router.push(`/exams/${examId}/results`);
    } catch (err: any) {
        toast.error("Submission failed", {
            description: err.message || "Please try again."
        });
        setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-zinc-950">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-medium text-muted-foreground animate-pulse">Preparing your secure environment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-gray-50 p-6 dark:bg-zinc-950 text-center">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/20">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Unable to Load Exam</h2>
        <p className="max-w-md text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
            Try Again
        </Button>
        <Button onClick={() => router.push("/dashboard")} variant="link" className="text-muted-foreground">
            Return to Dashboard
        </Button>
      </div>
    );
  }

  if (!examData) return null;

  return (
    <ExamRunner
        questions={examData.questions || []}
        duration={examData.duration || 3600}
        onSubmit={handleExamSubmit}
        isSubmitting={isSubmitting}
        title={examData.exam?.title || "Assessment"}
    />
  );
}
