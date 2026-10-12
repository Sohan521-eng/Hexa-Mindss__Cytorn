"use client";

import React from "react";
import { 
  ShieldAlert, 
  Radio, 
  MapPin, 
  AlertTriangle, 
  Users, 
  Home, 
  Waves, 
  ChevronDown,
  Sparkles,
  PhoneCall
} from "lucide-react";
import { DistrictVulnerability } from "./types";

interface AlertsTopBarProps {
  stormName: string;
  stormCode: string;
  selectedState: string;
  onSelectState: (state: string) => void;
  allDistricts: DistrictVulnerability[];
  activeStage: number;
}

export function AlertsTopBar({
  stormName,
  stormCode,
  selectedState,
  onSelectState,
  allDistricts,
  activeStage,
}: AlertsTopBarProps) {
  const states = ["All States", "Odisha", "West Bengal", "Andhra Pradesh", "Tamil Nadu", "Gujarat"];

  // Quick summary counts
  const filteredDistricts = selectedState === "All States" 
    ? allDistricts 
    : allDistricts.filter(d => d.state === selectedState);

  const catastrophicCount = filteredDistricts.filter(d => d.severity === "catastrophic").length;
  const severeCount = filteredDistricts.filter(d => d.severity === "severe").length;
  const immediateEvacCount = filteredDistricts.filter(d => d.evacuationPriority === "IMMEDIATE").length;
  const totalPopulationAtRisk = filteredDistricts.reduce((acc, d) => acc + d.populationAtRisk, 0);
  const totalShelters = filteredDistricts.reduce((acc, d) => acc + d.sheltersTotal, 0);

  return (
    <div className="w-full bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.2)] rounded-xl p-3 sm:p-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Left: Hub Title & Operational Context */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-[#0E3D59] to-[#050B14] border border-[#00F2FE]/40 shadow-[0_0_15px_rgba(0,242,254,0.3)] shrink-0">
            <ShieldAlert className="w-6 h-6 text-[#00F2FE]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono tracking-widest text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#00F2FE]/30 font-semibold uppercase">
                CYCLO-AI EOC HUB
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700">
                NDMA • SDMA • MoES / IMD
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/40 text-[10px] font-mono text-red-400 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span>LIVE WARNING ACTIVE</span>
              </div>
            </div>

            <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white font-orbitron tracking-wide flex items-center gap-2 mt-0.5">
              <span>Disaster Early Warning & Coastal Alert Hub</span>
            </h1>
            <p className="text-xs text-slate-400 font-sans hidden sm:block">
              Multi-Agency Emergency Decision-Support Center • Life-Safety Warnings, Evacuation Matrix & CAP Broadcast Mesh
            </p>
          </div>
        </div>

        {/* Center / Right: Storm Selector, State Filter & Officer Auth Badge */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* Active Storm Indicator Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#050B14] border border-[#00F2FE]/30 text-xs">
            <Radio className="w-3.5 h-3.5 text-[#00F2FE] animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Storm Code</span>
              <span className="text-xs font-bold text-white font-mono flex items-center gap-1">
                {stormName} <span className="text-[#00F2FE]">({stormCode})</span>
              </span>
            </div>
          </div>

          {/* State Filter Dropdown */}
          <div className="relative">
            <label htmlFor="state-filter" className="sr-only">Filter State</label>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0E3D59]/60 border border-[#00F2FE]/35 text-xs text-white hover:border-[#00F2FE] transition-colors cursor-pointer group">
              <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
              <select
                id="state-filter"
                value={selectedState}
                onChange={(e) => onSelectState(e.target.value)}
                className="bg-transparent text-white font-rajdhani font-semibold text-xs tracking-wider focus:outline-none cursor-pointer pr-4 appearance-none"
              >
                {states.map((st) => (
                  <option key={st} value={st} className="bg-[#0F1B2F] text-white">
                    {st === "All States" ? "📍 All Coastal States" : `📍 State: ${st}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-[#00F2FE] pointer-events-none -ml-3" />
            </div>
          </div>

          {/* Officer #4812 Auth Verification Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-emerald-400/80 font-mono">Incident Commander</span>
              <span className="text-xs font-bold text-emerald-300 font-mono">
                🛡️ NDMA Officer #4812
              </span>
            </div>
          </div>

          {/* EOC Hotline Dial */}
          <a
            href="tel:1078"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-xs text-red-300 font-mono transition-colors shadow-[0_0_12px_rgba(213,0,0,0.25)]"
            title="National Disaster Management Helpline"
          >
            <PhoneCall className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span className="font-bold">EOC: 1078</span>
          </a>
        </div>
      </div>

      {/* Operational Telemetry Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 pt-3 mt-3 border-t border-[rgba(0,242,254,0.12)]">
        
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#050B14]/70 border border-[#1E3252]">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider truncate">Catastrophic Districts</div>
            <div className="text-sm font-bold text-red-400 font-mono">
              {catastrophicCount} <span className="text-[10px] text-slate-400 font-normal">(&ge;180 km/h)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#050B14]/70 border border-[#1E3252]">
          <Waves className="w-4 h-4 text-[#FF9100] shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider truncate">Immediate Evac</div>
            <div className="text-sm font-bold text-[#FF9100] font-mono">
              {immediateEvacCount} Districts <span className="text-[10px] text-slate-400 font-normal">(0-5 km)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#050B14]/70 border border-[#1E3252]">
          <Users className="w-4 h-4 text-[#00F2FE] shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider truncate">Pop. at Coastal Risk</div>
            <div className="text-sm font-bold text-white font-mono">
              {(totalPopulationAtRisk / 100000).toFixed(1)} Lakh <span className="text-[10px] text-slate-400 font-normal">({totalPopulationAtRisk.toLocaleString()})</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[#050B14]/70 border border-[#1E3252]">
          <Home className="w-4 h-4 text-emerald-400 shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider truncate">Cyclone Shelters</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {totalShelters} Multipurpose <span className="text-[10px] text-emerald-300 font-normal">(Active)</span>
            </div>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-4 lg:col-span-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0E3D59]/40 border border-[#00F2FE]/25">
          <Sparkles className="w-4 h-4 text-[#00F2FE] shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] text-slate-300 uppercase font-mono tracking-wider truncate">CAP Broadcast Grid</div>
            <div className="text-xs font-bold text-[#00F2FE] font-mono truncate">
              Cell Tower Mesh Ready
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
