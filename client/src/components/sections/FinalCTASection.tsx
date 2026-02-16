import React from "react";
import { AntigravityButton } from "@/components/ui/AntigravityButton";
import { ArrowRight } from "lucide-react";
import { FinalCTAIsland } from "./FinalCTAIsland";

export const FinalCTASection = () => {
  return (
    <div className="relative bg-[#02020a] pt-32 pb-10 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-brand-primary/10 blur-[120px] rounded-[100%] pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-60">
          <h2 className="text-4xl md:text-7xl font-heading font-bold mb-8 bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">
            Your preparation deserves intelligence.
          </h2>
          <p className="text-xl text-white/50 mb-10">
            Join thousands of students who have switched from guesswork to data-driven success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-20">
            <AntigravityButton size="lg" className="w-full sm:w-auto">
              Start Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </AntigravityButton>
            <AntigravityButton variant="secondary" size="lg" className="w-full sm:w-auto">
              Explore Demo
            </AntigravityButton>
            <AntigravityButton variant="glass" size="lg" className="w-full sm:w-auto">
              Talk to Us
            </AntigravityButton>
          </div>

          <FinalCTAIsland />
        </div>
      </div>
    </div>
  );
};
