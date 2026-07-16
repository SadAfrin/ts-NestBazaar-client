"use client";

import { ReactNode, JSX } from "react";
import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import LiveActivityFeed from "@/components/shared/LiveActivityFeed";

interface RootContainerLayoutProps {
  children: ReactNode;
}

export default function RootContainerLayout({ children }: RootContainerLayoutProps): JSX.Element {
  return (
    <div className="relative flex flex-col min-h-screen bg-white">
      {/* Platform Universal Navigation Bar */}
      <Navbar />
      
      {/* Main Stream Segment */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      {/* Footer System */}
      <Footer />
      
      {/* Realtime Live Activity Feed Tracker */}
      <LiveActivityFeed />
    </div>
  );
}