"use client";

import React, { useState, useEffect, useRef } from "react";
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
import Noise from "@/components/ui/Noise";
import ElasticSlider from "@/components/ui/ElasticSlider";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

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
  const railRef = useRef<HTMLElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<HTMLDivElement>(null);
  const sliderBoxRef = useRef<HTMLDivElement>(null);
  const viewModeRef = useRef<HTMLDivElement>(null);
  const contourBoxRef = useRef<HTMLDivElement>(null);
  const infraBoxRef = useRef<HTMLDivElement>(null);
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

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

  // SVG mask to punch out all panel sections as cutout apertures
  useIsomorphicLayoutEffect(() => {
    const updateCutouts = () => {
      if (!railRef.current) return;
      const railRect = railRef.current.getBoundingClientRect();
      if (railRect.width === 0 || railRect.height === 0) return;

      const cw = Math.round(railRect.width);
      const ch = Math.round(railRect.height);

      const makePath = (el: HTMLElement | null, r: number) => {
        if (!el) return "";
        const b = el.getBoundingClientRect();
        const x = Math.round(b.left - railRect.left);
        const y = Math.round(b.top - railRect.top);
        const w = Math.round(b.width);
        const h = Math.round(b.height);
        if (w <= 0 || h <= 0) return "";
        return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
      };

      const path1 = makePath(countdownRef.current, 12);
      const path2 = makePath(sliderBoxRef.current, 12);
      const path3 = makePath(viewModeRef.current, 12);
      const path4 = makePath(contourBoxRef.current, 12);
      const path5 = makePath(infraBoxRef.current, 12);
      const paths = [path1, path2, path3, path4, path5].filter(Boolean).join(" ");
      if (!paths) return;

      // SVG path with fill-rule="evenodd": outer rect filled, apertures cut out
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}"><path fill-rule="evenodd" fill="#000" d="M 0 0 H ${cw} V ${ch} H 0 Z ${paths}" /></svg>`;
      const dataUri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

      setMaskStyle({
        WebkitMaskImage: dataUri,
        maskImage: dataUri,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      });
    };

    updateCutouts();

    const ro = new ResizeObserver(updateCutouts);
    if (railRef.current) ro.observe(railRef.current);
    if (countdownRef.current) ro.observe(countdownRef.current);
    if (sliderBoxRef.current) ro.observe(sliderBoxRef.current);
    if (viewModeRef.current) ro.observe(viewModeRef.current);
    if (contourBoxRef.current) ro.observe(contourBoxRef.current);
    if (infraBoxRef.current) ro.observe(infraBoxRef.current);

    const timer = setTimeout(updateCutouts, 60);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updateCutouts).catch(() => {});
    }

    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", updateCutouts);
    }
    window.addEventListener("resize", updateCutouts);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", updateCutouts);
      }
      window.removeEventListener("resize", updateCutouts);
    };
  }, []);

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
      ref={railRef}
      id="twin-controls-rail"
      className="relative z-20 w-full lg:w-72 xl:w-80 shrink-0 rounded-2xl overflow-hidden border border-[#00F2FE]/25 flex flex-col text-white shadow-2xl transition-all duration-200 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.45)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.15)",
      }}
    >
      {/* Background layer with Noise, ambient glow, and cutout mask */}
      <div 
        className="absolute inset-0 bg-[#0F1B2F]/85 backdrop-blur-xl pointer-events-none rounded-2xl overflow-hidden"
        style={maskStyle}
      >
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={25}
        />
        <div className="absolute top-0 right-0 w-72 h-36 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div 
        ref={scrollContainerRef}
        className="relative z-10 flex-1 flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar"
      >
        {/* 1. Countdown to Surge Landfall (Cutout Aperture) */}
        <div 
          ref={countdownRef}
          className="rounded-xl p-3 bg-transparent transition-all"
          style={{
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
          }}
        >
          <div className="flex items-center mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-rajdhani font-bold text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              <Clock className="w-3.5 h-3.5 text-[#00F2FE] animate-spin" style={{ animationDuration: "8s" }} />
              <span>SURGE ARRIVAL COUNTDOWN</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between font-jetbrains font-extrabold text-[#00F2FE] text-lg sm:text-xl tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            <div className="flex items-baseline gap-1">
              <span>{String(timeLeft.hours).padStart(2, "0")}</span>
              <span className="text-xs font-rajdhani text-[#00F2FE] font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">HRS</span>
            </div>
            <span className="text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">:</span>
            <div className="flex items-baseline gap-1">
              <span>{String(timeLeft.minutes).padStart(2, "0")}</span>
              <span className="text-xs font-rajdhani text-[#00F2FE] font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">MIN</span>
            </div>
            <span className="text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">:</span>
            <div className="flex items-baseline gap-1">
              <span>{String(timeLeft.seconds).padStart(2, "0")}</span>
              <span className="text-xs font-rajdhani text-[#00F2FE] font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">SEC</span>
            </div>
          </div>
          <p className="text-[10px] font-rajdhani text-[#00F2FE] mt-1 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            Peak storm surge wave synchronized with astronomical high tide window.
          </p>
        </div>

      {/* 2. Primary Surge Level Slider (0.0m - 6.0m AAT) (Cutout Aperture) */}
      <div 
        ref={sliderBoxRef}
        className="rounded-xl p-3.5 bg-transparent transition-all flex flex-col gap-2.5"
        style={{
          border: "1.5px solid rgba(0, 242, 254, 0.45)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              SURGE DEPTH LEVEL
            </span>
          </div>
          <span className="text-base font-jetbrains font-extrabold text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            +{surgeLevel.toFixed(1)}m <span className="text-[10px] text-[#00F2FE] font-semibold [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">AAT</span>
          </span>
        </div>

        {/* Dynamic Category Pill (Retains Severity Tier Colors) */}
        <div className={`px-2 py-0.5 rounded text-[10px] font-chakra font-bold tracking-wider uppercase border text-center ${severity.bg} ${severity.border} [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]`} style={{ color: severity.color }}>
          {severity.text}
        </div>

        {/* Range Slider (ElasticSlider with cyan track & glowing thumb matching GradCamStudio) */}
        <div className="relative pt-1 pb-0.5 space-y-0.5">
          <div
            style={
              {
                "--es-accent": "#00F2FE",
                "--es-accent-dim": "#00F2FE55",
                "--es-accent-glow": "#00F2FE8C",
              } as React.CSSProperties
            }
            className="accent-slider-wrap w-full"
          >
            <ElasticSlider
              value={surgeLevel}
              defaultValue={3.4}
              startingValue={0.0}
              maxValue={6.0}
              isStepped={true}
              stepSize={0.1}
              onChange={(val) => onSurgeChange(Math.round(val * 10) / 10)}
              className="rm-elastic w-full"
              showThumb={true}
            />
          </div>
          <div className="flex justify-between text-[9px] font-jetbrains text-[#00F2FE] font-medium px-0.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            <span>0.0m</span>
            <span>1.5m</span>
            <span>3.0m</span>
            <span>4.5m</span>
            <span>6.0m</span>
          </div>
        </div>
      </div>

      {/* 3. 3D View Mode Selector (Cutout Aperture) */}
      <div 
        ref={viewModeRef}
        className="rounded-xl p-3 bg-transparent transition-all flex flex-col gap-2"
        style={{
          border: "1.5px solid rgba(0, 242, 254, 0.45)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            3D PERSPECTIVE VIEW
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
          {[
            { id: "2d", label: "2D FLAT" },
            { id: "3d", label: "3D OBLIQUE 60°" },
            { id: "satellite", label: "SATELLITE" },
          ].map((mode) => {
            const active = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onViewModeChange(mode.id as ViewMode3D)}
                className={`h-7 px-1 rounded-md text-[10px] sm:text-[10.5px] font-rajdhani font-bold flex items-center justify-center transition cursor-pointer tracking-tight ${
                  active
                    ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                }`}
              >
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Multi-Tier Contour Layer Toggles (Cutout Aperture) */}
      <div 
        ref={contourBoxRef}
        className="rounded-xl p-3 bg-transparent transition-all flex flex-col gap-2"
        style={{
          border: "1.5px solid rgba(0, 242, 254, 0.45)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              CONTOUR ISOCHRONES
            </span>
          </div>
          <span className="text-[10px] font-jetbrains text-slate-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
            {Object.values(visibleContours).filter(Boolean).length}/4 ACTIVE
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-1">
          {(["0.5", "1.5", "3.0", "4.5"] as const).map((key) => {
            const level = parseFloat(key) as SurgeContourLevel;
            const config = CONTOUR_TIERS_CONFIG[key];
            const isVisible = visibleContours[level];
            const isApplicable = surgeLevel >= level;

            const isActive = isVisible && isApplicable;

            return (
              <label
                key={key}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0D263E] border-[rgba(0,242,254,0.5)] shadow-[0_0_10px_rgba(0,242,254,0.15)]"
                    : isVisible
                    ? "bg-[#081422] border-[#1E3A5F] hover:border-[rgba(0,242,254,0.4)]"
                    : "bg-[#050B14] border-[#1E3252] hover:border-[#00F2FE]/40"
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
                    <span className={`text-[11px] font-rajdhani font-bold leading-none ${isActive ? "text-white" : isVisible ? "text-slate-200" : "text-slate-400"}`}>
                      {config.label}
                    </span>
                    <span className={`text-[9px] font-jetbrains mt-0.5 ${isActive ? "text-slate-300" : "text-slate-500"}`}>
                      {config.affectedAreaKm2} km² • {config.populationAtRisk.toLocaleString()} citizens
                    </span>
                  </div>
                </div>
                <div 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ backgroundColor: isApplicable ? config.color : "#475569" }}
                  title={isApplicable ? "Flooded at current surge depth" : "Above current surge level"}
                />
              </label>
            );
          })}
        </div>

        {/* Opacity Slider */}
        <div className="pt-2 border-t border-[#1E3A5F]/60 flex flex-col gap-1">
          <div className="flex justify-between items-center text-[10px] font-rajdhani">
            <span className="font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              CONTOUR OPACITY
            </span>
            <span className="font-jetbrains text-[#00F2FE]">{Math.round(contourOpacity * 100)}%</span>
          </div>
          <div
            style={
              {
                "--es-accent": "#00F2FE",
                "--es-accent-dim": "#00F2FE55",
                "--es-accent-glow": "#00F2FE8C",
              } as React.CSSProperties
            }
            className="accent-slider-wrap w-full"
          >
            <ElasticSlider
              value={Math.round(contourOpacity * 100)}
              defaultValue={65}
              startingValue={20}
              maxValue={100}
              isStepped={true}
              stepSize={5}
              onChange={(val) => onContourOpacityChange(val / 100)}
              className="rm-elastic w-full"
              showThumb={true}
            />
          </div>
        </div>
      </div>

      {/* 5. Infrastructure POI Filter Pins (Cutout Aperture) */}
      <div 
        ref={infraBoxRef}
        className="rounded-xl p-3 bg-transparent transition-all flex flex-col gap-2"
        style={{
          border: "1.5px solid rgba(0, 242, 254, 0.45)",
          boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            CRITICAL INFRASTRUCTURE
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] mt-1">
          {/* Hospitals */}
          <button
            type="button"
            onClick={() => onToggleLayer("hospital")}
            className={`group h-7.5 px-2 rounded-md text-[10px] sm:text-[10.5px] font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer tracking-tight ${
              visibleLayers.hospital
                ? "bg-[#EF4444]/15 border border-[#EF4444]/70 text-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.15)]"
                : "bg-[#050B14]/70 hover:bg-[#EF4444]/15 border border-[#1E3252] hover:border-[#EF4444]/60 text-[#8E9EB5] hover:text-[#EF4444]"
            }`}
          >
            <Building2 className={`w-3.5 h-3.5 shrink-0 transition-colors ${visibleLayers.hospital ? "text-[#EF4444]" : "text-[#8E9EB5] group-hover:text-[#EF4444]"}`} />
            <span className="truncate">Hospitals (8)</span>
          </button>

          {/* Shelters */}
          <button
            type="button"
            onClick={() => onToggleLayer("shelter")}
            className={`group h-7.5 px-2 rounded-md text-[10px] sm:text-[10.5px] font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer tracking-tight ${
              visibleLayers.shelter
                ? "bg-[#10E7A2]/15 border border-[#10E7A2]/70 text-[#10E7A2] shadow-[0_0_8px_rgba(16,231,162,0.15)]"
                : "bg-[#050B14]/70 hover:bg-[#10E7A2]/15 border border-[#1E3252] hover:border-[#10E7A2]/60 text-[#8E9EB5] hover:text-[#10E7A2]"
            }`}
          >
            <Shield className={`w-3.5 h-3.5 shrink-0 transition-colors ${visibleLayers.shelter ? "text-[#10E7A2]" : "text-[#8E9EB5] group-hover:text-[#10E7A2]"}`} />
            <span className="truncate">Shelters (38)</span>
          </button>

          {/* Power Substations */}
          <button
            type="button"
            onClick={() => onToggleLayer("substation")}
            className={`group h-7.5 px-2 rounded-md text-[10px] sm:text-[10.5px] font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer tracking-tight ${
              visibleLayers.substation
                ? "bg-[#F59E0B]/15 border border-[#F59E0B]/70 text-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.15)]"
                : "bg-[#050B14]/70 hover:bg-[#F59E0B]/15 border border-[#1E3252] hover:border-[#F59E0B]/60 text-[#8E9EB5] hover:text-[#F59E0B]"
            }`}
          >
            <Zap className={`w-3.5 h-3.5 shrink-0 transition-colors ${visibleLayers.substation ? "text-[#F59E0B]" : "text-[#8E9EB5] group-hover:text-[#F59E0B]"}`} />
            <span className="truncate">Power 33kV (14)</span>
          </button>

          {/* Highways */}
          <button
            type="button"
            onClick={() => onToggleLayer("highway")}
            className={`group h-7.5 px-2 rounded-md text-[10px] sm:text-[10.5px] font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer tracking-tight ${
              visibleLayers.highway
                ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.15)]"
                : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
            }`}
          >
            <Route className={`w-3.5 h-3.5 shrink-0 transition-colors ${visibleLayers.highway ? "text-[#00F2FE]" : "text-[#8E9EB5] group-hover:text-[#00F2FE]"}`} />
            <span className="truncate">Highways (3)</span>
          </button>

          {/* Ports & Clusters */}
          <button
            type="button"
            onClick={() => {
              onToggleLayer("port");
              onToggleLayer("cluster");
            }}
            className={`col-span-2 group h-7.5 px-2 rounded-md text-[10px] sm:text-[10.5px] font-rajdhani font-bold flex items-center gap-1.5 transition cursor-pointer tracking-tight ${
              visibleLayers.port
                ? "bg-[#93C5FD]/15 border border-[#93C5FD]/70 text-[#93C5FD] shadow-[0_0_8px_rgba(147,197,253,0.15)]"
                : "bg-[#050B14]/70 hover:bg-[#93C5FD]/15 border border-[#1E3252] hover:border-[#93C5FD]/60 text-[#8E9EB5] hover:text-[#93C5FD]"
            }`}
          >
            <Anchor className={`w-3.5 h-3.5 shrink-0 transition-colors ${visibleLayers.port ? "text-[#93C5FD]" : "text-[#8E9EB5] group-hover:text-[#93C5FD]"}`} />
            <span className="truncate">Ports & Coastal Habitations (4)</span>
          </button>
        </div>
      </div>
      </div>
    </aside>
  );
}
