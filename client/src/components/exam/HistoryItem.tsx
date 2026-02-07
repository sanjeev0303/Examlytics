"use client";

import { memo } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, ChevronRight, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface HistoryItemProps {
  session: any;
  style?: React.CSSProperties;
}

export const HistoryItem = memo(({ session, style }: HistoryItemProps) => {
  const router = useRouter();

  return (
    <div style={style} className="px-1 py-2">
       <Card className="group hover:shadow-md transition-all duration-300 border-l-4 h-full"
            style={{ borderLeftColor: session.status === 'COMPLETED' ? (session.score/session.totalQuestions >= 0.7 ? '#10B981' : '#F59E0B') : '#E2E8F0' }}>
          <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 h-full">
              <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                      <Badge variant="outline" className="uppercase text-[10px] tracking-wider font-semibold text-muted-foreground shrink-0">
                          {session.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {format(new Date(session.startedAt), "h:mm a")}
                      </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {session.topicName || session.topicId || "Comprehensive Assessment"}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>{session.totalQuestions} Qs</span>
                      {session.status === 'COMPLETED' && (
                          <span className={`flex items-center gap-1 font-medium ${
                              session.score / session.totalQuestions >= 0.7
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}>
                              <Trophy className="w-3 h-3" />
                              {Math.round((session.score / session.totalQuestions) * 100)}%
                          </span>
                      )}
                  </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                  {session.status !== 'COMPLETED' ? (
                      <Button size="sm" className="h-8 text-xs" onClick={() => router.push(`/exam/${session.sessionId}`)}>
                          Resume <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                  ) : (
                      <Button variant="ghost" size="sm" className="h-8 text-xs hover:bg-primary/5 hover:text-primary" onClick={() => router.push(`/analysis/${session.sessionId}`)}>
                          Review <ExternalLink className="w-3 h-3 ml-2" />
                      </Button>
                  )}
              </div>
          </div>
      </Card>
    </div>
  );
});

HistoryItem.displayName = "HistoryItem";
