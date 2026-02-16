import React from "react";
import { HowItWorksIsland } from "./HowItWorksIsland";

export const HowItWorksSection = () => {
  return (
    <div className="bg-[#050511] py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-24">
          <span className="text-brand-primary text-sm font-bold uppercase tracking-widest">Workflow</span>
          <h2 className="text-3xl md:text-5xl font-heading font-bold mt-2">How It Works</h2>
        </div>

        <HowItWorksIsland />
      </div>
    </div>
  );
};
