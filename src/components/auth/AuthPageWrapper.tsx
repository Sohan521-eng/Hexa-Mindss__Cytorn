"use client";

import React from "react";
import Noise from "@/components/ui/Noise";
import { AuthVortexCanvas } from "./AuthVortexCanvas";
import { StormTelemetryHUD } from "./StormTelemetryHUD";
import { AuthTerminal } from "./AuthTerminal";

interface AuthPageWrapperProps {
  initialMode?: "signin" | "register";
}

export const AuthPageWrapper: React.FC<AuthPageWrapperProps> = ({
  initialMode = "signin",
}) => {
  return (
    <div className="relative min-h-screen w-full bg-[#050B14] text-white grid grid-cols-1 lg:grid-cols-12 overflow-x-hidden">
      {/* Calibrated Meteorological Coordinate Grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(0, 242, 254, 0.55) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 242, 254, 0.55) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
        }}
      />

      {/* Restrained Atmospheric Depth */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 24% 48%, rgba(0, 242, 254, 0.08) 0%, rgba(5, 11, 20, 0) 70%), radial-gradient(ellipse 45% 40% at 85% 90%, rgba(255, 94, 54, 0.05) 0%, rgba(5, 11, 20, 0) 72%)",
        }}
      />

      {/* Subtle Tactile Film-Grain Noise */}
      <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden opacity-40 z-0">
        <Noise
          patternSize={250}
          patternScaleX={1.3}
          patternScaleY={1.3}
          patternRefreshInterval={2}
          patternAlpha={14}
        />
      </div>

      {/* LEFT HORIZON: Live Atmospheric Vortex & Satellite Reconnaissance HUD */}
      <section className="relative lg:col-span-6 xl:col-span-7 min-h-[420px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-[rgba(0,242,254,0.22)] z-10 flex flex-col overflow-hidden">
        {/* Live 60fps Cyclone Eyewall & INSAT-3DR Radar Sweep Canvas */}
        <div className="absolute inset-0 w-full h-full opacity-90">
          <AuthVortexCanvas />
        </div>

        {/* Vignette Mask for High-Contrast Telemetry Readability */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,11,20,0.72) 0%, rgba(5,11,20,0.18) 38%, rgba(5,11,20,0.38) 65%, rgba(5,11,20,0.88) 100%)",
          }}
        />

        {/* Aerospace Viewfinder Corner Brackets */}
        <span aria-hidden="true" className="hidden sm:block absolute top-5 left-5 w-4 h-4 border-t border-l border-[#00F2FE]/45 pointer-events-none z-20" />
        <span aria-hidden="true" className="hidden sm:block absolute top-5 right-5 w-4 h-4 border-t border-r border-[#00F2FE]/45 pointer-events-none z-20" />
        <span aria-hidden="true" className="hidden sm:block absolute bottom-5 left-5 w-4 h-4 border-b border-l border-[#00F2FE]/45 pointer-events-none z-20" />
        <span aria-hidden="true" className="hidden sm:block absolute bottom-5 right-5 w-4 h-4 border-b border-r border-[#00F2FE]/45 pointer-events-none z-20" />

        {/* Live Satellite & Storm Telemetry Dossier */}
        <div className="relative z-20 w-full h-full flex flex-col">
          <StormTelemetryHUD />
        </div>
      </section>

      {/* RIGHT HORIZON: Mission-Control Clearance & Role Authentication Terminal */}
      <section className="relative lg:col-span-6 xl:col-span-5 min-h-[540px] lg:min-h-screen bg-[#070E1A]/85 backdrop-blur-xl z-10 flex flex-col justify-center items-center px-5 py-8 sm:px-10 lg:px-10 xl:px-14">
        <div className="w-full max-w-[440px]">
          <AuthTerminal initialMode={initialMode} />
        </div>
      </section>
    </div>
  );
};
