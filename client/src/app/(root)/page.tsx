"use client";

import { useEffect, useState } from "react";
import { useUser, useAuth, UserButton } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { LoaderSpinner } from "@/components/global/loader";
import { UserData } from "@/types";
import Navbar from "./_components/navbar";
import HeroSection from "./_components/hero-section";
import DashboardPreview from "./_components/dashboard-preview";
import FeaturesSection from "./_components/features-section";
import CodepadSection from "./_components/codepad-section";
import AnalyticsSection from "./_components/analytics-search";
import TestimonialsSection from "./_components/testimonials-section";
import PricingSection from "./_components/pricing-section";
import CtaSection from "./_components/cta-section";
import FaqSection from "./_components/faq-section";
import Footer from "./_components/footer";
import WhoIsExamlytics from "./_components/who-is-examlytics";
import EndGoalSection from "./_components/end-goal-section";
import ExtendedFeatures from "./_components/exxxtended-features";



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
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
    return (
      <LoaderSpinner />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body relative overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* iPrep-style Global Background Gradient */}
      <div className="fixed inset-0 -z-50 h-full w-full bg-background bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />

      <Navbar />
      <HeroSection />
      <DashboardPreview />
      <FeaturesSection />
      <WhoIsExamlytics />
      <ExtendedFeatures />
      <CodepadSection />
      <AnalyticsSection />
      <TestimonialsSection />
      <PricingSection />
      <EndGoalSection />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
