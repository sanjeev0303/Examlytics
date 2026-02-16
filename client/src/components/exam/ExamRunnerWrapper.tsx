"use client";

import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import React, { Suspense } from "react";

import { api } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

import { Question } from "./ExamRunner";

const ExamRunner = dynamic(() => import("./ExamRunner").then(mod => mod.ExamRunner), {
    ssr: false,
    loading: () => (
        <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground font-medium">Preparing your assessment...</p>
            </div>
        </div>
    )
});

interface ExamRunnerWrapperProps {
  questions: Question[];
  duration: number;
  sessionId: string;
  userId: string;
}

export function ExamRunnerWrapper({ questions, duration, sessionId }: ExamRunnerWrapperProps) {
  const router = useRouter();

  const submitMutation = useMutation({
    mutationFn: async (answers: { questionId: string; timeSpent: number; answer: string }[]) => {
      const timeTaken = answers.reduce((acc, curr) => acc + (curr.timeSpent || 0), 0);
      return api.submitExam({ sessionId, answers, timeTaken });
    },
    onSuccess: () => {
       router.replace(`/analysis/${sessionId}`);
    },
    onError: (error) => {
        console.error(error);
        alert("Failed to submit exam");
    }
  });

  return (
     <Suspense fallback={
        <div className="flex h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
     }>
         <ExamRunner
           questions={questions}
           duration={duration}
           onSubmit={(answers) => submitMutation.mutate(answers)}
           isSubmitting={submitMutation.isPending}
         />
     </Suspense>
  );
}
