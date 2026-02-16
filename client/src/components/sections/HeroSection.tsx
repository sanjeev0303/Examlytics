import React from "react";
import Image from "next/image";
import { HeroCTAClient, HeroVisualsClient } from "./HeroInteractive";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Particles & Grid */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" /> {/* Overlay for readability */}
        <Image
          src="/landing_background.webp"
          alt="Antigravity Background"
          fill
          priority
          fetchPriority="high"
          decoding="async"
          quality={80}
          className="object-cover opacity-60"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[100px_100px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] z-0 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-[128px] animate-pulse z-0 will-change-[opacity]" />
      <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-brand-secondary/10 rounded-full blur-[128px] animate-pulse z-0 will-change-[opacity]" />

      <div className="container mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text Content */}
        <div className="space-y-8 text-center lg:text-left">
          <div className="text-center lg:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-white/5 border border-white/10 text-brand-accent text-sm font-medium mb-6 backdrop-blur-md">
              ✨ The Future of Exam Preparation
            </span>
            <h1 className="text-5xl md:text-7xl font-heading font-bold leading-tight text-white">
              Learn Smarter. <br />
              Perform Better. <br />
              Succeed <span className="bg-clip-text text-transparent bg-linear-to-r from-brand-primary to-brand-accent">Faster.</span>
            </h1>
          </div>

          <p className="text-lg text-white/60 max-w-2xl mx-auto lg:mx-0 font-body">
            AI-powered analytics, weak-topic detection, and adaptive learning paths for JEE, NEET, GATE, and beyond. Your personal AI tutor is here.
          </p>

          <HeroCTAClient />
        </div>

        {/* Visuals / Floating Elements - Client Island */}
        <HeroVisualsClient />
      </div>
    </section>
  );
};
