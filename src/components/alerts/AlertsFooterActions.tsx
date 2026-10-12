"use client";

import React from "react";
import Link from "next/link";
import { 
  Waves, 
  Bot, 
  ExternalLink, 
  ArrowRight, 
  PhoneCall, 
  ShieldCheck, 
  Radio, 
  Layers, 
  Database,
  Sliders
} from "lucide-react";

interface AlertsFooterActionsProps {
  stormParam?: string;
  selectedDistrictName?: string;
}

export function AlertsFooterActions({
  stormParam = "mocha",
  selectedDistrictName = "Puri",
}: AlertsFooterActionsProps) {
  return (
    <footer className="w-full rounded-xl border border-[rgba(0,242,254,0.2)] bg-[#0F1B2F]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-4 sm:p-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left: Pipeline Telemetry Flow Indicator */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono tracking-widest text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#00F2FE]/30 font-semibold uppercase">
              DOWNSTREAM PIPELINE HANDOFF
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Piped from Page 5 (/forecast) & Page 3 (/dashboard)
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white font-rajdhani tracking-wide flex items-center gap-2">
            <span>Seamless Multi-Agency Emergency Decision Handoff</span>
          </h3>

          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Telemetry from active Stage 3 Warning ({selectedDistrictName} sector) is ready to deploy into 3D hydrodynamic flood simulation and autonomous emergency response drone swarms.
          </p>
        </div>

        {/* Right: Downstream CTAs & Quick Emergency Links */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* CTA 1: Launch Digital Twin Button */}
          <Link
            href={`/digital-twin?storm=${stormParam.toLowerCase()}&district=${selectedDistrictName.toLowerCase()}`}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0E3D59] to-[#0A2638] hover:from-[#00F2FE]/20 hover:to-[#0E3D59] border border-[#00F2FE]/40 hover:border-[#00F2FE] text-white font-rajdhani font-bold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(0,242,254,0.25)] group cursor-pointer"
          >
            <Waves className="w-4 h-4 text-[#00F2FE] group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono text-[#00F2FE] uppercase tracking-wider">Page 9 Handoff</span>
              <span>Launch Digital Twin</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#00F2FE] group-hover:translate-x-0.5 transition-all ml-1" />
          </Link>

          {/* CTA 2: Deploy Drone Grid Button */}
          <Link
            href={`/autonomous-grid?status=evac&district=${selectedDistrictName.toLowerCase()}`}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0F1B2F] to-[#16253D] hover:from-[#1E3252] hover:to-[#0F1B2F] border border-[rgba(0,242,254,0.3)] hover:border-[#00F2FE]/70 text-white font-rajdhani font-bold text-sm transition-all duration-200 shadow-[0_0_20px_rgba(0,0,0,0.5)] group cursor-pointer"
          >
            <Bot className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Page 11 Handoff</span>
              <span>Deploy Drone Grid</span>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all ml-1" />
          </Link>

        </div>

      </div>

      {/* Hotline & Security Clearance Bottom Sub-Strip */}
      <div className="mt-4 pt-3 border-t border-[rgba(0,242,254,0.12)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-red-400">
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="font-bold">NDMA Hotline: 1078</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400">
            <Radio className="w-3.5 h-3.5" />
            <span>State EOC: 1070</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Emergency Services: 112</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-slate-500">Security Clearance: RESTRICTED // OFFICIAL USE ONLY</span>
          <span className="text-[#00F2FE]">CYCLO-AI v2.4</span>
        </div>

      </div>
    </footer>
  );
}
