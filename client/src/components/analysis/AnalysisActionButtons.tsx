"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface AnalysisActionButtonsProps {
  weakTopicId?: string;
  mode?: "improve" | "dashboard";
}

export function AnalysisActionButtons({ weakTopicId, mode = "improve" }: AnalysisActionButtonsProps) {
  const router = useRouter();

  if (mode === "dashboard") {
    return (
      <Button variant="outline" className="w-full text-white" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
      </Button>
    );
  }

  return (
    <Button
        className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white"
        onClick={() => router.push(`/exam?topicId=${weakTopicId || 'general-improvement'}&type=IMPROVEMENT`)}
        disabled={false}
    >
        Improve These Topics
    </Button>
  );
}
