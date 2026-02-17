"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";
import { EXAM_TYPES } from "./constants";
import { cn } from "@/lib/utils";

interface ExamTypeSelectorProps {
  value: string;
  onValueChange: (val: string) => void;
  className?: string;
  variant?: "glass" | "default";
}

export const ExamTypeSelector = React.memo(({
  value,
  onValueChange,
  className,
  variant = "glass"
}: ExamTypeSelectorProps) => (
  <Tabs value={value} onValueChange={onValueChange} className={cn("w-full relative z-10", className)}>
    <TabsList className={cn(
      "grid w-full grid-cols-5 p-1.5 rounded-2xl",
      variant === "glass" ? "bg-white/5 border border-white/10 backdrop-blur-md" : "bg-gray-100 border border-gray-200"
    )}>
      {EXAM_TYPES.map(type => (
        <TabsTrigger
          key={type.id}
          value={type.id}
          className={cn(
            "text-xs md:text-sm rounded-xl data-[state=active]:bg-brand-primary data-[state=active]:text-white transition-all duration-300",
            variant === "default" && "text-gray-600 data-[state=active]:bg-blue-600"
          )}
        >
          {type.label}
        </TabsTrigger>
      ))}
    </TabsList>
  </Tabs>
));

ExamTypeSelector.displayName = "ExamTypeSelector";
