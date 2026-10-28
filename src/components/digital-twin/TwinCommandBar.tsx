"use client";

import React from "react";
import { 
  ChevronDown, 
  ShieldAlert, 
  Compass, 
  SlidersHorizontal,
  Flame
} from "lucide-react";
import { StormContext, DistrictInfo, RbacRole } from "./types";
import { STORMS_REGISTRY, DISTRICTS_REGISTRY } from "./digitalTwinData";
import Noise from "@/components/ui/Noise";

interface TwinCommandBarProps {
  selectedStorm: StormContext;
  onSelectStorm: (storm: StormContext) => void;
  selectedDistrict: DistrictInfo;
  onSelectDistrict: (district: DistrictInfo) => void;
  surgeLevel: number;
  onSelectSurgeLevel: (level: number) => void;
  rbacRole: RbacRole;
  onChangeRbacRole: (role: RbacRole) => void;
}

export function TwinCommandBar({
  selectedStorm,
  onSelectStorm,
  selectedDistrict,
  onSelectDistrict,
  surgeLevel,
  onSelectSurgeLevel,
  rbacRole,
  onChangeRbacRole,
}: TwinCommandBarProps) {
  const surgePresets = [1.0, 1.5, 2.0, 3.2, 3.4, 4.2, 4.5, 5.0];

  return (
    <header 
      id="twin-command-bar"
      className="relative z-30 w-full rounded-2xl overflow-hidden px-3 sm:px-6 py-3 transition-all duration-200 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.45)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.15)",
      }}
    >
      {/* Background layer with Noise & subtle ambient cyan glow */}
      <div className="absolute inset-0 bg-[#0F1B2F]/85 backdrop-blur-xl pointer-events-none rounded-2xl overflow-hidden">
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={25}
        />
        <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Section: Title & Subtitle */}
        <div className="flex flex-col justify-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black font-rajdhani uppercase tracking-wider flex items-center leading-tight">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                DIGITAL TWIN
              </span>
            </span>
          </h1>
          <p className="text-[10px] sm:text-xs font-rajdhani text-slate-400 hidden md:block mt-0.5">
            Hyper-Local Coastal Inundation &amp; Sub-Street Hydrodynamic Simulation
          </p>
        </div>

        {/* Center: Operational Selectors (Storm, District, Surge) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* 1. Storm Context Selector */}
          <div className="relative flex items-center bg-[#050B14]/90 border border-[#00F2FE]/30 hover:border-[#00F2FE]/60 rounded-lg px-2.5 py-1 transition-all">
            <Flame className="w-3.5 h-3.5 text-[#FF5E36] mr-1.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider leading-none">
                STORM
              </span>
              <select
                value={selectedStorm.code.toLowerCase()}
                onChange={(e) => {
                  const storm = Object.values(STORMS_REGISTRY).find(
                    (s) => s.code.toLowerCase() === e.target.value.toLowerCase()
                  );
                  if (storm) onSelectStorm(storm);
                }}
                className="bg-transparent text-xs font-jetbrains font-bold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                {Object.values(STORMS_REGISTRY).map((s) => (
                  <option key={s.id} value={s.code.toLowerCase()} className="bg-[#0F1B2F] text-white">
                    {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>

          {/* 2. Coastal District Selector */}
          <div className="relative flex items-center bg-[#050B14]/90 border border-[#00F2FE]/30 hover:border-[#00F2FE]/60 rounded-lg px-2.5 py-1 transition-all">
            <Compass className="w-3.5 h-3.5 text-[#00F2FE] mr-1.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider leading-none">
                DISTRICT
              </span>
              <select
                value={selectedDistrict.id}
                onChange={(e) => {
                  const dist = DISTRICTS_REGISTRY[e.target.value];
                  if (dist) onSelectDistrict(dist);
                }}
                className="bg-transparent text-xs font-jetbrains font-bold text-white focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                {Object.values(DISTRICTS_REGISTRY).map((d) => (
                  <option key={d.id} value={d.id} className="bg-[#0F1B2F] text-white">
                    {d.name}, {d.state}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>

          {/* 3. Surge Threshold Selector */}
          <div className="relative flex items-center bg-[#050B14]/90 border border-[#00F2FE]/30 hover:border-[#00F2FE]/60 rounded-lg px-2.5 py-1 transition-all">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#10E7A2] mr-1.5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[9px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider leading-none">
                SURGE THRESHOLD
              </span>
              <select
                value={surgeLevel}
                onChange={(e) => onSelectSurgeLevel(parseFloat(e.target.value))}
                className="bg-transparent text-xs font-jetbrains font-bold text-[#00F2FE] focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                {surgePresets.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-[#0F1B2F] text-white">
                    +{lvl.toFixed(1)}m AAT {lvl >= 4.0 ? "(Catastrophic)" : lvl >= 3.0 ? "(Severe)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>

        </div>

        {/* Right Section: RBAC Badge & Pulsing Warning Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* RBAC Role Selector Badge */}
          <div className="flex items-center rounded-lg bg-[#050B14]/80 p-0.5 border border-[#1E3A5F]">
            <button
              onClick={() => onChangeRbacRole("scientist")}
              className={`px-2 py-1 rounded text-[10px] font-rajdhani font-bold transition-all ${
                rbacRole === "scientist"
                  ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/50 shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Scientist Access: 10m High-Resolution DEM Mesh"
            >
              10m MESH
            </button>
            <button
              onClick={() => onChangeRbacRole("eoc")}
              className={`px-2 py-1 rounded text-[10px] font-rajdhani font-bold transition-all ${
                rbacRole === "eoc"
                  ? "bg-[#10E7A2]/20 text-[#10E7A2] border border-[#10E7A2]/50 shadow-[0_0_8px_rgba(16,231,162,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Disaster EOC: District Evacuation Matrix"
            >
              EOC MATRIX
            </button>
            <button
              onClick={() => onChangeRbacRole("public")}
              className={`px-2 py-1 rounded text-[10px] font-rajdhani font-bold transition-all ${
                rbacRole === "public"
                  ? "bg-[#FF5E36]/20 text-[#FF5E36] border border-[#FF5E36]/50 shadow-[0_0_8px_rgba(255,94,54,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Public Access: 1km Zonal Flood View"
            >
              ZONAL
            </button>
          </div>

          {/* Pulsing IMD Stage 3 Warning Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF5E36]/15 border border-[#FF5E36]/40 text-[#FF5E36] shadow-[0_0_15px_rgba(255,94,54,0.25)] animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-chakra font-bold tracking-wider uppercase">
                STAGE 3 WARNING
              </span>
              <span className="text-[9px] font-jetbrains font-bold text-amber-300">
                ETA T-{selectedStorm.landfallEtaHours}H
              </span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
