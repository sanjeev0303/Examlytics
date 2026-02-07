"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Activity,
  BarChart,
  LogOut,
  AlertCircle
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/",
    color: "text-sky-500",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
    color: "text-violet-500",
  },
  {
    label: "Exams",
    icon: FileText,
    href: "/exams",
    color: "text-pink-700",
  },
  {
    label: "Anomalies",
    icon: AlertCircle,
    href: "/anomalies",
    color: "text-red-500",
  },
  {
    label: "AI Control",
    icon: Activity,
    href: "/ai-control",
    color: "text-emerald-500",
  },
  {
      label: "Analytics",
      icon: BarChart,
      href: "/analytics",
      color: "text-orange-500",
  },
  {
    label: "System",
    icon: Activity,
    href: "/system",
    color: "text-red-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
    color: "text-gray-400",
  },
];

export const Sidebar = ({ className }: { className?: string }) => {
  const pathname = usePathname();

  return (
    <div className={`space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white border-r border-gray-800 ${className}`}>
      <div className="px-3 py-2 flex-1">
        <Link href="/" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
             <div className="w-8 h-8 rounded-xl bg-linear-to-r from-blue-600 to-purple-600 flex items-center justify-center font-bold text-lg">
                E
             </div>
          </div>
          <h1 className="text-2xl font-bold">Examlytics</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition ${
                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
              }`}
            >
              <div className="flex items-center flex-1">
                <route.icon className={`h-5 w-5 mr-3 ${route.color}`} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2 border-t border-gray-800">
          <div className="flex items-center p-3 w-full justify-start font-medium text-zinc-400">
             <UserButton afterSignOutUrl="/sign-in" showName/>
          </div>
      </div>
    </div>
  );
};
