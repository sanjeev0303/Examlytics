import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { ReduxProvider } from "@/redux/provider";
import QueryProvider from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";
import clsx from "clsx";
import { AuthInitializer } from "@/components/auth/AuthInitializer";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});



export const metadata: Metadata = {
  title: "Examlytics | AI-Powered Exam Prep & Analytics",
  description: "Experience the future of exam preparation with Antigravity AI analysis.",
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={clsx(
          sora.variable,
          inter.variable,
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
            <AuthInitializer />
            <QueryProvider>
              {children}
            </QueryProvider>
            <Toaster richColors />
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
