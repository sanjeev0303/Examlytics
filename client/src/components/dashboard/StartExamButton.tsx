"use client";

import { useRouter } from "next/navigation";

export function StartExamButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/exam")}
      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-95"
    >
      Start New Exam
    </button>
  );
}
