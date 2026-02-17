import React from "react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-brand-dark">
      {/* Immersive Background (Synced with HeroSection) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="/landing_background.webp"
          alt="Antigravity Background"
          fill
          loading="lazy"
          fetchPriority="low"
          className="object-cover opacity-60"
          sizes="100vw"
        />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[100px_100px] mask-[radial-gradient(ellipse_60%_60%_at_50%_50%,black,transparent)] z-0 pointer-events-none" />

      {/* Floating Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-[128px] animate-pulse z-0 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-125 h-125 bg-brand-secondary/10 rounded-full blur-[128px] animate-pulse z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6 py-12">
        <div className="flex flex-col items-center mb-8 animate-in fade-in duration-500">
            <h1 className="text-3xl font-heading font-bold text-white tracking-tighter mb-2">
                Examlytics
            </h1>
            <div className="h-1 w-12 bg-linear-to-r from-brand-primary to-brand-accent rounded-full" />
        </div>
        {children}
      </div>
    </div>
  );
}
