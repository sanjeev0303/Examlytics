import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { ProblemSolutionSection } from "@/components/home/ProblemSolutionSection";
import { ExamEngineSection } from "@/components/home/ExamEngineSection";
import { AnalyticsSection } from "@/components/home/AnalyticsSection";
import { WeakTopicSection } from "@/components/home/WeakTopicSection";
import { CodingPrepSection } from "@/components/home/CodingPrepSection";
import { MultiExamSection } from "@/components/home/MultiExamSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { AdminSection } from "@/components/home/AdminSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="bg-[#050511] min-h-screen text-white overflow-hidden selection:bg-brand-primary/30">
      <HeroSection />
      <ProblemSolutionSection />
      <ExamEngineSection />
      <AnalyticsSection />
      <WeakTopicSection />
      <CodingPrepSection />
      <MultiExamSection />
      <HowItWorksSection />
      <AdminSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
