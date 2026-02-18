import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Tag, Cpu } from "lucide-react";
import { useState } from "react";
import { ExamDetailDialog } from "./ExamDetailDialog";

interface ExamRecord {
  id: string;
  topic: string;
  userEmail: string;
  status: string;
  tokenCost: number;
  createdAt: string;
  questionsCount: number;
}

export function ExamsTable({ exams = [] }: { exams: ExamRecord[] }) {
  const [selectedExam, setSelectedExam] = useState<ExamRecord | null>(null);

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden overflow-x-auto shadow-xl shadow-blue-500/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-white/5">
              <th className="px-6 py-4 font-bold text-sm">Exam Details</th>
              <th className="px-6 py-4 font-bold text-sm">User</th>
              <th className="px-6 py-4 font-bold text-sm">Status</th>
              <th className="px-6 py-4 font-bold text-sm">AI Usage</th>
              <th className="px-6 py-4 font-bold text-sm text-right">Generated At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {exams.map((exam) => (
              <tr
                key={exam.id}
                className="hover:bg-gray-50/30 dark:hover:bg-white/5 transition-colors group cursor-pointer"
                onClick={() => setSelectedExam(exam)}
              >
              <td className="px-6 py-4">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-gray-900 dark:text-white capitalize truncate">{exam.topic}</span>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium">
                    <Tag size={10} className="text-blue-500" />
                    {exam.questionsCount} Questions
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                    {exam.userEmail?.[0].toUpperCase() || "?"}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{exam.userEmail}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <Badge variant={exam.status === "COMPLETED" ? "default" : "secondary"} className="rounded-full px-2 py-0 text-[10px]">
                  {exam.status}
                </Badge>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <div className="p-1 px-2 rounded-lg bg-zinc-100 dark:bg-white/5 flex items-center gap-2 border border-black/5 dark:border-white/5">
                    <Cpu size={12} className="text-blue-500" />
                    <span className="text-[11px] font-mono font-bold text-gray-700 dark:text-gray-300">
                      {exam.tokenCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                 <div className="flex flex-col items-end gap-1">
                   <span className="text-xs text-gray-900 dark:text-white font-medium">
                     {format(new Date(exam.createdAt), "MMM d, yyyy")}
                   </span>
                   <span className="text-[10px] text-gray-500 font-bold tabular-nums">
                     {format(new Date(exam.createdAt), "HH:mm")}
                   </span>
                 </div>
              </td>
            </tr>
          ))}
          {exams.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-gray-50 dark:bg-white/5">
                    <Tag className="text-gray-300" size={24} />
                  </div>
                  <span className="text-sm text-gray-400">No platform exam records found yet.</span>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
      <ExamDetailDialog
        exam={selectedExam}
        open={!!selectedExam}
        onOpenChange={(open) => !open && setSelectedExam(null)}
      />
    </>
  );
}
