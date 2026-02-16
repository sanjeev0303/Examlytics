"use client";

import React from "react";
import dynamic from "next/dynamic";

const HeroCTA = dynamic(() => import("./HeroCTA").then((mod) => mod.HeroCTA), {
  ssr: false,
  loading: () => <div className="h-12 w-48 bg-white/5 rounded-full animate-pulse" />,
});

const HeroVisuals = dynamic(() => import("./HeroVisuals").then((mod) => mod.HeroVisuals), {
  ssr: false
});

export const HeroInteractive = () => {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none">
        <div className="container mx-auto px-6 h-full grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:col-start-2">
                <HeroVisuals />
            </div>
        </div>
      </div>

      {/* CTA needs to be positioned where it belongs in the layout */}
      {/* Actually, it's better to just export the components and let HeroSection use them?
          No, because HeroSection is Server. It can't import them if they use ssr: false.
          Wait, Server Components CAN import Client Components that use dynamic.
          Let's just make a wrapper for each if needed, or one big wrapper.
          The previous error was because I used `dynamic` inside the Server Component file.
          If I move the `dynamic` definition to a separate CLIENT file, I can import that CLIENT file into the SERVER file.
      */}
    </>
  );
};

// Better approach: Create separate client wrappers
export const HeroVisualsClient = dynamic(() => import("./HeroVisuals").then((mod) => mod.HeroVisuals), { ssr: false });
export const HeroCTAClient = dynamic(() => import("./HeroCTA").then((mod) => mod.HeroCTA), {
    ssr: false,
    loading: () => <div className="h-12 w-48 bg-white/5 rounded-full animate-pulse" />
});
