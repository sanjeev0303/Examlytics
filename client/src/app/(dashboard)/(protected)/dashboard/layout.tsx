import { ReactNode } from "react";

export default function DashboardParallelLayout({
  children,
  metrics,
  performance,
  recent_exams,
}: {
  children: ReactNode;
  metrics: ReactNode;
  performance: ReactNode;
  recent_exams: ReactNode;
}) {
  return (
    <div className="space-y-8">
      {/* Dynamic Metrics Section - Loads independently */}
      <div>
        {metrics}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Mastery Trends Section */}
           {performance}
           {/* Main Content (Optional fallback/additional info) */}
           {children}
        </div>

        <div className="space-y-8">
          {/* Sidebar-style slot for recent activity */}
          {recent_exams}
        </div>
      </div>
    </div>
  );
}
