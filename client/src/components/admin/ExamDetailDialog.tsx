"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Cpu, Calendar, User, ChevronRight, Activity, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExamDetailProps {
  exam: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExamDetailDialog({ exam, open, onOpenChange }: ExamDetailProps) {
  if (!exam) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 border-none bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl">
        <div className="max-h-[90vh] overflow-y-auto">
          <div className="p-8 space-y-8">
            <DialogHeader className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-2xl bg-blue-500/10 text-blue-500">
                      <Brain size={24} />
                    </div>
                    <DialogTitle className="text-3xl font-heading font-black tracking-tight capitalize">
                      {exam.topic}
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-gray-500 dark:text-zinc-400 font-medium">
                    Exam Reference: <span className="font-mono text-xs">{exam.id}</span>
                  </DialogDescription>
                </div>
                <Badge variant={exam.status === "COMPLETED" ? "default" : "secondary"} className="rounded-full px-4 py-1 text-xs font-bold shadow-sm">
                  {exam.status}
                </Badge>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                icon={User}
                label="Assigned To"
                value={exam.userEmail}
                subValue="Active Student"
                color="blue"
              />
              <MetricCard
                icon={Calendar}
                label="Generated At"
                value={format(new Date(exam.createdAt), "MMM d, yyyy")}
                subValue={format(new Date(exam.createdAt), "HH:mm")}
                color="indigo"
              />
              <MetricCard
                icon={Cpu}
                label="AI Investment"
                value={`${exam.tokenCost.toLocaleString()} tokens`}
                subValue="Groq Llama 3"
                color="purple"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
                  Question Preview
                </h4>
                <div className="px-3 py-1 rounded-full bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[10px] font-bold">
                  {exam.questionsCount} ITEMS
                </div>
              </div>

              <div className="space-y-3">
                 {/* This would ideally list some question snippets if they were passed in,
                     but for now we show session stats */}
                 <div className="p-6 rounded-3xl bg-gray-50/50 dark:bg-white/5 border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-center space-y-3">
                    <Activity className="text-gray-400" size={32} />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Detailed questions view pending</p>
                      <p className="text-xs text-gray-500 max-w-[280px]">AI-generated questions are stored in the relational database. Status is currently {exam.status}.</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
               <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest group cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-500/10 px-4 py-2 rounded-full transition-all">
                  Open Session Analytics
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MetricCard({ icon: Icon, label, value, subValue, color }: any) {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-500",
    indigo: "bg-indigo-500/10 text-indigo-500",
    purple: "bg-purple-500/10 text-purple-500",
  };

  return (
    <div className="p-5 rounded-4xl bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 space-y-3">
      <div className={cn("p-2 w-fit rounded-2xl", colors[color])}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">{label}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{value}</p>
        <p className="text-[10px] font-medium text-gray-500">{subValue}</p>
      </div>
    </div>
  );
}
