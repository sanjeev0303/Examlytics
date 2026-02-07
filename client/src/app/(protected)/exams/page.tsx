"use client";

import { useState, useDeferredValue } from "react";
import { Search, Filter, Loader2 } from "lucide-react";
import { ExamCard } from "@/components/ui/ExamCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth, useUser } from "@clerk/nextjs";
// import { useDebounce } from "@/hooks/use-debounce"; // Removed as we use useDeferredValue

const CATEGORIES = ["All", "Job", "Coding", "Aptitude", "JEE"];

export default function ExamsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  /* replace useDebounce with useDeferredValue pattern */
  const [search, setSearch] = useState("");
  // userDeferredValue hook is efficient for this filtering as it interrupts rendering if user keeps typing
  const deferredSearch = useDeferredValue(search);

  const { getToken } = useAuth();
  const { isLoaded, isSignedIn } = useUser();

  const { data: exams, isLoading, error } = useQuery({
    queryKey: ["exams"],
    queryFn: async () => {
        const token = await getToken();
        // If public route, maybe token optional, but for now assuming protected
        const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
        return api.getExams({ headers });
    },
    enabled: isLoaded && isSignedIn,
    staleTime: 5 * 60 * 1000,
  });

  const filteredExams = (exams || []).filter((exam: any) => {
    const matchesCategory = activeCategory === "All" || exam.category === activeCategory;
    const matchesSearch = exam.title.toLowerCase().includes(deferredSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
      return (
          <div className="flex h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  if (error) {
     return (
        <div className="flex h-[60vh] flex-col items-center justify-center text-center">
            <h3 className="text-xl font-bold text-red-500">Failed to load exams</h3>
            <p className="text-muted-foreground">Please try again later.</p>
        </div>
     );
  }

  return (
    <div className="space-y-8 animate-fade-in-up pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-white">Exam Library</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a challenge to test your skills.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl text-sm w-full md:w-64 focus:ring-2 ring-blue-500/20 outline-none transition-all"
            />
          </div>
          <button className="p-2.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
            <Filter size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat
                ? "bg-gray-900 dark:bg-white text-white dark:text-black shadow-md"
                : "bg-white dark:bg-zinc-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam: any) => (
              <ExamCard key={exam.id} {...exam} />
            ))}
          </div>
      ) : (
          <div className="text-center py-20 text-muted-foreground">
              No exams found matching your criteria.
          </div>
      )}
    </div>
  );
}
