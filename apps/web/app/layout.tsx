import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lenora — The Agentic Learning System for Students",
  description: "Don't manage your studying. Let Lenora manage it. Lenora turns your goals, deadlines, workload, and learning material into an adaptive plan — then teaches, tests, and adjusts as you learn.",
  keywords: ["Lenora", "adaptive learning", "AI student agent", "Planner", "Feynman technique", "Socratic learning", "study system"],
  authors: [{ name: "Lenora Team" }],
  openGraph: {
    title: "Lenora — The Agentic Learning System for Students",
    description: "Don't manage your studying. Let Lenora manage it. An adaptive learning system powered by Planner, Feynman, and Learner agents.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-[#0d0e15] text-[#ededf0] font-sans selection:bg-[#5683da]/30 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

