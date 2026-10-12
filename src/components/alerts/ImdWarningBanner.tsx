"use client";

import React, { useState, useEffect } from "react";
import { 
  AlertOctagon, 
  Clock, 
  Compass, 
  Waves, 
  Wind, 
  Bell, 
  CheckCircle2, 
  Info,
  Calendar,
  Layers
} from "lucide-react";
import { AlertStageNumber } from "./types";
import { IMD_ALERT_STAGES } from "./alertsData";

interface ImdWarningBannerProps {
  activeStage: AlertStageNumber;
  selectedStageFilter: AlertStageNumber;
  onSelectStageFilter: (stage: AlertStageNumber) => void;
  landfallTime?: string;
  surgeHeightM?: number;
  lastIssuedIst?: string;
}

export function ImdWarningBanner({
  activeStage = 3,
  selectedStageFilter,
  onSelectStageFilter,
  landfallTime = "Tomorrow 18:30 IST",
  surgeHeightM = 3.4,
  lastIssuedIst = "06:00 IST",
}: ImdWarningBannerProps) {
  // Countdown to next mandated bulletin (3h cycle, e.g. 02h 44m 38s)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(2 * 3600 + 44 * 60 + 52);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 3 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, "0")}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
  };

  const currentStageConfig = IMD_ALERT_STAGES[activeStage];
  const viewedStageConfig = IMD_ALERT_STAGES[selectedStageFilter];

  return (
    <section 
      id="imd-warning-banner"
      className="w-full relative overflow-hidden rounded-xl border border-[rgba(0,242,254,0.22)] bg-gradient-to-r from-[#0F1B2F]/95 via-[#0E3D59]/80 to-[#0F1B2F]/95 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
      style={{
        boxShadow: activeStage === 3 
          ? "0 0 35px rgba(213,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)" 
          : "0 0 25px rgba(0,242,254,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      {/* Decorative tactical radar sweep scan line */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F2FE] to-transparent animate-pulse opacity-80" />

      {/* Top Bar: IMD 4-Stage Tab Selector */}
      <div className="p-3 sm:p-4 border-b border-[rgba(0,242,254,0.14)] bg-[#050B14]/60">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
              Official IMD 4-Stage Protocol:
            </span>
            <span className="text-[11px] font-mono text-[#00F2FE] hidden sm:inline">
              (Click tab to filter operations)
            </span>
          </div>

          {/* 4 Interactive Warning Stage Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((stageNum) => {
              const config = IMD_ALERT_STAGES[stageNum];
              const isCurrentActive = activeStage === stageNum;
              const isSelectedFilter = selectedStageFilter === stageNum;

              return (
                <button
                  key={stageNum}
                  onClick={() => onSelectStageFilter(stageNum as AlertStageNumber)}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 border cursor-pointer ${
                    isSelectedFilter
                      ? "shadow-lg"
                      : "hover:bg-slate-800/40 opacity-75 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: isSelectedFilter ? config.bgHex : "rgba(15, 27, 47, 0.4)",
                    borderColor: isSelectedFilter ? config.borderHex : "rgba(30, 50, 82, 0.6)",
                  }}
                >
                  {/* Status Indicator Bubble */}
                  <div className="relative flex items-center justify-center shrink-0">
                    <span 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: config.colorHex }}
                    />
                    {isCurrentActive && (
                      <span 
                        className="absolute w-4 h-4 rounded-full animate-ping opacity-75"
                        style={{ backgroundColor: config.colorHex }}
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="text-[11px] font-chakra font-bold tracking-wider uppercase truncate"
                        style={{ color: isSelectedFilter ? config.textHex : "#CBD5E1" }}
                      >
                        Stage {config.stage}
                      </span>
                      {isCurrentActive && (
                        <span className="text-[8px] font-mono font-extrabold uppercase px-1 py-0.2 rounded bg-red-500 text-white animate-pulse">
                          LIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono truncate">
                      {config.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Horizon Banner: Operational Telemetry Bar */}
      <div className="p-3 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          
          {/* Active Stage Callout & Primary Directive */}
          <div className="flex items-start gap-3.5 max-w-2xl">
            {/* Blinking Stage Icon Ring */}
            <div 
              className="relative flex items-center justify-center w-12 h-12 rounded-xl shrink-0 mt-0.5 border"
              style={{
                backgroundColor: currentStageConfig.bgHex,
                borderColor: currentStageConfig.borderHex,
                boxShadow: `0 0 20px ${currentStageConfig.bgHex}`,
              }}
            >
              <AlertOctagon 
                className={`w-7 h-7 ${currentStageConfig.pulse ? "animate-pulse" : ""}`}
                style={{ color: currentStageConfig.colorHex }} 
              />
              {currentStageConfig.pulse && (
                <span 
                  className="absolute -inset-1 rounded-xl animate-ping opacity-30 border"
                  style={{ borderColor: currentStageConfig.colorHex }}
                />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span 
                  className="text-xs font-chakra font-extrabold tracking-widest px-2.5 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: currentStageConfig.bgHex,
                    color: currentStageConfig.textHex,
                    border: `1px solid ${currentStageConfig.borderHex}`,
                  }}
                >
                  {currentStageConfig.subName}
                </span>

                <span className="text-xs font-mono text-slate-300">
                  IMD Mandate: <strong className="text-white">Zero Casualties</strong>
                </span>

                {selectedStageFilter !== activeStage && (
                  <span className="text-[10px] font-mono text-yellow-300 bg-yellow-950/60 px-2 py-0.5 rounded border border-yellow-500/40">
                    Viewing Stage {selectedStageFilter} Specs
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-white font-rajdhani tracking-wide">
                {currentStageConfig.description}
              </h2>

              <p className="text-xs text-slate-300 font-mono flex items-center gap-1.5 pt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="text-[#00F2FE] font-semibold">Active Operational Mandate:</span> {currentStageConfig.actionSummary}
              </p>
            </div>
          </div>

          {/* Operational Telemetry Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
            
            {/* 1. Last Bulletin Issue */}
            <div className="p-2.5 rounded-lg bg-[#050B14]/80 border border-[#1E3252] flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
                <Calendar className="w-3 h-3 text-[#00F2FE]" />
                <span>Last Issued</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-white font-mono mt-1">
                {lastIssuedIst}
              </div>
              <div className="text-[9px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Synchronized</span>
              </div>
            </div>

            {/* 2. Next Mandated Update Countdown (3h Cycle) */}
            <div className="p-2.5 rounded-lg bg-[#050B14]/80 border border-[#1E3252] flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
                <Clock className="w-3 h-3 text-[#FF9100]" />
                <span>Next Update In</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-[#FF9100] font-mono mt-1 tracking-tight">
                {formatCountdown(secondsRemaining)}
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                Mandated 3h Cycle
              </div>
            </div>

            {/* 3. Expected Landfall Window */}
            <div className="p-2.5 rounded-lg bg-[#050B14]/80 border border-[#1E3252] flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
                <Compass className="w-3 h-3 text-red-400" />
                <span>Expected Landfall</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-white font-mono mt-1 leading-snug">
                {landfallTime}
              </div>
              <div className="text-[9px] font-mono text-red-400">
                Puri Sector (&plusmn;3h)
              </div>
            </div>

            {/* 4. Peak Storm Surge Height */}
            <div className="p-2.5 rounded-lg bg-[#050B14]/80 border border-[#1E3252] flex flex-col justify-between">
              <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 uppercase">
                <Waves className="w-3 h-3 text-[#00F2FE]" />
                <span>Peak Storm Surge</span>
              </div>
              <div className="text-sm sm:text-base font-bold text-[#00F2FE] font-mono mt-1">
                +{surgeHeightM}m <span className="text-[10px] text-slate-300 font-normal">AAT</span>
              </div>
              <div className="text-[9px] font-mono text-slate-400">
                Reach: 4.8 km inshore
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
