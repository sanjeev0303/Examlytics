"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { UserData } from "@/types";
import { HeroSection } from "@/components/home/HeroSection";
import Navbar from "@/components/home/navbar";
import Footer from "@/components/home/Footer";

const ProblemSolutionSection = dynamic(() => import("@/components/home/ProblemSolutionSection").then(mod => mod.ProblemSolutionSection));
const ExamEngineSection = dynamic(() => import("@/components/home/ExamEngineSection").then(mod => mod.ExamEngineSection));
const AnalyticsSection = dynamic(() => import("@/components/home/AnalyticsSection").then(mod => mod.AnalyticsSection));
const WeakTopicSection = dynamic(() => import("@/components/home/WeakTopicSection").then(mod => mod.WeakTopicSection));
const CodingPrepSection = dynamic(() => import("@/components/home/CodingPrepSection").then(mod => mod.CodingPrepSection));
const MultiExamSection = dynamic(() => import("@/components/home/MultiExamSection").then(mod => mod.MultiExamSection));
const HowItWorksSection = dynamic(() => import("@/components/home/HowItWorksSection").then(mod => mod.HowItWorksSection));
const AdminSection = dynamic(() => import("@/components/home/AdminSection").then(mod => mod.AdminSection));
const FinalCTASection = dynamic(() => import("@/components/home/FinalCTASection").then(mod => mod.FinalCTASection));

export default function Home() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      setSyncing(true);
      try {
        const token = await getToken();
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // Sync user with backend
        const response = await fetch(`${apiUrl}/auth/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-Clerk-User-ID": user.id,
          },
          body: JSON.stringify({
            email: user.primaryEmailAddress?.emailAddress,
            firstName: user.firstName,
            lastName: user.lastName,
            imageUrl: user.imageUrl,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        }
      } catch (error) {
        console.error("Error syncing user:", error);
      } finally {
        setSyncing(false);
      }
    };

    syncUser();
  }, [user, isLoaded, isSignedIn, getToken]);



  return (
    <>
      <Navbar />
      <main className="bg-[#050511] min-h-screen text-white overflow-hidden selection:bg-brand-primary/30 relative">
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
    </>
  );
}
