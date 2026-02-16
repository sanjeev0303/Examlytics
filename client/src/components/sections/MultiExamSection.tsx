import React from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { MultiExamIsland } from "./MultiExamIsland";

export const MultiExamSection = () => {
  return (
    <SectionWrapper className="overflow-visible">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
          One Platform. <br />
          <span className="text-white/50">Infinite Possibilities.</span>
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          From high school entrance exams to job readiness, Examlytics scales with your ambition.
        </p>
      </div>

      <MultiExamIsland />
    </SectionWrapper>
  );
};
