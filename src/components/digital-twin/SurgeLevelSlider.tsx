"use client";

import React, { useState, useEffect } from "react";
import { 
  Sliders, 
  Layers, 
  Eye, 
  Clock, 
  AlertTriangle, 
  Activity, 
  Building2, 
  Shield, 
  Zap, 
  Route, 
  Anchor,
  HelpCircle
} from "lucide-react";
import { 
  ViewMode3D, 
  SurgeContourLevel, 
  InfrastructureType 
} from "./types";
import { CONTOUR_TIERS_CONFIG } from "./digitalTwinData";

interface SurgeLevelSliderProps {
  surgeLevel: number;
  onSurgeChange: (value: number) => void;
  viewMode: ViewMode3D;
  onViewModeChange: (mode: ViewMode3D) => void;
  visibleContours: Record<SurgeContourLevel, boolean>;
  onToggleContour: (level: SurgeContourLevel) => void;
  contourOpacity: number;
  onContourOpacityChange: (opacity: number) => void;
  visibleLayers: Record<InfrastructureType, boolean>;
  onToggleLayer: (type: InfrastructureType) => void;
  landfallEtaHours: number;
}

export function SurgeLevelSlider({
  surgeLevel,
  onSurgeChange,
  viewMode,
  onViewModeChange,
  visibleContours,
  onToggleContour,
  contourOpacity,
  onContourOpacityChange,
  visibleLayers,
  onToggleLayer,
  landfallEtaHours,
}: SurgeLevelSliderProps) {
  // Live countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: landfallEtaHours,
    minutes: 45,
    seconds: 0,
  });

  useEffect(() => {
    setTimeLeft({
      hours: landfallEtaHours,
      minutes: 42,
      seconds: 18,
    });

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [landfallEtaHours]);

  // Determine category badge based on surge height
  const getSeverity = (surge: number) => {
    if (surge >= 4.5) return { text: "CATASTROPHIC INTRUSION", color: "#D946EF", bg: "bg-[#D946EF]/20", border: "border-[#D946EF]/50" };
    if (surge >= 3.0) return { text: "STRUCTURAL FAILURE", color: "#EF4444", bg: "bg-[#EF4444]/20", border: "border-[#EF4444]/50" };
    if (surge >= 1.5) return { text: "ROADWAY SUBMERSION", color: "#F59E0B", bg: "bg-[#F59E0B]/20", border: "border-[#F59E0B]/50" };
    return { text: "BEACHFRONT WASH-OVER", color: "#00F2FE", bg: "bg-[#00F2FE]/20", border: "border-[#00F2FE]/50" };
  };

  const severity = getSeverity(surgeLevel);

  return (
    <aside
      id="twin-controls-rail"
      className="w-full lg:w-72 xl:w-80 shrink-0 bg-[#0F1B2F]/90 backdrop-blur-xl border-r border-[#00F2FE]/20 flex flex-col p-4 gap-4 overflow-y-auto text-white"
    >
      {/* 1. Countdown to Surge Landfall */}
      <div className="rounded-xl p-3 bg-gradient-to-br from-[#050B14] to-[#0E3D59]/40 border border-[#00F2FE]/30 shadow-[0_0_15px_rgba(0,242,254,0.1)]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-rajdhani font-bold text-slate-300 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-[#00F2FE] animate-spin" style={{ animationDuration: "8s" }} />
            <span>SURGE ARRIVAL COUNTDOWN</span>
          </div>
          <span className="text-[9px] font-share-mono text-[#10E7A2] px-1 py-0.5 rounded bg-[#10E7A2]/10 border border-[#10E7A2]/30">
            LIVE IST
          </span>
        </div>
        <div className="flex items-baseline justify-between font-jetbrains font-extrabold text-[#00F2FE] text-lg sm:text-xl tracking-wider">
          <div className="flex items-baseline gap-1">
            <span>{String(timeLeft.hours).padStart(2, "0")}</span>
            <span className="text-xs font-rajdhani text-slate-400 font-normal">HRS</span>
          </div>
          <span className="text-slate-500">:</span>
          <div className="flex items-baseline gap-1">
            <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
            <span className="text-xs font-rajdhani text-slate-400 font-normal">MIN</span>
          </div>
          <span className="text-slate-500">:</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[#FF5E36]">{String(timeLeft.seconds).padStart(2, "0")}</span>
            <span className="text-xs font-rajdhani text-slate-400 font-normal">SEC</span>
          </div>
        </div>
        <p className="text-[10px] font-rajdhani text-slate-400 mt-1">
          Peak storm surge wave synchronized with astronomical high tide window.
        </p>
      </div>

      {/* 2. Primary Surge Level Slider (0.0m - 6.0m AAT) */}
      <div className="rounded-xl p-3.5 bg-[#050B14]/80 border border-[#00F2FE]/25 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-200">
              SURGE DEPTH LEVEL
            </span>
          </div>
          <span className="text-base font-jetbrains font-extrabold text-[#00F2FE]">
            +{surgeLevel.toFixed(1)}m <span className="text-[10px] text-slate-400 font-normal">AAT</span>
          </span>
        </div>

        {/* Dynamic Category Pill */}
        <div className={`px-2 py-0.5 rounded text-[10px] font-chakra font-bold tracking-wider uppercase border text-center ${severity.bg} ${severity.border}`} style={{ color: severity.color }}>
          {severity.text}
        </div>

        {/* Range Slider */}
        <div className="relative pt-2 pb-1">
          <input
            type="range"
            min="0.0"
            max="6.0"
            step="0.1"
            value={surgeLevel}
            onChange={(e) => onSurgeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#0E3D59] rounded-lg appearance-none cursor-pointer accent-[#00F2FE] hover:accent-[#00eaff]"
          />
          <div className="flex justify-between text-[9px] font-jetbrains text-slate-400 mt-1">
            <span>0.0m</span>
            <span>1.5m</span>
            <span>3.0m</span>
            <span>4.5m</span>
            <span>6.0m</span>
          </div>
        </div>
      </div>

      {/* 3. 3D View Mode Selector */}
      <div className="rounded-xl p-3 bg-[#050B14]/80 border border-[#00F2FE]/25 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-200">
            3D PERSPECTIVE VIEW
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0F1B2F] rounded-lg border border-[#1E3A5F]">
          <button
            onClick={() => onViewModeChange("2d")}
            className={`py-1.5 px-2 rounded text-center text-[10px] font-rajdhani font-bold transition-all ${
              viewMode === "2d"
                ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            2D FLAT
          </button>
          <button
            onClick={() => onViewModeChange("3d")}
            className={`py-1.5 px-2 rounded text-center text-[10px] font-rajdhani font-bold transition-all ${
              viewMode === "3d"
                ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            3D OBLIQUE 60°
          </button>
          <button
            onClick={() => onViewModeChange("satellite")}
            className={`py-1.5 px-2 rounded text-center text-[10px] font-rajdhani font-bold transition-all ${
              viewMode === "satellite"
                ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            SATELLITE
          </button>
        </div>
      </div>

      {/* 4. Multi-Tier Contour Layer Toggles */}
      <div className="rounded-xl p-3 bg-[#050B14]/80 border border-[#00F2FE]/25 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-200">
              CONTOUR ISOCHRONES
            </span>
          </div>
          <span className="text-[10px] font-jetbrains text-slate-400">
            {Object.values(visibleContours).filter(Boolean).length}/4 ACTIVE
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          {(["0.5", "1.5", "3.0", "4.5"] as const).map((key) => {
            const level = parseFloat(key) as SurgeContourLevel;
            const config = CONTOUR_TIERS_CONFIG[key];
            const isVisible = visibleContours[level];
            const isApplicable = surgeLevel >= level;

            return (
              <label
                key={key}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                  isVisible && isApplicable
                    ? "bg-[#0E3D59]/40 border-[rgba(0,242,254,0.4)] shadow-[0_0_10px_rgba(0,242,254,0.1)]"
                    : "bg-[#050B14]/40 border-[#1E3A5F]/50 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggleContour(level)}
                    className="w-3.5 h-3.5 rounded accent-[#00F2FE] cursor-pointer"
                  />
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: config.color }} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-rajdhani font-bold text-white leading-none">
                      {config.label}
                    </span>
                    <span className="text-[9px] font-jetbrains text-slate-400 mt-0.5">
                      {config.affectedAreaKm2} km² • {config.populationAtRisk.toLocaleString()} citizens
                    </span>
                  </div>
                </div>
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: isApplicable ? config.color : "#475569" }}
                  title={isApplicable ? "Flooded at current surge depth" : "Above current surge level"}
                />
              </label>
            );
          })}
        </div>

        {/* Opacity Slider */}
        <div className="pt-2 border-t border-[#1E3A5F]/60 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-rajdhani text-slate-400">
            <span>CONTOUR OPACITY</span>
            <span className="font-jetbrains text-[#00F2FE]">{Math.round(contourOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={contourOpacity}
            onChange={(e) => onContourOpacityChange(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[#0E3D59] rounded-lg appearance-none cursor-pointer accent-[#00F2FE]"
          />
        </div>
      </div>

      {/* 5. Infrastructure POI Filter Pins */}
      <div className="rounded-xl p-3 bg-[#050B14]/80 border border-[#00F2FE]/25 flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-200">
            CRITICAL INFRASTRUCTURE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 mt-1">
          {/* Hospitals */}
          <button
            type="button"
            onClick={() => onToggleLayer("hospital")}
            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
              visibleLayers.hospital
                ? "bg-[#EF4444]/15 border-[#EF4444]/50 text-white"
                : "bg-[#050B14] border-[#1E3A5F]/40 text-slate-500"
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 ${visibleLayers.hospital ? "text-[#EF4444]" : "text-slate-500"}`} />
            <span className="text-[10px] font-rajdhani font-bold truncate">Hospitals (8)</span>
          </button>

          {/* Shelters */}
          <button
            type="button"
            onClick={() => onToggleLayer("shelter")}
            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
              visibleLayers.shelter
                ? "bg-[#10E7A2]/15 border-[#10E7A2]/50 text-white"
                : "bg-[#050B14] border-[#1E3A5F]/40 text-slate-500"
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${visibleLayers.shelter ? "text-[#10E7A2]" : "text-slate-500"}`} />
            <span className="text-[10px] font-rajdhani font-bold truncate">Shelters (38)</span>
          </button>

          {/* Power Substations */}
          <button
            type="button"
            onClick={() => onToggleLayer("substation")}
            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
              visibleLayers.substation
                ? "bg-[#F59E0B]/15 border-[#F59E0B]/50 text-white"
                : "bg-[#050B14] border-[#1E3A5F]/40 text-slate-500"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${visibleLayers.substation ? "text-[#F59E0B]" : "text-slate-500"}`} />
            <span className="text-[10px] font-rajdhani font-bold truncate">Power 33kV (14)</span>
          </button>

          {/* Highways */}
          <button
            type="button"
            onClick={() => onToggleLayer("highway")}
            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
              visibleLayers.highway
                ? "bg-[#00F2FE]/15 border-[#00F2FE]/50 text-white"
                : "bg-[#050B14] border-[#1E3A5F]/40 text-slate-500"
            }`}
          >
            <Route className={`w-3.5 h-3.5 ${visibleLayers.highway ? "text-[#00F2FE]" : "text-slate-500"}`} />
            <span className="text-[10px] font-rajdhani font-bold truncate">Highways (3)</span>
          </button>

          {/* Ports & Clusters */}
          <button
            type="button"
            onClick={() => {
              onToggleLayer("port");
              onToggleLayer("cluster");
            }}
            className={`col-span-2 flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition-all ${
              visibleLayers.port
                ? "bg-[#93C5FD]/15 border-[#93C5FD]/50 text-white"
                : "bg-[#050B14] border-[#1E3A5F]/40 text-slate-500"
            }`}
          >
            <Anchor className={`w-3.5 h-3.5 ${visibleLayers.port ? "text-[#93C5FD]" : "text-slate-500"}`} />
            <span className="text-[10px] font-rajdhani font-bold truncate">Ports & Coastal Habitations (4)</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
