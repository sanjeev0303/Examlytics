"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth, UserButton } from "@clerk/nextjs";
import { LoaderSpinner } from "@/components/global/loader";
import { UserData } from "@/types";
// import Navbar from "./_components/navbar";
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
import Navbar from "@/components/home/navbar";

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

  if (!isLoaded) {
    return <LoaderSpinner />;
  }

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
