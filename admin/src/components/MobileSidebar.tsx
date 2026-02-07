"use client";

import { Menu } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const MobileSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="md:hidden text-gray-400 hover:text-white">
                <Menu className="w-6 h-6" />
            </Button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Sheet */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#111827] transform transition-transform duration-200 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <Sidebar />
            </div>
        </div>
    );
}
