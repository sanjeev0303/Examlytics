
import React, { Suspense } from "react";
import { ExamConfigForm } from "@/components/exam/ExamConfigForm";

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
      <Suspense fallback={<div>Loading...</div>}>
         <ExamConfigForm initialType={initialType} initialTopic={initialTopic} />
      </Suspense>
    </div>
  );
}
