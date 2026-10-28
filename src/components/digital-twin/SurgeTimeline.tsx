"use client";

import React, { useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  ChevronLeft, 
  ChevronRight, 
  AlertOctagon, 
  Calendar 
} from "lucide-react";
import { TimelineNode } from "./types";
import { TIMELINE_NODES } from "./digitalTwinData";

interface SurgeTimelineProps {
  currentHour: number;
  onHourChange: (hour: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: 1 | 2 | 4;
  onSpeedChange: (speed: 1 | 2 | 4) => void;
  maxSurgeLevel: number;
}

export function SurgeTimeline({
  currentHour,
  onHourChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
  maxSurgeLevel,
}: SurgeTimelineProps) {
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  // Smooth animation loop for timeline playback
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Advance hours based on playback speed (e.g. 1 hour every (1.2 / speed) seconds)
      const hoursToAdvance = (delta * playbackSpeed * 10) / 3;

      onHourChange(Math.min(72, currentHour + hoursToAdvance));

      if (currentHour >= 72) {
        onTogglePlay(); // stop at end
      } else {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying, currentHour, playbackSpeed]);

  // Find active node description
  const activeNode = TIMELINE_NODES.reduce((prev, curr) => {
    return Math.abs(curr.hour - currentHour) < Math.abs(prev.hour - currentHour) ? curr : prev;
  });

  // Calculate dynamic surge height at this hour
  const currentCalculatedSurge = (maxSurgeLevel * (activeNode.relativeSurgeRatio || 0.5)).toFixed(1);

  return (
    <div
      id="surge-timeline-scrubber"
      className="w-full bg-[#0F1B2F]/95 backdrop-blur-2xl border-t border-[#00F2FE]/25 px-3 sm:px-6 py-2.5 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.6)] flex flex-col gap-2"
    >
      {/* Top Row: Playback Controls, Active Timestamp & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        
        {/* Playback Button Group */}
        <div className="flex items-center gap-1.5 bg-[#050B14]/80 p-1 rounded-lg border border-[#1E3A5F]">
          <button
            onClick={() => onHourChange(0)}
            className="p-1.5 rounded hover:bg-[#00F2FE]/15 text-slate-400 hover:text-[#00F2FE] transition-colors"
            title="Rewind to T+0h"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onHourChange(Math.max(0, currentHour - 4))}
            className="p-1.5 rounded hover:bg-[#00F2FE]/15 text-slate-400 hover:text-[#00F2FE] transition-colors"
            title="Step Back -4h"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onTogglePlay}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 text-xs font-rajdhani font-bold transition-all shadow-[0_0_12px_rgba(0,242,254,0.3)] ${
              isPlaying
                ? "bg-[#FF5E36] text-white hover:bg-[#FF5E36]/90"
                : "bg-[#00F2FE] text-[#050B14] hover:bg-[#00eaff]"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>PLAY SURGE</span>
              </>
            )}
          </button>

          <button
            onClick={() => onHourChange(Math.min(72, currentHour + 4))}
            className="p-1.5 rounded hover:bg-[#00F2FE]/15 text-slate-400 hover:text-[#00F2FE] transition-colors"
            title="Step Forward +4h"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Speed Multipliers */}
          <div className="flex items-center ml-1 border-l border-[#1E3A5F] pl-1">
            {([1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => onSpeedChange(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-jetbrains font-bold transition-colors ${
                  playbackSpeed === spd
                    ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Center: Current Telemetry Stamp */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-jetbrains font-extrabold text-[#00F2FE]">
              T+{Math.round(currentHour)}h
            </span>
            <span className="text-xs font-jetbrains font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
              +{currentCalculatedSurge}m AAT
            </span>
          </div>

          {Math.round(currentHour) >= 26 && Math.round(currentHour) <= 30 && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#EF4444] text-[10px] font-chakra font-bold animate-pulse">
              <AlertOctagon className="w-3 h-3" />
              <span>PEAK LANDFALL WINDOW</span>
            </div>
          )}
        </div>

        {/* Right: Operational Status Caption */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-rajdhani text-slate-300">
          <span className="text-slate-400 font-medium">{activeNode.description}</span>
          <span className="text-[10px] font-jetbrains text-[#10E7A2] bg-[#10E7A2]/10 px-1.5 py-0.5 rounded border border-[#10E7A2]/30">
            Ingress: ~{activeNode.inlandIngressKm} km
          </span>
        </div>

      </div>

      {/* Bottom Row: Scrubber Range Bar with Landfall Blinking Pin */}
      <div className="relative w-full pt-1 pb-1">
        
        {/* Landfall Marker Pin at T+28h (28 / 72 = 38.8%) */}
        <div 
          className="absolute -top-3.5 transform -translate-x-1/2 flex flex-col items-center pointer-events-none z-10"
          style={{ left: `${(28 / 72) * 100}%` }}
        >
          <span className="text-[9px] font-jetbrains font-extrabold px-1.5 py-0.2 rounded bg-[#EF4444] text-white shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-bounce">
            LANDFALL T+28h
          </span>
          <div className="w-1 h-3 bg-[#EF4444]" />
        </div>

        {/* Range Input Slider */}
        <input
          type="range"
          min="0"
          max="72"
          step="0.5"
          value={currentHour}
          onChange={(e) => onHourChange(parseFloat(e.target.value))}
          className="w-full h-2.5 bg-[#0E3D59] rounded-lg appearance-none cursor-pointer accent-[#00F2FE] hover:accent-[#00eaff]"
        />

        {/* Time Milestones Grid */}
        <div className="flex justify-between text-[10px] font-jetbrains text-slate-400 mt-1 px-0.5">
          {TIMELINE_NODES.map((node) => (
            <button
              key={node.hour}
              onClick={() => onHourChange(node.hour)}
              className={`hover:text-[#00F2FE] transition-colors cursor-pointer ${
                node.isLandfall ? "text-[#EF4444] font-bold" : ""
              } ${Math.round(currentHour) === node.hour ? "text-[#00F2FE] font-bold underline" : ""}`}
            >
              {node.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
