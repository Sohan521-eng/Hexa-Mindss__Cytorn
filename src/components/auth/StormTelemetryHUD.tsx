"use client";

import React from "react";
import { 
  Radio, 
  Wind, 
  Gauge, 
  Layers, 
  ShieldCheck, 
  Lock, 
  Globe2, 
  Activity 
} from "lucide-react";
import Noise from "@/components/ui/Noise";

export const StormTelemetryHUD: React.FC = () => {
  return (
    <div className="relative z-10 w-full p-6 sm:p-8 flex flex-col justify-between h-full pointer-events-none">
      {/* Top Header Information & Agency Brand */}
      <div className="space-y-4">
        {/* Orbital Pass Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F1B2F]/90 backdrop-blur-md border border-[rgba(0,242,254,0.45)] shadow-[0_0_14px_rgba(0,242,254,0.2)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E676]" />
          </span>
          <span className="text-[11px] font-mono font-bold tracking-wider text-[#00F2FE] uppercase">
            LIVE ORBITAL PASS: INSAT-3DR (08:30 UTC)
          </span>
        </div>

        {/* Platform Title & Subtitle */}
        <div className="space-y-1">
          <h2 className="font-orbitron font-extrabold text-2xl sm:text-3xl text-white tracking-wider flex items-center gap-2.5">
            <span className="text-[#00F2FE] drop-shadow-[0_0_12px_rgba(0,242,254,0.6)]">CYCLO-AI</span>
            <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-[#00F2FE]/15 border border-[#00F2FE]/60 text-[#00F2FE]">
              SECURE EOC
            </span>
          </h2>
          <p className="text-xs font-sans text-slate-300 max-w-md leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
            AI/ML Tropical Cyclone Identification, Dvorak Intensity Estimation &amp; Physics-Informed Trajectory Prediction System.
          </p>
        </div>
      </div>

      {/* Center / Bottom Floating Storm Telemetry Card */}
      <div className="my-auto py-6">
        <div
          className="relative overflow-hidden rounded-2xl p-5 sm:p-6 space-y-4 pointer-events-auto"
          style={{
            backgroundColor: "#0A1322",
            backgroundImage:
              "linear-gradient(145deg, rgba(0, 242, 254, 0.10) 0%, rgba(15, 27, 47, 0.95) 45%, #070E1A 100%)",
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow:
              "0 8px 32px rgba(0,0,0,0.7), 0 0 16px rgba(0, 242, 254, 0.2)",
          }}
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-hidden opacity-70">
            <Noise
              patternSize={250}
              patternScaleX={1.4}
              patternScaleY={1.4}
              patternRefreshInterval={2}
              patternAlpha={18}
            />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Active Threat Headline */}
            <div className="flex items-center justify-between pb-3 border-b border-[rgba(0,242,254,0.2)]">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Active Threat Telemetry
                </span>
                <h3 className="font-orbitron font-extrabold text-lg sm:text-xl text-white tracking-wide flex items-center gap-2">
                  <span>CYCLONE MOCHA</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF5E36]/20 border border-[#FF5E36] text-[#FF5E36] font-bold">
                    VSCS (CAT 4)
                  </span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Basin Origin
                </span>
                <span className="text-xs font-mono font-bold text-[#00F2FE]">
                  Bay of Bengal
                </span>
              </div>
            </div>

            {/* Scientific Readings 3-Column Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#050B14]/80 border border-[rgba(0,242,254,0.25)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span className="text-[10px] font-mono uppercase">Pressure</span>
                </div>
                <div className="text-sm sm:text-base font-mono font-bold text-white">
                  938 <span className="text-[10px] font-normal text-slate-400">hPa</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B14]/80 border border-[rgba(0,242,254,0.25)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Wind className="w-3.5 h-3.5 text-[#FF5E36]" />
                  <span className="text-[10px] font-mono uppercase">Max Winds</span>
                </div>
                <div className="text-sm sm:text-base font-mono font-bold text-[#FF5E36]">
                  195 <span className="text-[10px] font-normal text-slate-400">km/h</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#050B14]/80 border border-[rgba(0,242,254,0.25)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Activity className="w-3.5 h-3.5 text-[#00E676]" />
                  <span className="text-[10px] font-mono uppercase">Dvorak CI</span>
                </div>
                <div className="text-sm sm:text-base font-mono font-bold text-[#00E676]">
                  T6.0 <span className="text-[10px] font-normal text-slate-400">/ CI 6.0</span>
                </div>
              </div>
            </div>

            {/* Ingestion Channels Status */}
            <div className="pt-1 space-y-1.5">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Multi-Source Satellite Feeds:</span>
                <span className="text-[#00E676] font-bold">100% INGESTION</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { name: "INSAT-3DR TIR-1", status: "SYNCED" },
                  { name: "Oceansat-3 OSCAT", status: "SYNCED" },
                  { name: "NOAA-20 ABI", status: "ACTIVE" },
                ].map((feed) => (
                  <span
                    key={feed.name}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#050B14]/90 border border-slate-700/80 text-[10px] font-mono text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676]" />
                    <span>{feed.name}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Compliance & Security Seal */}
      <div className="pt-4 border-t border-[rgba(0,242,254,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span>AES-256-GCM / SHA-512 ENCRYPTED GATEWAY</span>
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <span>IMD / NDMA PROTOCOL v2026.4</span>
        </div>
      </div>
    </div>
  );
};
