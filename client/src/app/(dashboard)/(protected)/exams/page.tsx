"use client";

import { Search, Loader2, PlusCircle, Trophy } from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useMemo, useState, useDeferredValue } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent } from "@/components/ui/card";
import { ExamHistoryItem } from "@/types";
import { CardSkeleton } from "@/components/ui/skeleton";

const ExamCard = dynamic(() => import("@/components/cards/ExamCard").then(mod => mod.ExamCard), {
  loading: () => <CardSkeleton />
});

export default function ExamsPage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const { isLoaded, isAuthenticated, user } = useAppSelector((state) => ({
      isLoaded: !state.auth.loading,
      isAuthenticated: state.auth.isAuthenticated,
      user: state.auth.user
  }));

  // Fetch Exams
  const { data: exams, isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
        return api.getExams();
    },
    enabled: isLoaded && isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch History for "Previously Attempted"
  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ["examHistory"],
    queryFn: async () => {
        return api.getExamHistory();
    },
    enabled: !!user?.id,
  });

  const processedData = useMemo(() => {
    if (!exams) return { attempted: [], categories: {} };

    const historyMap = new Map();
    if (history && Array.isArray(history)) {
        history.forEach((h: ExamHistoryItem) => {
            if (!h.sessionId) return;
            const examId = h.sessionId; // Assuming sessionId maps to examId in this context or needs mapping
            const existing = historyMap.get(examId);
            if (!existing || new Date(h.startedAt) > new Date(existing.lastAttemptDate)) {
                 historyMap.set(examId, {
                    lastAttemptDate: h.startedAt,
                    bestScore: Math.max(existing?.bestScore || 0, h.accuracy || 0)
                 });
            } else if ((h.accuracy || 0) > existing.bestScore) {
                 // Update best score even if not latest attempt
                 existing.bestScore = h.accuracy;
                 historyMap.set(examId, existing);
            }
        });
    }

    interface Exam {
        id: string;
        title: string;
        type: string;
        category?: string;
        description?: string;
        duration?: number;
        questions?: number;
        difficulty?: "EASY" | "MEDIUM" | "HARD";
    }

    const availableExams = (exams as Exam[]).filter((exam: Exam) =>
        exam.title.toLowerCase().includes(deferredSearch.toLowerCase())
    );

    const attempted: (Exam & { lastAttemptDate: string; bestScore: number })[] = [];
    const categories: Record<string, (Exam & { lastAttemptDate?: string; bestScore?: number })[]> = {
        "Job Prep": [],
        "Coding": [],
        "Aptitude": [],
        "JEE": [],
        "Other": []
    };

    availableExams.forEach((exam: Exam) => {
        const historyData = historyMap.get(exam.id);
        const examWithMeta = { ...exam, ...historyData };

        if (historyData) {
            attempted.push(examWithMeta);
        }

        // Categorize
        // Backend types might be "JOB", "CODING" etc.
        const type = (exam.type || "Other").toUpperCase();
        if (type.includes("JOB")) categories["Job Prep"].push(examWithMeta);
        else if (type.includes("CODE") || type.includes("CODING")) categories["Coding"].push(examWithMeta);
        else if (type.includes("APTITUDE")) categories["Aptitude"].push(examWithMeta);
        else if (type.includes("JEE")) categories["JEE"].push(examWithMeta);
        else categories["Other"].push(examWithMeta);
    });

    return { attempted, categories };
  }, [exams, history, deferredSearch]);

  const isLoading = isLoadingExams || isLoadingHistory;

  if (isLoading) {
      return (
          <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  const { attempted, categories } = processedData;
  const hasResults = attempted.length > 0 || Object.values(categories).some(list => list.length > 0);

  return (
    <div className="space-y-10 animate-fade-in-up pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-6">
        <div>
          <h1 className="text-3xl font-bold font-heading text-foreground">Exam Library</h1>
          <p className="text-muted-foreground mt-2">Challenge yourself with our curated assessments.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Link href="/exams/create">
            <Button className="gap-2 shadow-lg shadow-primary/20">
              <PlusCircle className="w-4 h-4" />
              Create Exam
            </Button>
          </Link>
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 bg-background border border-border/50 rounded-xl text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {!hasResults && (
           <div className="text-center py-20 bg-muted/5 rounded-2xl border border-dashed border-border/50">
              <h3 className="text-lg font-bold text-muted-foreground">No exams found</h3>
              <p className="text-sm text-muted-foreground/70">Try adjusting your search criteria.</p>
          </div>
      )}

      {/* Previously Attempted Section */}
      {attempted.length > 0 && (
          <section className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border/30">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-bold font-heading">Jump Back In</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  <Suspense fallback={<>{[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}</>}>
                      {attempted.slice(0, 4).map((exam) => (
                          <ExamCard
                            key={`attempted-${exam.id}`}
                            {...exam}
                            category={exam.type || exam.category || "General"}
                            description={exam.description || "A comprehensive assessment of your skills in this topic."}
                            duration={exam.duration || 60}
                            questions={exam.questions || 20}
                            difficulty={exam.difficulty || "MEDIUM"}
                          />
                      ))}
                  </Suspense>
              </div>
          </section>
      )}

      {/* Category Sections */}
      {Object.entries(categories).map(([category, examsList]) => {
          if (examsList.length === 0) return null;

          return (
            <section key={category} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/30">
                    <h2 className="text-xl font-bold font-heading">{category}</h2>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">{examsList.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <Suspense fallback={<>{[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}</>}>
                        {examsList.map((exam) => (
                            <ExamCard
                                key={exam.id}
                                {...exam}
                                category={exam.type || exam.category || "General"}
                                description={exam.description || "A comprehensive assessment of your skills in this topic."}
                                duration={exam.duration || 60}
                                questions={exam.questions || 20}
                                difficulty={exam.difficulty || "MEDIUM"}
                            />
                        ))}
                    </Suspense>
                </div>
            </section>
          );
      })}

      {/* Empty State / CTA if no attempts and few exams */}
      {attempted.length === 0 && hasResults && (
           <Card className="bg-linear-to-br from-indigo-500/5 to-purple-500/5 border-dashed border-primary/20">
               <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                   <div className="p-3 bg-primary/10 rounded-full text-primary ring-4 ring-primary/5">
                       <PlusCircle className="w-8 h-8" />
                   </div>
                   <div>
                       <h3 className="text-lg font-bold">Start your first exam</h3>
                       <p className="text-muted-foreground max-w-sm mx-auto">Pick a category above and begin your journey to mastery.</p>
                   </div>
               </CardContent>
           </Card>
      )}
    </div>
  );
}
