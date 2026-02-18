"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, FlaskConical, Zap, Target, BarChart, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ExamStreamingData {
  count: number;
  total: number;
  status: string;
  preview?: {
    topic: string;
    difficulty: string;
  };
}

export function ExamGenerationLoader({ jobId, onComplete, onFail }: {
  jobId: string;
  onComplete?: () => void;
  onFail?: (err?: string) => void;
}) {
  const [data, setData] = useState<ExamStreamingData>({ count: 0, total: 10, status: "INITIALIZING" });
  const [history, setHistory] = useState<string[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/exams/stream/${jobId}`;
    const es = new EventSource(url, { withCredentials: true });
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.type === "status") {
          if (payload.status === "COMPLETED" || payload.status === "DONE") {
            es.close();
            onComplete?.();
            return;
          }

          if (payload.status === "FAILED") {
            es.close();
            onFail?.(payload.message || payload.error);
            return;
          }

          setData((prev) => ({
            ...prev,
            status: payload.status
          }));
          return;
        }

        if (payload.type === "question") {
          setData((prev) => ({
            ...prev,
            count: (payload.index + 1) || prev.count,
            total: payload.total || prev.total,
            preview: payload.data
          }));

          if (payload.data?.question) {
            setHistory(h => [payload.data.question, ...h].slice(0, 5));
          }
        }
      } catch (e) {
        console.error("Failed to parse SSE", e);
      }
    };

    es.onerror = () => {
      // Don't fail immediately on first error, let it retry or handle timeout in parent
      console.error("SSE Connection Error");
    };

    return () => es.close();
  }, [jobId, onComplete, onFail]);

  const progress = Math.min(100, (data.count / (data.total || 1)) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] w-full max-w-2xl mx-auto space-y-8 p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="relative w-32 h-32 rounded-full border-4 border-dashed border-blue-500/30 flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/40 flex items-center justify-center"
          >
            <FlaskConical className="text-white" size={32} />
          </motion.div>
        </motion.div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Synthesizing Your Exam
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {data.status === "GENERATING"
            ? `Forging question ${data.count + 1} of ${data.total}...`
            : data.status === "PROCESSING"
            ? "Worker active: Preparing AI context..."
            : data.status === "PENDING"
            ? "Waiting in queue: Priority synthesis..."
            : "Initializing neural pathways..."}
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-blue-500">
           <span>Progress</span>
           <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-3 rounded-full bg-gray-100 dark:bg-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
         {/* Live Metrics */}
         <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-2">
              <BarChart size={16} className="text-blue-500" />
              <span className="text-sm font-bold">Streaming Analytics</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Time Left</span>
                <p className="text-sm font-mono font-bold text-blue-500">
                  {data.count < data.total ? `~${(data.total - data.count) * 1.5}s` : "0s"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Est. Cost</span>
                <p className="text-sm font-mono font-bold text-amber-500">
                  ~{(data.count * 850).toLocaleString()} <span className="text-[8px]">TKN</span>
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex justify-between text-[10px] font-bold">
               <span className="text-gray-400">Efficiency</span>
               <span className="text-green-500">OPTIMAL</span>
            </div>
         </div>

         {/* Topic Feed */}
         <div className="p-4 rounded-2xl bg-white/50 dark:bg-zinc-900/50 border border-gray-100 dark:border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-indigo-500" />
              <span className="text-sm font-bold">Concept Feed</span>
            </div>
            <div className="space-y-2 overflow-hidden h-20 relative">
              <AnimatePresence mode="popLayout">
                {history.length > 0 ? history.map((topic, i) => (
                  <motion.div
                    key={`${topic}-${i}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1 - (i * 0.2), x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2 text-[10px] font-medium text-gray-600 dark:text-gray-400 truncate"
                  >
                    <div className="w-1 h-1 rounded-full bg-indigo-500/50" />
                    {topic}
                  </motion.div>
                )) : (
                  <div className="flex items-center justify-center h-full text-[10px] text-gray-400 italic">
                    Waiting for concepts...
                  </div>
                )}
              </AnimatePresence>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
        <div className="flex items-center gap-1">
          <Zap size={10} className="text-yellow-500" />
          Powered by Groq Llama 3
        </div>
        <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-zinc-800" />
        <div className="flex items-center gap-1">
          <Rocket size={10} className="text-blue-500" />
          Real-time Streaming
        </div>
      </div>
    </div>
  );
}
