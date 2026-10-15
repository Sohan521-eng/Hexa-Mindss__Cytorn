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
    <div className="relative min-h-screen w-full bg-[#050B14] text-white flex flex-col lg:flex-row overflow-x-hidden">
      {/* Background Stationary Noise Layer */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden opacity-50 z-0">
        <Noise
          patternSize={250}
          patternScaleX={1.4}
          patternScaleY={1.4}
          patternRefreshInterval={2}
          patternAlpha={18}
        />
      </div>

      {/* Ambient Cyber Radial Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#00F2FE]/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#FF5E36]/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* LEFT PANEL: 50% Atmospheric Vortex Canvas & Real-time Satellite Telemetry HUD */}
      <div className="relative w-full lg:w-1/2 min-h-[480px] lg:min-h-screen border-b lg:border-b-0 lg:border-r border-[rgba(0,242,254,0.3)] z-10 flex flex-col">
        {/* Dynamic Canvas Background */}
        <div className="absolute inset-0 w-full h-full">
          <AuthVortexCanvas />
        </div>

        {/* Floating Telemetry HUD */}
        <div className="relative z-10 w-full h-full flex flex-col">
          <StormTelemetryHUD />
        </div>
      </div>

      {/* RIGHT PANEL: 50% Mission-Control Authentication & Role Terminal */}
      <div className="relative w-full lg:w-1/2 min-h-screen z-10 flex flex-col justify-center items-center py-8 lg:py-12 overflow-y-auto no-scrollbar">
        <AuthTerminal initialMode={initialMode} />
      </div>
    </div>
  );
};
