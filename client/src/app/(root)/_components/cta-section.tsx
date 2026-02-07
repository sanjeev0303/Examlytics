"use client"

import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export default function CtaSection() {
  const { isSignedIn } = useUser()

  return (
    <section
      id="cta"
      className="py-32 px-4 sm:px-6 lg:px-8 bg-background text-white text-center relative overflow-hidden isolate"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/20 via-background to-purple-900/20 -z-20"></div>

      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/30 rounded-full blur-[120px] mix-blend-screen animate-pulse -z-10"></div>
      <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-700 -z-10"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-8 text-balance leading-tight font-heading drop-shadow-sm">
          Master Your Exams with <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 to-cyan-200">Intelligent Analytics</span>
        </h2>
        <p className="text-xl sm:text-2xl mb-12 text-blue-100/90 leading-relaxed font-body max-w-2xl mx-auto">
            Get smarter, more relevant assessments that actually prepare you for success.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href={isSignedIn ? "/dashboard" : "/sign-in"}
              className="px-10 py-5 rounded-full bg-white text-blue-900 font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-xl shadow-blue-900/40"
            >
              Start Free Trial
            </Link>
             <Link
               href="#pricing"
               className="px-10 py-5 rounded-full bg-blue-800/50 text-white border border-blue-400/30 font-bold text-lg hover:bg-blue-800 hover:border-blue-400/60 backdrop-blur-sm transition-all duration-300"
              >
              View Pricing
            </Link>
        </div>
      </div>
    </section>
  )
}
