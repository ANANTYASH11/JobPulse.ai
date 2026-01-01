import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ChatAssistant from "@/components/ChatAssistant";
import CommandPalette from "@/components/CommandPalette";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobPulse AI — Your Career, Supercharged",
  description: "Aggregates fresh tech job listings within 48 hours, scores resume compatibility, optimizes profiles, and hosts interactive AI mock interviews. Built for ambitious developers.",
  keywords: ["job search", "resume optimizer", "mock interview", "ATS score", "career copilot", "AI jobs"],
  openGraph: {
    title: "JobPulse AI — Your Career, Supercharged",
    description: "The all-in-one AI career platform for developers. Find jobs, optimize resumes, practice interviews.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[#050507] text-zinc-200 antialiased flex flex-col`}>
        {/* Navigation */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 w-full flex flex-col pt-16">
          {children}
        </main>

        {/* Global Copilot Drawer */}
        <ChatAssistant />

        {/* Global Command Palette (Ctrl+K / Cmd+K) */}
        <CommandPalette />
      </body>
    </html>
  );
}
