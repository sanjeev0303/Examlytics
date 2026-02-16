import React from "react";
import { cn } from "@/lib/utils";

interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  perspective?: boolean;
}

export const SectionWrapper = ({
  children,
  className,
  perspective = false,
  ...props
}: SectionWrapperProps) => {
  return (
    <section
      className={cn(
        "relative w-full min-h-screen flex items-center justify-center py-20 px-6 overflow-hidden",
        perspective && "perspective-1000",
        className
      )}
      {...props}
    >
      <div className="container mx-auto max-w-7xl relative z-10">
        {children}
      </div>

      {/* Background Glow - Generic for all sections */}
      <div className="absolute inset-0 bg-brand-deep/50 -z-10 pointer-events-none" />
    </section>
  );
};
