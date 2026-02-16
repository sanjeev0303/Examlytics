import React from "react";
import { CheckCircle2 } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { CodingPrepIsland } from "./CodingPrepIsland";

export const CodingPrepSection = () => {
  return (
    <SectionWrapper id="coding">
      <div className="lg:flex items-center gap-16">
        <div className="lg:w-2/5 space-y-6">
          <h2 className="text-3xl md:text-5xl font-heading font-bold">
            Built for <br />
            <span className="text-brand-primary">Code Masters.</span>
          </h2>
          <p className="text-white/60 text-lg">
             Preparation for GATE, Interviews, and Coding Exams. Practice with our custom IDE and get real-time optimization feedback.
          </p>
          <div className="space-y-4 pt-4">
             {[
               "Auto-judge for 20+ Languages",
               "Space & Time Complexity Analysis",
               "Company-Specific Question Sets",
               "Mock Coding Interviews"
             ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-primary/20 flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary" />
                  </div>
                  <span className="text-white/80">{feature}</span>
                </div>
             ))}
          </div>
        </div>

        <CodingPrepIsland />
      </div>
    </SectionWrapper>
  );
};
