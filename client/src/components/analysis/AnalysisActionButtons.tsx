"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface WeakTopic {
  topicId: string;
  topicName?: string;
  accuracy: number;
}

interface AnalysisActionButtonsProps {
  weakTopics?: WeakTopic[];
  mode?: "improve" | "dashboard";
}

export function AnalysisActionButtons({ weakTopics = [], mode = "improve" }: AnalysisActionButtonsProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState([10]);
  const [examMode, setExamMode] = useState("Mixed");

  if (mode === "dashboard") {
    return (
      <Button variant="outline" className="w-full text-white" onClick={() => router.push('/dashboard')}>
          Back to Dashboard
      </Button>
    );
  }

  const handleStartExam = async () => {
    setLoading(true);
    try {
      if (!isAuthenticated) {
        toast.error("Authentication required");
        setLoading(false);
        return;
      }

      // Use first weak topic's ID or name
      const firstTopic = weakTopics[0];
      const topicIdentifier = firstTopic?.topicId || firstTopic?.topicName || "general-improvement";

      const payload = {
        type: "IMPROVEMENT",
        mode: examMode,
        difficulty: "MEDIUM",
        questionCount: questionCount[0],
        topicId: topicIdentifier,
      };

      const res = await api.startExam(payload);

      if (res && res.jobId) {
        const jobId = res.jobId;
        toast.success("Generating your improvement exam...");
        setOpen(false);

        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await api.getExamStatus(jobId);

            if (statusRes.status === "READY") {
              clearInterval(pollInterval);
              toast.success("Exam ready! Starting now...");
              router.push(`/exam/${jobId}`);
            } else if (statusRes.status === "FAILED") {
              clearInterval(pollInterval);
              toast.error("Failed to generate exam");
              setLoading(false);
            }
          } catch (pollError) {
            console.error("Polling error:", pollError);
          }
        }, 2000);

        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (loading) {
            toast.error("Exam generation timed out");
            setLoading(false);
          }
        }, 60000);
      } else {
        toast.error("Failed to start exam");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white"
          disabled={!weakTopics || weakTopics.length === 0}
        >
          Improve These Topics
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure Your Improvement Exam</DialogTitle>
          <DialogDescription>
            Customize your targeted practice session to focus on weak areas
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Question Count */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Number of Questions: <span className="text-rose-600 font-bold">{questionCount[0]}</span>
            </Label>
            <Slider
              value={questionCount}
              onValueChange={setQuestionCount}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>5</span>
              <span>50</span>
            </div>
          </div>

          {/* Exam Mode */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Exam Mode</Label>
            <RadioGroup value={examMode} onValueChange={setExamMode}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Objective" id="objective" />
                <Label htmlFor="objective" className="font-normal cursor-pointer">
                  Objective (Multiple Choice)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Subjective" id="subjective" />
                <Label htmlFor="subjective" className="font-normal cursor-pointer">
                  Subjective (Open-ended)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Mixed" id="mixed" />
                <Label htmlFor="mixed" className="font-normal cursor-pointer">
                  Mixed (Both types)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStartExam}
            disabled={loading}
            className="w-full bg-rose-600 hover:bg-rose-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Exam...
              </>
            ) : (
              "Start Improvement Exam"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
