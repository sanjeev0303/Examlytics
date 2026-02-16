import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/providers/AuthProvider";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import QueryProvider from "@/providers/QueryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Examlytics Admin",
  description: "Admin Dashboard for Examlytics",
};

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#09090b] text-white`}
      >
          <QueryProvider>
            <AuthProvider>
                <AuthInitializer />
                <Toaster />
                <div className="flex h-screen overflow-hidden">
                    <Sidebar className="hidden md:flex w-72" />
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <Topbar />
                        <main className="flex-1 overflow-y-auto bg-[#09090b] p-6">
                            {children}
                        </main>
                    </div>
                </div>
            </AuthProvider>
          </QueryProvider>
      </body>
    </html>
  );
}
