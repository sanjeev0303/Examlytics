import type { Metadata } from "next";
import { Sora, Inter, Plus_Jakarta_Sans, Manrope } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ReduxProvider } from "@/redux/provider";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "sonner";
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
    <ClerkProvider>
      <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
         <body
        className={clsx(
          sora.variable,
          inter.variable,
          plusJakarta.variable,
          manrope.variable,
          "antialiased bg-[#050511] text-white min-h-screen selection:bg-indigo-500/30 selection:text-white"
        )}
      >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReduxProvider>
              <QueryProvider>
                {children}
              </QueryProvider>
              <Toaster richColors />
            </ReduxProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
