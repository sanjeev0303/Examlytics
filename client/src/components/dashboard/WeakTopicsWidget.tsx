"use client";

import { useRouter } from "next/navigation";

interface WeakTopic {
  name: string;
  value: number;
}

interface WeakTopicsWidgetProps {
  aggregatedWeakTopics: WeakTopic[];
}

export function WeakTopicsWidget({ aggregatedWeakTopics }: WeakTopicsWidgetProps) {
  const router = useRouter();

  return (
    <div className="flex-1 bg-linear-to-br from-blue-600 to-indigo-700 rounded-[32px] p-8 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32 group-hover:scale-110 transition-transform duration-700" />

      <div className="relative z-10 h-full flex flex-col">
        <h3 className="text-xl font-bold mb-2">Priority Focus</h3>
        <p className="text-blue-100 text-sm mb-8 leading-relaxed">
          System-detected gaps in your knowledge base that need immediate attention.
        </p>

        <div className="space-y-5 flex-1">
          {aggregatedWeakTopics.length > 0 ? (
            aggregatedWeakTopics.map((topic, i) => (
              <div
                key={i}
                className="space-y-1.5 bg-white/10 p-4 rounded-2xl backdrop-blur-xs border border-white/10 hover:bg-white/15 transition-colors cursor-default"
              >
                <div className="flex justify-between items-center text-sm">
                  <span className="font-bold tracking-tight">{topic.name}</span>
                  <span className="bg-red-500/20 text-red-200 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                    {topic.value < 40 ? "Critical" : "Weak"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-red-400 to-rose-500 rounded-full"
                      style={{ width: `${topic.value}%` }}
                    />
                  </div>
                  <span className="text-xs font-black">{topic.value}%</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-blue-200 text-sm italic">No priority topics detected yet.</p>
          )}
        </div>

        <button
          onClick={() => router.push("/weak-topics")}
          className="mt-8 bg-white text-blue-700 w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-colors active:scale-95"
        >
          View Full Analysis
        </button>
      </div>
    </div>
  );
}
