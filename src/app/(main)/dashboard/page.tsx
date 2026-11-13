"use client";

import React, { useState, useEffect } from "react";
import { CycloneStatusCard } from "@/components/dashboard/CycloneStatusCard";
import { RealTimeParameters } from "@/components/dashboard/RealTimeParameters";
import { MapLayerCanvas } from "@/components/map/MapLayerCanvas";
import { TrendCharts } from "@/components/dashboard/TrendCharts";
import { ActionDispatchPanel } from "@/components/dashboard/ActionDispatchPanel";
import XaiAssistantPanel from "@/components/xai/XaiAssistantPanel";
import { Zap, Activity, Sparkles, Satellite } from "lucide-react";
import { ShinyBadge } from "@/components/ui/ShinyBadge";
import Noise from "@/components/ui/Noise";

export default function DashboardPage() {
  const [isXaiDrawerOpen, setIsXaiDrawerOpen] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"trends" | "dispatch">("trends");
  const [basinSector, setBasinSector] = useState("BAY OF BENGAL • SECTOR BOB-02");
  const [activeCycle, setActiveCycle] = useState("INSAT-3DR Rapid Scan (15m)");

  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

    const fetchBasinInfo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/telemetry`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted) {
            if (json.sector) setBasinSector(json.sector);
            if (json.cycle) setActiveCycle(json.cycle);
          }
        }
      } catch (err) {
        console.warn("[DashboardPage] Telemetry header fetch error:", err);
      }
    };

    fetchBasinInfo();
    const interval = setInterval(fetchBasinInfo, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="space-y-4 relative">
      {/* Top Controls Bar: Basin Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        {/* Left Side: Basin Region Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ShinyBadge
            speed={2.5}
            delay={1}
            spread={90}
            direction="right"
            yoyo
            borderColor="rgba(0, 242, 254, 0.45)"
            borderShineColor="#ffffff"
            surfaceColor="rgba(0, 242, 254, 0.2)"
            surfaceShineColor="rgba(255, 255, 255, 0.7)"
            roundedClassName="rounded-lg"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
            <span className="text-xs font-jetbrains [font-feature-settings:'tnum'_on] font-bold tracking-wider text-[#00F2FE]">
              {basinSector}
            </span>
          </ShinyBadge>
        </div>

        {/* Right Side: Active Cycle & MOSDAC Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* INSAT-3DR Rapid Scan Cycle Badge */}
          <ShinyBadge
            speed={2.5}
            delay={1.2}
            spread={90}
            direction="right"
            yoyo
            borderColor="rgba(0, 242, 254, 0.45)"
            borderShineColor="#ffffff"
            surfaceColor="rgba(0, 242, 254, 0.2)"
            surfaceShineColor="rgba(255, 255, 255, 0.7)"
            roundedClassName="rounded-lg"
          >
            <Satellite className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
            <span className="text-xs font-jetbrains [font-feature-settings:'tnum'_on] tracking-wider text-[#8E9EB5] hidden sm:inline">
              Active Cycle:
            </span>
            <span className="text-xs font-jetbrains [font-feature-settings:'tnum'_on] font-bold tracking-wider text-[#00F2FE]">
              {activeCycle}
            </span>
          </ShinyBadge>

          {/* MOSDAC Ingestion Stream Badge */}
          <ShinyBadge
            speed={2.5}
            delay={1.4}
            spread={90}
            direction="right"
            yoyo
            borderColor="rgba(0, 242, 254, 0.45)"
            borderShineColor="#ffffff"
            surfaceColor="rgba(0, 242, 254, 0.2)"
            surfaceShineColor="rgba(255, 255, 255, 0.7)"
            roundedClassName="rounded-lg"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10E7A2] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10E7A2]" />
            </span>
            <span className="text-xs font-jetbrains [font-feature-settings:'tnum'_on] tracking-wider text-[#8E9EB5]">
              MOSDAC:
            </span>
            <span className="text-xs font-jetbrains [font-feature-settings:'tnum'_on] font-bold tracking-wider text-[#10E7A2]">
              Synced
            </span>
          </ShinyBadge>
        </div>
      </div>

      {/* Top Row: Weather Parameter Micro-Cards */}
      <RealTimeParameters />

      {/* Central Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[520px]">
        {/* Left/Center 2 Cols: Geospatial Satellite Map (MapLibre + deck.gl with HUD Layer Stack & 72h Scrubber) */}
        <div className="lg:col-span-2 flex flex-col">
          <MapLayerCanvas />
        </div>

        {/* Right 1 Col: Active Cyclone Status & Forecast Overview / Embedded XAI Studio / Action Dispatch */}
        <div className="flex flex-col gap-4">
          <CycloneStatusCard />

          {/* Right Sub-Tabs: Trends vs Action Dispatch */}
          <div className="relative overflow-hidden flex items-center justify-between bg-[#0F1B2F]/90 backdrop-blur-xl p-1 rounded-xl border border-[rgba(0,242,254,0.4)] shadow-[0_0_15px_rgba(0,242,254,0.1)] text-xs font-rajdhani shrink-0">
            {/* React Bits Noise Background Overlay */}
            <Noise
              patternSize={250}
              patternScaleX={1.2}
              patternScaleY={1.2}
              patternRefreshInterval={2}
              patternAlpha={9}
            />

            {/* Foreground Tabs */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <button
                onClick={() => setActiveRightTab("trends")}
                className={`flex-1 py-1.5 rounded-lg font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRightTab === "trends"
                    ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-sm"
                    : "text-[#8E9EB5] hover:text-white"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Trends</span>
              </button>
              <button
                onClick={() => setActiveRightTab("dispatch")}
                className={`flex-1 py-1.5 rounded-lg font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeRightTab === "dispatch"
                    ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-sm"
                    : "text-[#8E9EB5] hover:text-white"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-[#FF5E36]" />
                <span>Dispatch</span>
              </button>
            </div>
          </div>

          {activeRightTab === "trends" && (
            <TrendCharts />
          )}

          {activeRightTab === "dispatch" && (
            <ActionDispatchPanel onOpenXai={() => setIsXaiDrawerOpen(true)} />
          )}
        </div>
      </div>

      {/* Slide-Over Drawer Modal for Full XAI Assistant */}
      {isXaiDrawerOpen && (
        <div 
          onClick={() => setIsXaiDrawerOpen(false)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-end p-2 sm:p-6 transition-opacity"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl h-[90vh] max-h-[720px] flex flex-col animate-in slide-in-from-right duration-300"
          >
            <XaiAssistantPanel 
              onClose={() => setIsXaiDrawerOpen(false)}
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
