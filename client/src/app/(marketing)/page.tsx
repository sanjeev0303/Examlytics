import { HeroSection } from "@/components/sections/HeroSection";
import React, { Suspense } from "react";
import nextDynamic from "next/dynamic";

export const revalidate = 3600; // Cache for 1 hour

// Standard imports for Server Components
import { ProblemSolutionSection } from "@/components/sections/ProblemSolutionSection";

// Dynamic imports for Client Components
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/Footer";

// Defer heavy section animations/charts
const ExamEngineSection = nextDynamic(() => import("@/components/sections/ExamEngineSection").then(mod => mod.ExamEngineSection));
const AnalyticsSection = nextDynamic(() => import("@/components/sections/AnalyticsSection").then(mod => mod.AnalyticsSection));
const WeakTopicSection = nextDynamic(() => import("@/components/sections/WeakTopicSection").then(mod => mod.WeakTopicSection));
const CodingPrepSection = nextDynamic(() => import("@/components/sections/CodingPrepSection").then(mod => mod.CodingPrepSection));
const MultiExamSection = nextDynamic(() => import("@/components/sections/MultiExamSection").then(mod => mod.MultiExamSection));
const HowItWorksSection = nextDynamic(() => import("@/components/sections/HowItWorksSection").then(mod => mod.HowItWorksSection));
const AdminSection = nextDynamic(() => import("@/components/sections/AdminSection").then(mod => mod.AdminSection));
const FinalCTASection = nextDynamic(() => import("@/components/sections/FinalCTASection").then(mod => mod.FinalCTASection));

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-[#050511] min-h-screen text-white overflow-hidden selection:bg-brand-primary/30 relative">
        <HeroSection />

        <Suspense fallback={<div className="h-[600px] animate-pulse bg-white/5" />}>
          <ProblemSolutionSection />
        </Suspense>

        <Suspense fallback={<div className="h-[600px] animate-pulse bg-white/5" />}>
          <ExamEngineSection />
        </Suspense>

        <Suspense fallback={<div className="h-[600px] animate-pulse bg-white/5" />}>
          <AnalyticsSection />
        </Suspense>

        <Suspense fallback={<div className="h-[600px] animate-pulse bg-white/5" />}>
          <WeakTopicSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-white/5" />}>
          <CodingPrepSection />
        </Suspense>

        <Suspense fallback={<div className="h-[600px] animate-pulse bg-white/5" />}>
          <MultiExamSection />
        </Suspense>

        <Suspense fallback={<div className="h-[600px] animate-pulse bg-white/5" />}>
          <HowItWorksSection />
        </Suspense>

        <Suspense fallback={<div className="h-[600px] animate-pulse bg-white/5" />}>
          <AdminSection />
        </Suspense>

        <Suspense fallback={<div className="h-96 animate-pulse bg-white/5" />}>
          <FinalCTASection />
        </Suspense>

        <Footer />
      </main>
    </>
  );
}
