import { Suspense } from "react";
import { ExamService } from "@/services/exam.service";
import { LearningHealthIndex } from "@/components/dashboard/learning-health-index";
import { Skeleton } from "@/components/ui/skeleton";
import { ExamHistoryItem } from "@/types";

export async function AsyncLearningHealthIndex() {
  const history = await ExamService.getHistory().catch(() => []);

  const completedExams = (history || []).filter((e: ExamHistoryItem) => e.status === "COMPLETED");
  const avgAccuracy = completedExams.length > 0
    ? Math.round(completedExams.reduce((acc: number, curr: ExamHistoryItem) => acc + (curr.accuracy || 0), 0) / completedExams.length)
    : 0;
  const lhiScore = Math.round(avgAccuracy > 0 ? avgAccuracy : 72);

  return <LearningHealthIndex score={lhiScore} trend={2.4} />;
}

export function LearningHealthIndexSkeleton() {
  return <Skeleton className="h-[230px] w-full" />;
}
