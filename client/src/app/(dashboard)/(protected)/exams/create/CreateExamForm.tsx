"use client";

import { api } from "@/lib/api";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import { AIParametersForm } from "@/components/exams/AIParametersForm";
import { ExamSummaryCard } from "@/components/exams/ExamSummaryCard";
import { ExamTypeSelector } from "@/components/exams/ExamTypeSelector";


export function CreateExamForm() {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Form State
  const [examType, setExamType] = useState("JOB");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [mode, setMode] = useState("Mixed");
  const [questionCount, setQuestionCount] = useState([10]);

  // Conditional State
  const [language, setLanguage] = useState("");
  const [jobCategory, setJobCategory] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [topicFocus, setTopicFocus] = useState(""); // Optional custom topic

  const handleSubjectToggle = useCallback((subject: string) => {
    setSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  }, []);

  const handleSliderChange = (vals: number[]) => {
    startTransition(() => {
      setQuestionCount(vals);
    });
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const payload: Record<string, unknown> = {
        type: examType,
        mode: mode.toUpperCase(),
        difficulty: difficulty,
        questionCount: questionCount[0],
        topicId: topicFocus || (examType === "CODING" ? language : examType === "JOB" ? jobCategory : "General"), // Fallback topic
        language: examType === "CODING" ? language : undefined,
        jobCategory: examType === "JOB" ? jobCategory : undefined,
        subjects: (examType === "JEE" || examType === "NEET") ? subjects : undefined,
      };

      // Validation
      if (examType === "CODING" && !language) {
        toast.error("Please select a programming language");
        setLoading(false);
        return;
      }
      if (examType === "JOB" && !jobCategory) {
        toast.error("Please select a job role is required"); // Fixed grammar later
        setLoading(false);
        return;
      }
      if ((examType === "JEE" || examType === "NEET") && subjects.length === 0) {
        toast.error("Please select at least one subject");
        setLoading(false);
        return;
      }

      if (!isAuthenticated) {
        toast.error("You must be logged in to create an exam");
        setLoading(false);
        return;
      }

      const res = await api.startExam(payload as Parameters<typeof api.startExam>[0]);

      if (res && res.jobId) {
        const jobId = res.jobId;
        toast.success("Exam generation started!");

        // Poll for completion
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await api.getExamStatus(jobId);

            if (statusRes.status === "READY") {
              clearInterval(pollInterval);
              toast.success("Exam ready! Redirecting...");
              // Navigate to exam session
              router.push(`/exam/${jobId}`);
            } else if (statusRes.status === "FAILED") {
              clearInterval(pollInterval);
              toast.error("Exam generation failed");
              setLoading(false);
            } else {
              toast.info(`Generating exam... (${statusRes.status})`);
            }
          } catch (pollError) {
            console.error("Polling error:", pollError);
          }
        }, 2000); // Poll every 2 seconds

        // Timeout after 60 seconds
        setTimeout(() => {
          clearInterval(pollInterval);
          if (loading) {
            toast.error("Exam generation timed out");
            setLoading(false);
          }
        }, 60000);
      } else {
         toast.error("Failed to start exam generation");
         setLoading(false);
      }

    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6">
      <ExamTypeSelector value={examType} onValueChange={setExamType} />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <div className="md:col-span-2 space-y-6">
          <AIParametersForm
            examType={examType}
            language={language}
            setLanguage={setLanguage}
            jobCategory={jobCategory}
            setJobCategory={setJobCategory}
            subjects={subjects}
            handleSubjectToggle={handleSubjectToggle}
            topicFocus={topicFocus}
            setTopicFocus={setTopicFocus}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            mode={mode}
            setMode={setMode}
          />
        </div>

        <div className="space-y-6">
          <ExamSummaryCard
            questionCount={questionCount}
            handleSliderChange={handleSliderChange}
            examType={examType}
            difficulty={difficulty}
            language={language}
            jobCategory={jobCategory}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
