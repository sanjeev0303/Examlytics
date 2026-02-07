"use client";

import { ReactNode } from "react";

interface DashboardLayoutProps {
  header: ReactNode;
  stats: ReactNode;
  children: ReactNode; // Main content area (e.g., charts, grids)
  recentActivity?: ReactNode; // Optional slot for sidebar/activity feed
  className?: string;
}

export function DashboardLayout({
  header,
  stats,
  children,
  recentActivity,
  className = ""
}: DashboardLayoutProps) {
  return (
    <div className={`space-y-8 animate-fade-in-up pb-12 ${className}`}>
      {/* Header Slot */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {header}
      </div>

      {/* Stats Slot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Slot (Charts, etc.) */}
        <div className="lg:col-span-2 space-y-8">
          {children}
        </div>

        {/* Recent Activity / Secondary Slot */}
        {recentActivity && (
          <div className="space-y-8">
            {recentActivity}
          </div>
        )}
      </div>
    </div>
  );
}
