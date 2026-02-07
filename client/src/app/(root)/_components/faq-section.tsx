"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

export default function FaqSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "What is Examlytics?",
      a: "Examlytics is a next-generation AI-driven assessment and analytics platform that transforms exam and interview preparation through intelligent test generation, personalized feedback, and deep learning analytics.",
    },
    {
      q: "Who can benefit from Examlytics?",
      a: "Students preparing for exams, job seekers practicing for interviews, competitive exam aspirants, and educational institutions looking to create and evaluate personalized assessments.",
    },
    {
      q: "How does smart test generation work?",
      a: "Our AI analyzes course content, exam type, and difficulty level to dynamically generate balanced questions. It avoids repetition and ensures comprehensive coverage of syllabus topics.",
    },
    {
      q: "Can I use Examlytics for coding practice?",
      a: "Yes! Our Coding Assessment Engine supports multiple programming languages with in-browser IDE, automated test execution, and instant feedback on code quality and optimization.",
    },
    {
      q: "What makes the analytics so powerful?",
      a: "Examlytics provides topic-wise mastery tracking, performance trends, accuracy vs speed analysis, and personalized improvement recommendations based on real learning data.",
    },
    {
      q: "Is Examlytics suitable for institutions?",
      a: "We offer institutional plans that allow educators to create custom tests, track student progress, and even train AI models aligned with their specific examination patterns.",
    },
  ]

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-primary font-semibold text-sm mb-2 uppercase tracking-wider">Help Center</p>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground font-heading">Frequently Asked Questions</h2>
          <p className="text-text-secondary font-body">Find answers to common questions about Examlytics</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  expandedFaq === i
                  ? "border-primary/50 bg-surface shadow-lg"
                  : "border-border/60 bg-surface/50 hover:bg-surface hover:border-primary/30"
              }`}
            >
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full px-8 py-6 flex items-center justify-between group text-left"
              >
                <span className={`font-bold text-lg transition-colors font-heading ${
                    expandedFaq === i ? "text-primary" : "text-foreground group-hover:text-primary"
                }`}>
                  {faq.q}
                </span>
                <span className={`p-2 rounded-full transition-all duration-300 ${
                    expandedFaq === i ? "bg-primary/10 rotate-180" : "bg-transparent group-hover:bg-primary/5"
                }`}>
                    <ChevronDown
                    className={`w-5 h-5 transition-colors ${
                        expandedFaq === i ? "text-primary" : "text-text-secondary group-hover:text-primary"
                    }`}
                    />
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${
                    expandedFaq === i ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0 pb-0"
                }`}
              >
                <div className="overflow-hidden px-8">
                  <p className="text-text-secondary leading-relaxed text-base font-body border-t border-border/50 pt-4">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
