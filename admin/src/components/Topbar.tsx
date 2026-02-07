"use client";

import { Bell, Search } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { MobileSidebar } from "@/components/MobileSidebar";

export const Topbar = () => {
    return (
        <div className="h-16 border-b border-gray-800 bg-[#111827] flex items-center justify-between px-6">
            <div className="items-center bg-gray-900 rounded-md px-3 py-1.5 border border-gray-700 w-96 hidden md:flex">
                <Search className="w-4 h-4 text-gray-500 mr-2" />
                <input
                    type="text"
                    placeholder="Search users, exams, or settings... (Cmd+K)"
                    className="bg-transparent border-none outline-none text-sm text-gray-300 w-full placeholder:text-gray-600"
                />
            </div>

            <MobileSidebar />

            <div className="flex items-center gap-x-4">
                <button className="p-2 hover:bg-gray-800 rounded-full transition relative">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>
                <div className="h-6 w-px bg-gray-700 mx-1"></div>
                 {/* UserButton is in Sidebar, but maybe good to have here too or instead?
                     Design doc said Left Navigation has User Profile.
                     Let's keep it in Sidebar as per current code, or move it here.
                     For now, I'll stick to Sidebar having the user profile to match current Sidebar.tsx
                  */}
            </div>
        </div>
    );
}
