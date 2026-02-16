"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppSelector } from "@/redux/hooks";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Filter, Search } from "lucide-react";
import { HistoryTimelineItem } from "@/components/exam/HistoryTimelineItem";
import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { ExamHistoryItem } from "@/types";
import { Input } from "@/components/ui/input";

export default function ExamHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: history, isLoading } = useQuery({
    queryKey: ["examHistory"],
    queryFn: async () => {
        return api.getExamHistory();
    },
    enabled: !!user?.id,
  });

  // Flatten Data for List
  const flatData = useMemo(() => {
    if (!history) return [];

    const grouped: Record<string, ExamHistoryItem[]> = {};
    (history || []).forEach((session: ExamHistoryItem) => {
        const date = new Date(session.startedAt);
        let key = format(date, "MMMM yyyy");

        if (isToday(date)) key = "Today";
        else if (isYesterday(date)) key = "Yesterday";
        else if (isThisWeek(date)) key = "This Week";

        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(session);
    });

    const groupOrder = ["Today", "Yesterday", "This Week"];
    const sortedKeys = Object.keys(grouped).sort((a, b) => {
        const idxA = groupOrder.indexOf(a);
        const idxB = groupOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return 0; // Natural sort for months ideally, but simplified for now
    });

    return sortedKeys.map(key => ({
        label: key,
        items: grouped[key].sort((a,b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    }));
  }, [history]);

  if (!isAuthenticated || (!isLoading && !user?.id)) return <div className="flex h-screen items-center justify-center text-muted-foreground">Please sign in to view history.</div>;

  if (isLoading) return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in-up">
        {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-24 opacity-50 animate-pulse border-none bg-muted/30" />
        ))}
      </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 min-h-[calc(100vh-100px)] animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                 <Button variant="ghost" size="icon" className="rounded-full hover:bg-accent/10" onClick={() => router.back()}>
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
                <div>
                     <h1 className="text-2xl font-bold font-heading text-foreground">Learning Journey</h1>
                     <p className="text-sm text-muted-foreground">Your assessment history and milestones.</p>
                </div>
            </div>

            <div className="flex gap-3">
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                    <Filter className="h-4 w-4" /> Filter
                </Button>
                <div className="relative">
                     <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input
                        placeholder="Search topics..."
                        className="pl-9 w-[150px] sm:w-[250px] h-9 bg-background/50"
                     />
                </div>
            </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="min-h-0 relative">
          {flatData.length > 0 ? (
            <div className="pb-20 space-y-8">
                {flatData.map((group) => (
                    <div key={group.label} className="relative">
                         <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm py-3 mb-4 flex items-center">
                            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 bg-accent/20 px-3 py-1 rounded-md">
                                {group.label}
                            </h2>
                            <div className="h-px bg-border/40 flex-1 ml-4" />
                        </div>

                        <div className="border-l-2 border-border/30 ml-3 pl-6 sm:pl-0 sm:border-0 sm:ml-0">
                             {group.items.map((session, idx) => (
                                 <HistoryTimelineItem
                                    key={session.sessionId}
                                    session={session}
                                    isLast={idx === group.items.length - 1}
                                 />
                             ))}
                        </div>
                    </div>
                ))}
            </div>
          ) : (
             <div className="text-center py-32">
                <div className="inline-flex items-center justify-center p-6 bg-accent/10 rounded-full mb-6">
                    <Calendar className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No history recorded</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto mb-8">
                    Your learning journey starts with your first step.
                </p>
                <Button onClick={() => router.push("/exam")}>
                    Browse Library
                </Button>
            </div>
          )}
      </div>
    </div>
  );
}
