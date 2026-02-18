"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  BarChart2,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Exams", href: "/exams", icon: BookOpen },
  { label: "Weak Topics", href: "/weak-topics", icon: Target },
  { label: "Analytics", href: "/analytics", icon: BarChart2 },
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
];

const ADMIN_NAV_ITEMS = [
  { label: "Manage Exams", href: "/admin/exams", icon: BookOpen },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user?.role === "admin";
  const allNavItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_NAV_ITEMS] : NAV_ITEMS;

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };


  return (
    <aside
      className={cn(
        "h-screen bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl border-r border-gray-200 dark:border-white/10 transition-all duration-300 ease-in-out relative flex flex-col z-50",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 rounded-full p-1 shadow-md hover:scale-110 transition-transform z-50 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Header */}
      <div className={cn("h-16 flex items-center px-6 border-b border-gray-100 dark:border-white/5 mb-6", isCollapsed ? "justify-center px-0" : "justify-between")}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold">E</span>
          </div>
          {!isCollapsed && (
            <span className="font-heading font-bold text-lg text-gray-900 dark:text-white truncate">
              Examlytics
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {allNavItems.map((item) => {
          const isActive = mounted ? (pathname === item.href || pathname.startsWith(`${item.href}/`)) : false;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("shrink-0 transition-colors", isActive && "text-blue-600 dark:text-blue-400")} />

              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}


      </nav>

      {/* User Section */}
      <div className={cn("p-4 border-t border-gray-100 dark:border-white/5 mt-auto", isCollapsed && "flex justify-center")}>
        <div className={cn("flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer w-full group", isCollapsed && "justify-center p-0 hover:bg-transparent")}>
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm">
                {mounted ? (user?.firstName?.[0] || "U") : "?"}
            </div>
          {!isCollapsed && mounted && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{user?.firstName} {user?.lastName}</span>
              <button
                onClick={handleLogout}
                className="text-xs text-red-500 hover:text-red-400 text-left mt-0.5 flex items-center gap-1"
              >
                <LogOut size={12} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
