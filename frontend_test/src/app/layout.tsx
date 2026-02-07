import type { Metadata } from "next";
import { Sora, Inter, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap"
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap"
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Examlytics | AI-Powered Exam Prep & Analytics",
  description: "Experience the future of exam preparation with Antigravity AI analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={clsx(
          sora.variable,
          inter.variable,
          plusJakarta.variable,
          manrope.variable,
          "antialiased bg-[#050511] text-white min-h-screen selection:bg-indigo-500/30 selection:text-white"
        )}
      >
        {children}
      </body>
    </html>
  );
}
