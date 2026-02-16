import React from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AnalyticsIsland } from "./AnalyticsIsland";

export const AnalyticsSection = () => {
  return (
    <SectionWrapper>
      <div className="text-center mb-20 relative z-10">
        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
          Deep <span className="text-brand-accent">Analytics</span> & Insights
        </h2>
        <p className="text-gray-400 mt-2">See your performance. Don&apos;t just guess.</p>
        <p className="text-white/60 max-w-xl mx-auto">
          We don&apos;t just give you marks. We dissect your performance across 40+ parameters to find exactly where you can improve.
        </p>
      </div>

      <AnalyticsIsland />
    </SectionWrapper>
  );
};
