import dynamic from "next/dynamic";
import React, { Suspense } from "react";

const ExamConfigForm = dynamic(() => import("@/components/exam/ExamConfigForm").then(mod => mod.ExamConfigForm), {
  loading: () => <div className="animate-pulse bg-muted/20 h-[500px] w-full rounded-2xl" />
});

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NewExamPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialType = (resolvedSearchParams.type as string) || "JOB";
  const initialTopic = (resolvedSearchParams.topic as string) || "";

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Create New Exam</h1>
      <Suspense fallback={<div className="animate-pulse bg-muted/10 h-[500px] w-full rounded-2xl border border-dashed border-border/50 flex items-center justify-center text-muted-foreground">Initializing Exam Config...</div>}>
         <ExamConfigForm initialType={initialType} initialTopic={initialTopic} />
      </Suspense>
    </div>
  );
}
