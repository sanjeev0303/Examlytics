"use client";

import { useEffect, useState, memo, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock, Award, ArrowRight, RotateCcw, BrainCircuit, Share2, Target, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { QuestionReviewCard } from "@/components/analysis/QuestionReviewCard";
import { toast } from "sonner";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Helper to format time
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
};

// Memoized list of question reviews to prevent unnecessary re-renders
const QuestionReviewList = memo(({ questions, answers }: { questions: any[], answers: any[] }) => {
    return (
        <div className="space-y-4">
            {(questions || []).map((q: any, i: number) => {
                const userAnswerObj = (answers || []).find((a: any) => a.questionId === q.id);
                const userAnswer = userAnswerObj?.answer || userAnswerObj?.selectedOption;
                const timeSpent = userAnswerObj?.timeSpent; // Extract time spent

                return (
                    <QuestionReviewCard
                        key={q.id}
                        index={i}
                        question={q}
                        userAnswer={userAnswer}
                        timeTaken={timeSpent}
                    />
                );
            })}

            {(questions || []).length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-2xl border border-dashed">
                    No questions available for review.
                </div>
            )}
        </div>
    );
});
QuestionReviewList.displayName = "QuestionReviewList";

export default function ExamResultsPage() {
  const params = useParams();
  const id = params?.id as string;

  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();

  const { data: session, isLoading, error } = useQuery({
    queryKey: ["examSession", id],
    queryFn: async () => {
      if (!id || !user?.id) return null;
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        "X-Clerk-User-ID": user.id
      };

      return api.getExamSession(id, { headers });
    },
    enabled: !!id && !!user?.id,
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Analyzing your performance...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <XCircle className="w-16 h-16 text-red-500 mb-6" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-500 mb-8 max-w-md">{(error as Error)?.message || "We couldn't retrieve the session details. It might have been deleted or expired."}</p>
        <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
      </div>
    );
  }

  // Data processing
  const accuracy = session.accuracy * 100;
  const isPassed = accuracy >= 60;
  const score = session.correctCount || 0;
  const total = session.totalQuestions || 0;

  // Dummy data for charts if not provided by backend yet
  const chartData = [
      { subject: 'Consistency', A: accuracy, fullMark: 100 },
      { subject: 'Speed', A: Math.min(100, (3600 / session.timeTaken) * 50), fullMark: 100 }, // Mock speed score
      { subject: 'Accuracy', A: accuracy, fullMark: 100 },
      { subject: 'Coverage', A: 80, fullMark: 100 }, // Mock
      { subject: 'Complexity', A: 65, fullMark: 100 }, // Mock
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-500">

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 md:p-12 shadow-2xl">
         <div className="absolute top-0 right-0 p-12 opacity-10">
            <BrainCircuit size={300} />
         </div>

         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left space-y-4">
               <div>
                  <Badge variant="outline" className="text-white border-white/20 mb-4 bg-white/5 backdrop-blur-sm">
                      Assessment Complete
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                      {isPassed ? "Outstanding Performance! 🎉" : "Good Effort! Keep Learning 📚"}
                  </h1>
                  <p className="text-gray-400 max-w-xl text-lg">
                      You've completed the <strong>{session.exam?.title || "Assessment"}</strong>.
                      {isPassed ? " You demonstrated strong understanding of the core concepts." : " Review the weak areas below to boost your score next time."}
                  </p>
               </div>

               <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                   <Button onClick={() => router.push("/exam")} className="bg-white text-gray-900 hover:bg-gray-100 font-bold border-0">
                       <RotateCcw className="w-4 h-4 mr-2" /> Retake Exam
                   </Button>
                   <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white" onClick={() => router.push("/dashboard")}>
                       Back to Dashboard
                   </Button>
               </div>
            </div>

            <div className="shrink-0 relative">
                 {/* Circular Score (Custom implementation or reuse component if available) */}
                 <div className="w-48 h-48 rounded-full border-8 border-white/10 flex items-center justify-center relative bg-gray-900/50 backdrop-blur-md">
                     <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                         <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-800/50" />
                         <circle
                            cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8"
                            className={isPassed ? "text-emerald-500" : "text-amber-500"}
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - session.accuracy)}`}
                            strokeLinecap="round"
                         />
                     </svg>
                     <div className="text-center">
                         <span className="text-5xl font-bold block">{Math.round(accuracy)}%</span>
                         <span className="text-sm text-gray-400 uppercase tracking-widest text-[10px]">Score</span>
                     </div>
                 </div>
            </div>
         </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Metrics & Charts */}
          <div className="lg:col-span-1 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/50">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{score}/{total}</div>
                          <div className="text-xs text-muted-foreground uppercase font-bold">Correct Answers</div>
                      </CardContent>
                  </Card>
                   <Card className="bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/50">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                          <Clock className="w-8 h-8 text-blue-600 mb-2" />
                          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatTime(session.timeTaken)}</div>
                          <div className="text-xs text-muted-foreground uppercase font-bold">Time Taken</div>
                      </CardContent>
                  </Card>
              </div>

              {/* Radar Chart */}
              <Card className="overflow-hidden">
                  <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" /> Skill Profile
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] flex items-center justify-center -ml-6">
                      <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                              <PolarGrid strokeOpacity={0.2} />
                              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#888' }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar name="Performance" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                              <Tooltip />
                          </RadarChart>
                      </ResponsiveContainer>
                  </CardContent>
              </Card>

              {/* AI Insight */}
               <Card className="bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/50">
                  <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                          <Zap className="w-4 h-4" fill="currentColor" /> AI Insight
                      </CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed">
                          {session.recommendation || "Based on your performance, we recommend focusing on optimizing array traversal algorithms. Your speed is good, but accuracy in edge cases needs improvement."}
                      </p>
                  </CardContent>
              </Card>
          </div>

          {/* Right Column: Detailed Review */}
          <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-gray-400" />
                      Detailed Review
                  </h2>
                  <div className="flex gap-2">
                      <Badge variant="outline" className="bg-white dark:bg-zinc-900">All</Badge>
                      <Badge variant="outline" className="text-red-500 bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/50 cursor-pointer hover:bg-red-100">Incorrect</Badge>
                  </div>
              </div>

              <QuestionReviewList questions={session.questions} answers={session.answers} />
          </div>
      </div>
    </div>
  );
}
