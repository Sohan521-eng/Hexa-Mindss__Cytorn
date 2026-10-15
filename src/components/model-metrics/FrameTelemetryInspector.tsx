"use client";

import React, { useRef, useState, useEffect } from "react";
import { 
  Compass, 
  Wind, 
  Gauge, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  FileText,
  AlertTriangle,
  FastForward,
  Eye
} from "lucide-react";
import { BenchmarkStormInfo, StormReplayFrame } from "./types";
import { DVORAK_CLASSES } from "./benchmarkData";
import { Noise } from "@/components/ui/Noise";
import { ShinyBadge } from "@/components/ui/ShinyBadge";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

function makeRoundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}

interface FrameTelemetryInspectorProps {
  storm: BenchmarkStormInfo;
  currentFrameIdx: number;
  onSelectFrame: (idx: number) => void;
}

export function FrameTelemetryInspector({
  storm,
  currentFrameIdx,
  onSelectFrame,
}: FrameTelemetryInspectorProps) {
  const frames = storm.frames;
  const currentFrame: StormReplayFrame = frames[currentFrameIdx] || frames[0];
  const dvorakMeta = DVORAK_CLASSES[currentFrame.dvorakClass];

  const containerRef = useRef<HTMLDivElement>(null);
  const box1Ref = useRef<HTMLDivElement>(null);
  const box2Ref = useRef<HTMLDivElement>(null);
  const box3Ref = useRef<HTMLDivElement>(null);
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

  useIsomorphicLayoutEffect(() => {
    const updateCutouts = () => {
      if (!containerRef.current || !box1Ref.current || !box2Ref.current || !box3Ref.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      const b1 = box1Ref.current.getBoundingClientRect();
      const b2 = box2Ref.current.getBoundingClientRect();
      const b3 = box3Ref.current.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const cw = Math.round(cRect.width);
      const ch = Math.round(cRect.height);

      const x1 = Math.round(b1.left - cRect.left);
      const y1 = Math.round(b1.top - cRect.top);
      const w1 = Math.round(b1.width);
      const h1 = Math.round(b1.height);

      const x2 = Math.round(b2.left - cRect.left);
      const y2 = Math.round(b2.top - cRect.top);
      const w2 = Math.round(b2.width);
      const h2 = Math.round(b2.height);

      const x3 = Math.round(b3.left - cRect.left);
      const y3 = Math.round(b3.top - cRect.top);
      const w3 = Math.round(b3.width);
      const h3 = Math.round(b3.height);

      if (w1 <= 0 || h1 <= 0 || w2 <= 0 || h2 <= 0 || w3 <= 0 || h3 <= 0) return;

      const r = 12; // rounded-xl

      const path = `M 0 0 H ${cw} V ${ch} H 0 Z ${makeRoundedRectPath(x1, y1, w1, h1, r)} ${makeRoundedRectPath(x2, y2, w2, h2, r)} ${makeRoundedRectPath(x3, y3, w3, h3, r)}`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}"><path fill-rule="evenodd" fill="#000" d="${path}" /></svg>`;
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
    if (containerRef.current) ro.observe(containerRef.current);
    if (box1Ref.current) ro.observe(box1Ref.current);
    if (box2Ref.current) ro.observe(box2Ref.current);
    if (box3Ref.current) ro.observe(box3Ref.current);
    window.addEventListener("resize", updateCutouts);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateCutouts);
    };
  }, [currentFrameIdx]);

  return (
    <div 
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden p-3.5 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex flex-col justify-between gap-3 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.45)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
      }}
    >
      {/* Background layer with punched-out cutouts for the three sections */}
      <div 
        className="absolute inset-0 bg-[#0F1B2F]/95 backdrop-blur-md pointer-events-none rounded-2xl overflow-hidden"
        style={maskStyle}
      >
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={12}
        />
        <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col justify-between gap-3 h-full">
      {/* 1. Header with Milestone Timestamp & Quick Jump */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[rgba(0,242,254,0.12)]">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xs sm:text-sm font-bold font-orbitron tracking-wide text-[#00F2FE] uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            Active Frame Telemetry &amp; Ground-Truth Verification
          </h3>
          <ShinyBadge
            className="shadow-[0_2px_10px_rgba(0,0,0,0.35),0_0_8px_rgba(0,242,254,0.15)] shrink-0"
            roundedClassName="rounded-md"
            innerClassName="px-2 py-0.5"
            speed={3}
            spread={80}
            borderColor="rgba(0, 242, 254, 0.45)"
            borderShineColor="#ffffff"
            surfaceColor="rgba(0, 242, 254, 0.15)"
            surfaceShineColor="rgba(255, 255, 255, 0.55)"
          >
            <span className="text-[10px] font-mono font-bold text-[#00F2FE] tracking-wider">
              FRAME {currentFrame.frameIndex + 1}/{frames.length}
            </span>
          </ShinyBadge>
        </div>

        {/* Milestone Quick Jump Buttons (No horizontal scrollbar) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] font-mono uppercase text-white tracking-wider shrink-0 font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
            Jump:
          </span>
          <div className="flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overflow-x-auto">
            {frames.map((f, idx) => {
              const isSelected = idx === currentFrameIdx;
              const isLandfall = f.category.toLowerCase().includes("landfall");
              const isPeak = f.category.toLowerCase().includes("peak");
              
              let label = `F${idx + 1}`;
              if (idx === 0) label = "Genesis";
              else if (isPeak) label = "Peak";
              else if (isLandfall) label = "Landfall";

              let buttonStyle = "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]";

              if (isSelected) {
                buttonStyle = "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]";
              } else if (isLandfall) {
                buttonStyle = "bg-[#FF5E36]/10 hover:bg-[#FF5E36]/20 border border-[#FF5E36]/50 hover:border-[#FF5E36] text-[#FF5E36]";
              } else if (isPeak) {
                buttonStyle = "bg-[#00E676]/10 hover:bg-[#00E676]/20 border border-[#00E676]/50 hover:border-[#00E676] text-[#00E676]";
              }

              return (
                <button
                  key={`jump-${idx}`}
                  type="button"
                  onClick={() => onSelectFrame(idx)}
                  className={`h-6 px-1.5 sm:px-2 rounded-md text-[10px] sm:text-[11px] font-mono font-bold flex items-center justify-center transition cursor-pointer shrink-0 ${buttonStyle}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Side-by-Side Dual Telemetry Comparison (Ground Truth vs Prediction) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        
        {/* Card A: Ground Truth (IMD Best-Track) - Cut-out styling */}
        <div 
          ref={box1Ref}
          className="p-2.5 rounded-xl bg-transparent flex flex-col justify-between"
          style={{
            border: "1.5px solid rgba(0, 230, 118, 0.45)",
            boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.9), inset 0 0 16px rgba(0, 0, 0, 0.8)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-[#00E676] font-bold flex items-center gap-1.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
              <span className="w-2 h-2 rounded-full bg-[#00E676] inline-block" />
              IMD Best-Track (Observed)
            </span>
            <span className="text-[#00E676]/80 font-medium text-[10px] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
              {currentFrame.timeLabel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            <div>
              <span className="text-[#00E676]/70 text-[10px] block font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Position:
              </span>
              <span className="text-[#00E676] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.latObs.toFixed(1)}°N, {currentFrame.lonObs.toFixed(1)}°E
              </span>
            </div>
            <div>
              <span className="text-[#00E676]/70 text-[10px] block font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Sustained Wind:
              </span>
              <span className="text-[#00E676] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.windObsKts} kts <span className="text-[#00E676]/80 text-[9.5px]">({currentFrame.windObsKmh} km/h)</span>
              </span>
            </div>
            <div>
              <span className="text-[#00E676]/70 text-[10px] block font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Central Pressure:
              </span>
              <span className="text-[#00E676] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.pressureObsHpa} hPa
              </span>
            </div>
            <div>
              <span className="text-[#00E676]/70 text-[10px] block font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Dvorak Class:
              </span>
              <span className="text-[#00E676] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.dvorakTNumber} ({dvorakMeta?.code || "CB"})
              </span>
            </div>
          </div>
        </div>

        {/* Card B: CYCLO-AI Model Forecast - Cut-out styling */}
        <div 
          ref={box2Ref}
          className="p-2.5 rounded-xl bg-transparent flex flex-col justify-between"
          style={{
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.9), inset 0 0 16px rgba(0, 0, 0, 0.8)",
          }}
        >
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-[#00F2FE] font-bold flex items-center gap-1.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
              <span className="w-2 h-2 rounded-full bg-[#00F2FE] inline-block" />
              CYCLO-AI Model (Inference)
            </span>
            <span className="text-[#00F2FE]/90 font-bold text-[10px] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
              PINNs Physics Validated
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
            <div>
              <span className="text-[#00F2FE]/70 text-[10px] block font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Predicted Pos:
              </span>
              <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.latPred.toFixed(1)}°N, {currentFrame.lonPred.toFixed(1)}°E
              </span>
            </div>
            <div>
              <span className="text-[#00F2FE]/70 text-[10px] block font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Predicted Wind:
              </span>
              <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.windPredKts} kts <span className="text-[#00F2FE]/80 text-[9.5px]">({currentFrame.windPredKmh} km/h)</span>
              </span>
            </div>
            <div>
              <span className="text-[#00F2FE]/70 text-[10px] block font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Predicted Pressure:
              </span>
              <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.pressurePredHpa} hPa
              </span>
            </div>
            <div>
              <span className="text-[#00F2FE]/70 text-[10px] block font-medium [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Eyewall Radius:
              </span>
              <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.eyewallRadiusKm} km
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Official IMD Synoptic Dispatch & Deviation Vectors - Cut-out styling */}
      <div 
        ref={box3Ref}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 rounded-xl bg-transparent text-[11px] font-mono"
        style={{
          border: "1.5px solid rgba(0, 242, 254, 0.45)",
          boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.9), inset 0 0 16px rgba(0, 0, 0, 0.8)",
        }}
      >
        <div className="flex items-start gap-2 max-w-xl">
          <FileText className="w-3.5 h-3.5 text-[#00F2FE] shrink-0 mt-0.5" />
          <div>
            <span className="text-[#00F2FE] text-[10px] uppercase font-bold block [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
              IMD Official Synoptic Log:
            </span>
            <span className="text-[#00F2FE]/90 font-sans text-[11px] leading-tight block [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
              {currentFrame.synopticNotes}
            </span>
          </div>
        </div>

        {/* Delta Badges */}
        <div className="flex items-center gap-2 shrink-0">
          <div 
            className="px-2.5 py-1 rounded-lg border border-[#FF5E36]/60 text-center shadow-md transition-all"
            style={{ backgroundColor: "#180A08" }}
          >
            <span className="text-[9px] text-[#FF5E36] block uppercase font-bold tracking-wider [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Error Δd</span>
            <span className="text-xs font-black text-[#FF5E36] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">{currentFrame.crossTrackErrorKm.toFixed(1)} km</span>
          </div>
          <div 
            className="px-2.5 py-1 rounded-lg border border-amber-500/60 text-center shadow-md transition-all"
            style={{ backgroundColor: "#1A1406" }}
          >
            <span className="text-[9px] text-amber-400 block uppercase font-bold tracking-wider [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Intensity ΔV</span>
            <span className="text-xs font-black text-amber-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">{currentFrame.intensityDeltaKts > 0 ? `+${currentFrame.intensityDeltaKts}` : currentFrame.intensityDeltaKts} kts</span>
          </div>
          <div 
            className="px-2.5 py-1 rounded-lg border border-cyan-500/60 text-center shadow-md transition-all"
            style={{ backgroundColor: "#061724" }}
          >
            <span className="text-[9px] text-cyan-400 block uppercase font-bold tracking-wider [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Pressure ΔP</span>
            <span className="text-xs font-black text-cyan-400 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">{currentFrame.pressureDeltaHpa > 0 ? `+${currentFrame.pressureDeltaHpa}` : currentFrame.pressureDeltaHpa} hPa</span>
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
