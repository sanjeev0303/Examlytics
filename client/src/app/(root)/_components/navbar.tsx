"use client"

import { useState, useEffect } from "react"
import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <nav
      className={`fixed top-0 w-full z-100 transition-all duration-300 border-b ${
        scrolled
          ? "bg-[#09090b]/80 backdrop-blur-md border-white/5"
          : "bg-transparent backdrop-blur-none border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold font-heading text-foreground tracking-tight">Examlytics</Link>

        {/* Centered Navigation */}
        <div className="hidden md:flex items-center gap-12">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-muted-foreground hover:text-foreground/80 font-medium text-base transition-colors duration-200 font-body"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA Button */}
        {/* CTA Button & User Profile */}
        <div className="flex items-center gap-4">
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-in"}
            className="bg-primary text-white border-white/20 border px-6 py-2.5 rounded-full font-medium hover:opacity-90 text-sm transition-all duration-200 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 btn-smooth"
          >
            {isSignedIn ? "Dashboard" : "Get Started"}
          </Link>
          {isSignedIn && <UserButton afterSignOutUrl="/" />}
        </div>
      </div>
    </nav>
  )
}
