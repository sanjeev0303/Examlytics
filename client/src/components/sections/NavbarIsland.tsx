"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/authSlice";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const NavbarIsland = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/login");
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-[background-color,border-color,backdrop-filter] duration-300 border-b ${
        scrolled
          ? "bg-[#09090b]/80 backdrop-blur-md border-white/5"
          : "bg-transparent backdrop-blur-none border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold font-heading text-foreground tracking-tight">Examlytics</Link>

        {/* Centered Navigation */}
        <div className="hidden md:flex items-center gap-12">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-muted-foreground hover:text-foreground/80 font-medium text-base transition-colors duration-200 font-body"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA Button & User Profile */}
        <div className="flex items-center gap-4">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="bg-primary text-white border-white/20 border px-6 py-2.5 rounded-full font-medium hover:opacity-90 text-sm transition-all duration-200 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
          >
            {isAuthenticated ? "Dashboard" : "Get Started"}
          </Link>
          {isAuthenticated && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{user?.firstName}</span>
              <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-400 font-medium">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
