import React from "react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { ExamEngineIsland } from "./ExamEngineIsland";

export const ExamEngineSection = () => {
  return (
    <SectionWrapper>
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-heading font-bold mb-4">
          AI-Powered <span className="text-brand-primary">Exam Engine</span>
        </h2>
        <p className="text-white/60 max-w-2xl mx-auto">
          Generate custom mock tests tailored to your exact difficulty level and weak areas in seconds.
        </p>
      </div>

      <ExamEngineIsland />
    </SectionWrapper>
  );
};
