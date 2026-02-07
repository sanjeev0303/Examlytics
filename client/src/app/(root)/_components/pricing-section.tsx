"use client"

import { useUser } from "@clerk/nextjs"
import Link from "next/link"

export default function PricingSection() {
  const { isSignedIn } = useUser()

  const plans = [
    {
      name: "Student",
      price: "$4.99",
      description: "For exam preparation",
      features: ["Unlimited test generation", "Basic analytics", "5 coding challenges/month", "Email support"],
      badge: false,
    },
    {
      name: "Professional",
      price: "$9.99",
      description: "Most popular",
      features: [
        "Unlimited tests & coding challenges",
        "Advanced analytics & insights",
        "Priority support",
        "Curated exam datasets",
      ],
      badge: true,
    },
    {
      name: "Institution",
      price: "Custom",
      description: "For schools & institutes",
      features: ["Unlimited users & assessments", "Custom test creation", "Dedicated support", "AI model training"],
      badge: false,
    },
  ]

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl mx-auto -z-10 bg-linear-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 blur-3xl rounded-full"></div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Pricing</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground font-heading">Transparent, Flexible Pricing</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto font-body">Choose the plan that fits your learning goals</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`p-8 rounded-3xl transition-all duration-300 group relative ${
                plan.badge
                  ? "border border-primary/30 bg-surface/80 backdrop-blur-xl shadow-2xl scale-105 z-10"
                  : "border border-border/60 bg-surface/40 hover:bg-surface/80 hover:shadow-xl hover:border-primary/20 backdrop-blur-md"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-block bg-linear-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-bold mb-2 text-foreground font-heading">{plan.name}</h3>
                <p className="text-text-secondary text-sm font-body">{plan.description}</p>
              </div>

              <div className="mb-8 flex items-baseline gap-1">
                <span className="text-5xl font-bold text-foreground font-heading tracking-tight">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-lg text-text-secondary font-medium font-body">/mo</span>}
              </div>

              <Link
                href={isSignedIn ? "/dashboard" : "/sign-in"}
                className={`w-full py-4 rounded-xl font-bold mb-8 transition-all duration-200 cursor-pointer text-sm tracking-wide block text-center ${
                  plan.badge
                    ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02]"
                    : "bg-surface border border-border hover:bg-muted text-foreground hover:border-primary/30"
                }`}
              >
                Get Started
              </Link>

              <ul className="space-y-4">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex gap-3 text-text-secondary text-sm items-start font-body">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${plan.badge ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                       <span className="text-xs font-bold">✓</span>
                    </div>
                    <span className="leading-snug">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
