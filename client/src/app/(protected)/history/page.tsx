"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { format, isThisWeek, isToday, isYesterday } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar } from "lucide-react";
import { List } from "react-window";
import { AutoSizer } from "react-virtualized-auto-sizer";


import { HistoryItem } from "@/components/exam/HistoryItem";
import { useMemo } from "react";

export default function ExamHistoryPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { user } = useUser();

  const { data: history, isLoading } = useQuery({
    queryKey: ["examHistory"],
    queryFn: async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`
        };
        if (user?.id) {
            headers["X-Clerk-User-ID"] = user.id;
        }
        return api.getExamHistory({ headers });
    },
    enabled: !!user?.id,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Flatten Data for Virtualization
  const flatData = useMemo(() => {
    if (!history) return [];

    const grouped: Record<string, any[]> = {};
    history.forEach((session: any) => {
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
        return 0;
    });

    const flattened: any[] = [];
    sortedKeys.forEach(key => {
        flattened.push({ type: 'header', label: key });
        grouped[key].forEach(item => flattened.push({ type: 'item', data: item }));
    });

    return flattened;
  }, [history]);

  if (!user || (!isLoading && !user.id)) return <div className="flex h-screen items-center justify-center">Please sign in to view history.</div>;

  if (isLoading) return (
      <div className="max-w-4xl mx-auto py-12 px-4 space-y-8 animate-fade-in-up">
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="h-32 bg-gray-50 dark:bg-zinc-900 border-none animate-pulse" />
            ))}
        </div>
      </div>
  );

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = flatData[index];

    if (!item) return null;

    if (item.type === 'header') {
        return (
            <div style={style} className="flex items-center pb-2 pt-6 z-10 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
                 <div className="flex items-center justify-center px-4 h-8 rounded-full bg-background border border-border shadow-sm text-xs font-semibold text-muted-foreground whitespace-nowrap">
                    {item.label}
                 </div>
            </div>
        );
    }

    return <HistoryItem session={item.data} style={style} />;
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 h-screen flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
           <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground pl-0" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
           </Button>
           <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Learning Journey</h1>
           <p className="text-gray-500 dark:text-gray-400 mt-2">Track your progress and review past assessments.</p>
        </div>
        <div className="flex gap-3">
             <div className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-lg border border-border shadow-sm text-sm">
                 <span className="font-bold text-primary">{history?.length || 0}</span> Total Exams
             </div>
             <div className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-lg border border-border shadow-sm text-sm">
                 <span className="font-bold text-emerald-500">
                     {history?.filter((h: any) => h.status === 'COMPLETED').length || 0}
                 </span> Completed
             </div>
        </div>
      </div>

      {/* Virtualized Timeline */}
      <div className="flex-1 min-h-0 relative">
          <div className="absolute left-6 top-8 bottom-0 w-px bg-border -z-10" />

          {flatData.length > 0 ? (
            <AutoSizer renderProp={({ height, width }: { height: number | undefined; width: number | undefined }) => {
                if (!height || !width) return null;
                return (
                    <List
                        style={{ height, width }}
                        rowCount={flatData.length}
                        rowHeight={130}
                        className="pl-2 md:pl-4 scrollbar-hide"
                        rowComponent={Row as any}
                        rowProps={{}}
                    />
                );
            }} />
          ) : (

             <div className="text-center py-20 pl-0">
                <div className="inline-flex items-center justify-center p-4 bg-primary/10 rounded-full mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">No history yet</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    Your learning journey starts with your first step. Take an exam to see your history here.
                </p>
                <Button className="mt-6" onClick={() => router.push("/exams")}>
                    Browse Library
                </Button>
            </div>
          )}
      </div>
    </div>
  );
}
