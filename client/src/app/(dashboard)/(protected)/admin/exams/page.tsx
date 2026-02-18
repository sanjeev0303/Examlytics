"use client";

import { useEffect, useState } from "react";
import { ExamsTable } from "@/components/admin/ExamsTable";
import { AdminService } from "@/services/admin.service";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function AdminExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const data = await AdminService.getExams();
      setExams(data);
    } catch (error) {
      toast.error("Failed to load exam records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">Exam Records</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor all platform assessments and AI resource consumption.</p>
        </div>
        <button
          onClick={fetchExams}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      ) : (
        <ExamsTable exams={exams} />
      )}
    </div>
  );
}
