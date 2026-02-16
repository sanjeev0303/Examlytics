import React from "react";
import { CheckCircle2 } from "lucide-react";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { WeakTopicIsland } from "./WeakTopicIsland";

export const WeakTopicSection = () => {
  return (
    <SectionWrapper>
      <div className="lg:flex items-center gap-16">
        <div className="lg:w-1/2 space-y-6">
          <span className="text-brand-warm font-bold tracking-wider text-sm uppercase">Smart Intervention</span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold">
            We find your <br />
            <span className="text-brand-warm">Weakest Links.</span>
          </h2>
          <p className="text-white/60 text-lg">
            Examlytics identifies the atomic concepts dragging your score down and creates a personalized recovery path to fix them.
          </p>
          <ul className="space-y-4">
             {["Concept-level diagnosis", "Targeted practice sets", "Video remediation", "Progress tracking"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-white/80">
                  <CheckCircle2 className="w-5 h-5 text-brand-primary" />
                  {item}
                </li>
             ))}
          </ul>
          <AntigravityButton variant="secondary" className="mt-4">
             Start Diagnostic Test
          </AntigravityButton>
        </div>

        <WeakTopicIsland />
      </div>
    </SectionWrapper>
  );
};
