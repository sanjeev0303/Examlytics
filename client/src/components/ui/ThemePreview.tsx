"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ThemePreviewProps {
  theme: "light" | "dark";
  selected: boolean;
  onClick: () => void;
}

export function ThemePreview({ theme, selected, onClick }: ThemePreviewProps) {
  return (
    <div
        className={cn(
            "cursor-pointer group relative flex flex-col gap-2",
            selected ? "opacity-100" : "opacity-70 hover:opacity-100"
        )}
        onClick={onClick}
    >
      <div className={cn(
          "w-full aspect-video rounded-xl border-2 overflow-hidden transition-all",
          selected ? "border-primary ring-2 ring-primary/20" : "border-border/50 group-hover:border-border"
      )}>
        <div className={cn(
            "w-full h-full p-2 flex gap-2",
            theme === "dark" ? "bg-zinc-950" : "bg-white"
        )}>
            {/* Sidebar Mockup */}
            <div className={cn(
                "w-1/4 h-full rounded-lg flex flex-col gap-1.5 p-1.5",
                theme === "dark" ? "bg-zinc-900 border border-white/5" : "bg-gray-50 border border-gray-100"
            )}>
                <div className={cn("h-2 w-3/4 rounded-full mb-1", theme === "dark" ? "bg-zinc-800" : "bg-gray-200")} />
                <div className={cn("h-1.5 w-full rounded-full", theme === "dark" ? "bg-zinc-800" : "bg-gray-200")} />
                <div className={cn("h-1.5 w-full rounded-full", theme === "dark" ? "bg-zinc-800" : "bg-gray-200")} />
                <div className={cn("h-1.5 w-5/6 rounded-full", theme === "dark" ? "bg-zinc-800" : "bg-gray-200")} />
            </div>

            {/* Content Mockup */}
            <div className="flex-1 flex flex-col gap-2">
                 <div className={cn(
                    "h-8 rounded-lg w-full border border-dashed flex items-center px-2 gap-2",
                     theme === "dark" ? "border-white/10 bg-zinc-900/50" : "border-gray-100 bg-gray-50/50"
                 )}>
                    <div className={cn("h-3 w-1/3 rounded-full", theme === "dark" ? "bg-zinc-800" : "bg-gray-200")} />
                 </div>
                 <div className="flex gap-2">
                    <div className={cn(
                        "h-16 flex-1 rounded-lg border",
                        theme === "dark" ? "bg-zinc-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                    )} />
                    <div className={cn(
                        "h-16 flex-1 rounded-lg border",
                        theme === "dark" ? "bg-zinc-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                    )} />
                 </div>
                 <div className={cn(
                    "flex-1 rounded-lg border",
                     theme === "dark" ? "bg-zinc-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                 )} />
            </div>
        </div>
      </div>
      <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium capitalize">{theme}</span>
          {selected && <Check className="w-4 h-4 text-primary" />}
      </div>
    </div>
  );
}
