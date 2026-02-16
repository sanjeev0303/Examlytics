"use client";

import dynamic from "next/dynamic";
import React, { Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, Clock, Loader2 } from "lucide-react";
import { AnalysisActionButtons } from "@/components/analysis/AnalysisActionButtons";
import { ChartSkeleton } from "@/components/ui/skeleton";

const RadialChart = dynamic(() => import("@/components/analytics/RadialChart").then(mod => mod.RadialChart), {
    ssr: false,
    loading: () => <ChartSkeleton />
});

interface TopicInfo {
    topicId: string;
    topicName?: string;
    accuracy: number;
    severity: string;
}

interface QuestionReview {
    text: string;
    userAnswer?: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string;
    timeSpent?: number;
    type: string;
}

interface AnalysisResult {
    improvementRecommendation: string;
    weakTopics: TopicInfo[];
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
    questions: QuestionReview[];
}

interface AnalysisViewProps {
  initialResult: AnalysisResult;
  sessionId: string;
  token: string;
}

export function AnalysisView({ initialResult, sessionId, token }: AnalysisViewProps) {
  const { data: result, isFetching } = useQuery({
    queryKey: ["exam-analysis", sessionId],
    queryFn: async () => {
      const headers = { Authorization: `Bearer ${token}` };
      return api.getExamSession(sessionId, { headers }) as Promise<AnalysisResult>;
    },
    initialData: initialResult,
    refetchInterval: (query) => {
      const data = query.state.data as AnalysisResult | undefined;
      // Poll if analysis is still in progress or contains generic/uncategorized topics
      if (
        data?.improvementRecommendation === "Analysis in progress..." ||
        data?.weakTopics?.[0]?.topicId === "Uncategorized"
      ) {
        return 2000; // Poll every 2 seconds
      }
      return false; // Stop polling
    },
  });

  const isAnalyzing = result?.improvementRecommendation === "Analysis in progress...";

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
       <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Exam Analysis</h1>
            <p className="text-gray-500">Session ID: {sessionId}</p>
            {isFetching && isAnalyzing && (
                <div className="flex justify-center items-center text-rose-500 text-sm animate-pulse gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Updating AI insights...
                </div>
            )}
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Suspense fallback={<ChartSkeleton />}>
                <RadialChart score={result.correctCount} total={result.totalQuestions} title="Overall Score" description="Questions Correct" />
            </Suspense>

            <Card className="flex flex-col justify-center items-center text-center p-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">{Math.floor(result.timeTaken / 60)}m {result.timeTaken % 60}s</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Total Time</div>
            </Card>

            <Card className="flex flex-col justify-center items-center text-center p-6 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
                <div className="text-lg font-medium text-primary mb-2">Recommendation</div>
                {isAnalyzing ? (
                   <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-gray-500 text-sm">Analyzing performance...</p>
                   </div>
                ) : (
                    <p className="text-gray-700">{result.improvementRecommendation}</p>
                )}
            </Card>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-rose-500" /> Weak Topics
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {(result.weakTopics || []).length > 0 ? (
                        (result.weakTopics || []).map((topic: TopicInfo, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-rose-50 rounded-lg border border-rose-100">
                                <div>
                                    <div className="font-semibold text-gray-800">{topic.topicName && topic.topicName !== "Unknown" ? topic.topicName : (topic.topicId || "Uncategorized")}</div>
                                    <div className="text-xs text-rose-600 font-medium mt-1">{topic.severity} SEVERITY</div>
                                </div>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-rose-700">{Math.round(topic.accuracy)}%</span>
                                    <span className="text-xs text-rose-500">Accuracy</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-4">No weak topics identified. Great job!</p>
                    )}
                    {(result.weakTopics || []).length > 0 && !isAnalyzing && (
                        <AnalysisActionButtons weakTopics={result.weakTopics} />
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="text-green-500" /> Exam Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                    <p>You attempted <strong>{result.totalQuestions}</strong> questions.</p>
                    <p>You correctly answered <strong>{result.correctCount}</strong> questions.</p>
                    <p>Your average time per question was <strong>{Math.floor(result.totalQuestions > 0 ? result.timeTaken / result.totalQuestions : 0)}s</strong>.</p>
                </CardContent>
                 <div className="p-6 pt-0">
                    <AnalysisActionButtons mode="dashboard" />
                 </div>
            </Card>
       </div>

       <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">Detailed Review</h2>
            <div className="grid grid-cols-1 gap-6">
                {(result.questions || []).map((q: QuestionReview, idx: number) => {
                    const isCorrect = q.isCorrect;
                    return (
                        <Card key={idx} className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg font-medium flex items-start gap-2 leading-relaxed">
                                            <span className="text-gray-400 font-mono mt-1 text-sm">#{idx + 1}</span>
                                            {q.text}
                                        </CardTitle>
                                    </div>
                                    <div className={`shrink-0 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        {isCorrect ? "Correct" : "Incorrect"}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                    <div className={`p-4 rounded-lg border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                                        <div className="text-xs uppercase text-gray-500 font-semibold mb-1">Your Answer</div>
                                        <div className="font-medium text-gray-900">{q.userAnswer || "Skipped"}</div>
                                    </div>
                                    {!isCorrect && (
                                        <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                                            <div className="text-xs uppercase text-green-700 font-semibold mb-1">Correct Answer</div>
                                            <div className="font-medium text-gray-900">{q.correctAnswer}</div>
                                        </div>
                                    )}
                                </div>
                                {q.explanation && (
                                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                        <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                                            <HelpCircle className="w-4 h-4" /> Explanation
                                        </div>
                                        <p className="text-sm text-blue-900 leading-relaxed">{q.explanation}</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {q.timeSpent || 0}s
                                    </div>
                                    <div className="uppercase tracking-wider">{q.type}</div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
       </div>
    </div>
  );
}
