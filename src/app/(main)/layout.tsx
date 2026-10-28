"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { XaiFloatingWidget } from "@/components/xai/XaiFloatingWidget";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDigitalTwin = pathname === "/digital-twin" || pathname?.startsWith("/digital-twin");

  return (
    <div className={`min-h-screen ${isDigitalTwin ? "bg-[#050B14]" : "bg-transparent"} text-[var(--text-primary)] flex flex-col pt-16 sm:pt-20`}>
      <div className="flex flex-1 overflow-hidden">
        {/* Dynamic Mission Page Content (p-0 on digital-twin for full-bleed EOC layout) */}
        <main className={`flex-1 overflow-y-auto ${isDigitalTwin ? "p-0" : "p-4 md:p-6"}`}>
          {children}
        </main>
      </div>

      {/* Floating Tactical Cyclone AI Assistant Trigger */}
      <XaiFloatingWidget stormName='CYCLONE "ARNAB"' />
    </div>
  );
}
