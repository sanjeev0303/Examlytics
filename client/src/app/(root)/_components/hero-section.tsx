"use client"

import { Play } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export default function HeroSection() {
  const { isSignedIn } = useUser()

  return (
    <section className="relative pt-40 pb-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto overflow-hidden">
      {/* Background Blobs - Refined for iPrep style */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-40 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-primary font-semibold text-xs mb-8 uppercase tracking-wider hover:scale-105 transition-transform cursor-default">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          Next-Generation Assessment
        </div>

        <h2 className="text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 leading-tight text-balance text-foreground font-heading">
          Transform Your Learning{" "}
          <span className="text-gradient block mt-2">
            with AI-Driven Analytics
          </span>
        </h2>

        <p className="text-xl text-text-secondary mb-12 leading-relaxed max-w-2xl mx-auto font-body">
          Examlytics is a next-generation platform that intelligently generates personalized tests,
          evaluates responses, and provides deep learning analytics to transform how you prepare.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="group relative px-8 py-4 bg-primary text-white rounded-full font-semibold shadow-xl hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative">Start Free Trial</span>
          </Link>

          <button className="group px-8 py-4 rounded-full font-semibold border border-border bg-surface hover:bg-muted text-foreground flex items-center justify-center gap-3 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 text-primary fill-primary" />
            </div>
            Watch Demo
          </button>
        </div>

        {/* User Avatars Social Proof */}
        <div className="flex flex-col items-center justify-center gap-4 mb-16 animate-float">
           <div className="flex items-center gap-4 p-2 pr-6 rounded-full bg-surface/50 backdrop-blur-sm border border-border/50">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-linear-to-br from-gray-200 to-gray-400 border-2 border-surface flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm"
                  style={{
                    backgroundImage: `linear-gradient(135deg, hsl(${200 + i * 20}, 70%, 80%), hsl(${200 + i * 20}, 70%, 60%))`
                  }}
                >
                </div>
              ))}
            </div>
            <div className="text-left">
               <div className="flex gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-3 h-3 text-orange-400 fill-orange-400">★</div>
                ))}
               </div>
               <p className="text-xs font-medium text-text-secondary"><span className="font-bold text-foreground">50,000+</span> students learning</p>
            </div>
           </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 sm:gap-12 py-10 border-t border-border/40 max-w-4xl mx-auto">
          {[
            { value: "50K+", label: "Active Users" },
            { value: "95%", label: "Improvement Rate" },
            { value: "100K+", label: "Tests Generated" }
          ].map((stat, i) => (
            <div key={i} className="group cursor-default">
              <p className="text-4xl sm:text-5xl font-bold text-foreground group-hover:text-primary transition-colors font-heading mb-2">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
