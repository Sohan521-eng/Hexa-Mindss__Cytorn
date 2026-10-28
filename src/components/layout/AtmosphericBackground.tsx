"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Scanner } from "@/components/ui/Scanner";

export function AtmosphericBackground() {
  const pathname = usePathname();

  // Remove the blue atmospheric scanner layer on the Digital Twin page
  if (pathname === "/digital-twin" || pathname?.startsWith("/digital-twin")) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Scanner
        color1="#0094ff"
        color2="#00eaff"
        color3="#ff6d07"
        speed={0.5}
        sweepSpeed={0.5}
        sweepWidth={2}
        sweepFalloff={6}
        scale={1.5}
        frequency={2}
        ripple={0.25}
        bandDensity={11}
        lineSharpness={4}
        glow={0}
        scanDirection="vertical"
        colorSpread={1}
        brightness={1.0}
        contrast={1.5}
        softness={3}
        vignette={0.7}
        scanline={true}
        grain={false}
        grainIntensity={0}
        opacity={0.9}
        mouseInteraction={true}
        mouseRadius={0.3}
        mouseStrength={1.25}
        className="w-full h-full"
      />
    </div>
  );
}
