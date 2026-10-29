"use client";

import React, { useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  ChevronLeft, 
  ChevronRight, 
  Calendar 
} from "lucide-react";
import { TimelineNode } from "./types";
import { TIMELINE_NODES } from "./digitalTwinData";
import Noise from "@/components/ui/Noise";

interface SurgeTimelineProps {
  currentHour: number;
  onHourChange: (hour: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: 1 | 2 | 4;
  onSpeedChange: (speed: 1 | 2 | 4) => void;
  maxSurgeLevel?: number;
}

export function SurgeTimeline({
  currentHour,
  onHourChange,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onSpeedChange,
  maxSurgeLevel: _maxSurgeLevel,
}: SurgeTimelineProps) {
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const currentHourRef = useRef(currentHour);
  currentHourRef.current = currentHour;

  const playbackSpeedRef = useRef(playbackSpeed);
  playbackSpeedRef.current = playbackSpeed;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const onHourChangeRef = useRef(onHourChange);
  onHourChangeRef.current = onHourChange;

  const onTogglePlayRef = useRef(onTogglePlay);
  onTogglePlayRef.current = onTogglePlay;

  // Smooth animation loop for timeline playback (decoupled from render cycles)
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (time: number) => {
      if (!isPlayingRef.current) return;

      const delta = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Advance hours based on playback speed (e.g. 1 hour every (1.2 / speed) seconds)
      const hoursToAdvance = (delta * playbackSpeedRef.current * 10) / 3;
      const nextHour = +(currentHourRef.current + hoursToAdvance).toFixed(2);

      if (nextHour >= 72) {
        currentHourRef.current = 72;
        onHourChangeRef.current(72);
        onTogglePlayRef.current();
        return;
      }

      currentHourRef.current = nextHour;
      onHourChangeRef.current(nextHour);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying]);

  const handleRewind = () => {
    currentHourRef.current = 0;
    onHourChange(0);
  };

  const handleStepBack = () => {
    const target = Math.max(0, Math.round(currentHourRef.current) - 4);
    currentHourRef.current = target;
    onHourChange(target);
  };

  const handleStepForward = () => {
    const target = Math.min(72, Math.round(currentHourRef.current) + 4);
    currentHourRef.current = target;
    onHourChange(target);
  };

  const handleTogglePlay = () => {
    if (!isPlaying && currentHourRef.current >= 72) {
      currentHourRef.current = 0;
      onHourChange(0);
    }
    onTogglePlay();
  };

  const handleSpeedChange = (speed: 1 | 2 | 4) => {
    playbackSpeedRef.current = speed;
    onSpeedChange(speed);
  };



  return (
    <div
      id="surge-timeline-scrubber"
      className="relative w-full rounded-2xl overflow-hidden px-3 sm:px-6 py-2.5 z-20 shadow-2xl flex flex-col gap-2 transition-all duration-200 bg-transparent"
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

      {/* Top Row: Playback Controls, Active Timestamp & Speed */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2">
        
        {/* Playback Button Group */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
          {/* Rewind */}
          <button
            type="button"
            onClick={handleRewind}
            className="h-7 w-7 rounded-md bg-[#050B14]/70 hover:bg-[#00F2FE]/20 border border-[#1E3252] hover:border-[#00F2FE] text-[#8E9EB5] hover:text-[#00F2FE] flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Rewind to T+0h"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Back -4h */}
          <button
            type="button"
            onClick={handleStepBack}
            className="h-7 w-7 rounded-md bg-[#050B14]/70 hover:bg-[#00F2FE]/20 border border-[#1E3252] hover:border-[#00F2FE] text-[#8E9EB5] hover:text-[#00F2FE] flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Step Back -4h"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className={`h-7 px-3 rounded-md border flex items-center gap-1.5 text-xs font-rajdhani font-bold transition cursor-pointer active:scale-95 select-none ${
              isPlaying
                ? "bg-[#FF5E36]/20 border-[#FF5E36]/70 text-[#FF5E36] shadow-[0_0_8px_rgba(255,94,54,0.25)] hover:bg-[#FF5E36]/30"
                : "bg-[#00F2FE]/20 hover:bg-[#00F2FE]/30 border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
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

          {/* Step Forward +4h */}
          <button
            type="button"
            onClick={handleStepForward}
            className="h-7 w-7 rounded-md bg-[#050B14]/70 hover:bg-[#00F2FE]/20 border border-[#1E3252] hover:border-[#00F2FE] text-[#8E9EB5] hover:text-[#00F2FE] flex items-center justify-center transition cursor-pointer active:scale-95"
            title="Step Forward +4h"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Divider */}
          <div className="w-[1px] h-4 bg-[#1E3252] mx-0.5" />

          {/* Speed Multipliers */}
          <div className="flex items-center gap-1">
            {([1, 2, 4] as const).map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => handleSpeedChange(spd)}
                className={`h-7 px-2 min-w-[28px] rounded-md text-[10px] font-jetbrains font-bold flex items-center justify-center transition cursor-pointer active:scale-95 border ${
                  playbackSpeed === spd
                    ? "bg-[#00F2FE]/20 border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                    : "bg-[#050B14]/70 hover:bg-[#00F2FE]/20 border-[#1E3252] hover:border-[#00F2FE] text-[#8E9EB5] hover:text-[#00F2FE]"
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Current Telemetry Stamp */}
        <div className="flex items-center gap-3">
          <span className="text-sm sm:text-base font-jetbrains font-extrabold text-[#00F2FE]">
            T+{Math.round(currentHour)}h
          </span>
        </div>

      </div>

      {/* Bottom Row: Scrubber Range Bar with Landfall Blinking Pin */}
      <div className="relative z-10 w-full pt-1 pb-1">
        
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
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            currentHourRef.current = val;
            onHourChange(val);
          }}
          className="w-full h-2.5 bg-[#0E3D59] rounded-lg appearance-none cursor-pointer accent-[#00F2FE] hover:accent-[#00eaff]"
        />

        {/* Time Milestones Grid */}
        <div className="flex justify-between text-[10px] font-jetbrains text-slate-400 mt-1 px-0.5">
          {TIMELINE_NODES.map((node) => (
            <button
              key={node.hour}
              type="button"
              onClick={() => {
                currentHourRef.current = node.hour;
                onHourChange(node.hour);
              }}
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
