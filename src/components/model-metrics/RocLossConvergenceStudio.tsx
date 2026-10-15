"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  TrendingDown, 
  BarChart, 
  Sparkles, 
  Check, 
  Layers, 
  Scale, 
  Info
} from "lucide-react";
import { 
  ROC_CURVES_DATA, 
  PR_CURVES_DATA, 
  LOSS_CONVERGENCE_SERIES, 
  DVORAK_CLASSES 
} from "./benchmarkData";
import { DvorakClassId } from "./types";
import { Noise } from "@/components/ui/Noise";

type StudioViewMode = "roc" | "pr" | "loss";

export function RocLossConvergenceStudio() {
  const [activeView, setActiveView] = useState<StudioViewMode>("roc");
  const [isLogScale, setIsLogScale] = useState<boolean>(false);
  const [hoveredLossEpoch, setHoveredLossEpoch] = useState<number | null>(null);

  // Active Classes to render on ROC
  const [visibleClasses, setVisibleClasses] = useState<Record<string, boolean>>({
    macro: true,
    eye: true,
    "curved-band": true,
    cdo: true,
    shear: true,
    "embedded-center": true,
  });

  const toggleClass = (key: string) => {
    setVisibleClasses((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // SVG Chart Dimensions & Responsive Container Width
  // SVG Chart Dimensions & Responsive Container Width / Height
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartW, setChartW] = useState<number>(750);
  const [chartH, setChartH] = useState<number>(220);
  const padL = 50;
  const padR = 25;
  const padT = 20;
  const padB = 35;
  const usableW = Math.max(100, chartW - padL - padR);
  const usableH = Math.max(80, chartH - padT - padB);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const w = chartContainerRef.current.clientWidth - 16;
        const h = chartContainerRef.current.clientHeight - 16;
        if (w > 200) setChartW(w);
        if (h > 100) setChartH(h);
      }
    };
    updateDimensions();
    const ro = new ResizeObserver(updateDimensions);
    ro.observe(chartContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // 1. ROC & PR Curve Projection
  const projectRocCoord = (fpr: number, tpr: number): [number, number] => {
    const x = padL + fpr * usableW;
    const y = padT + (1 - tpr) * usableH;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  };

  const projectPrCoord = (rec: number, prec: number): [number, number] => {
    const x = padL + rec * usableW;
    const y = padT + (1 - prec) * usableH;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  };

  // 2. Loss Chart Projection (Epoch 1..150, Loss 0.001..2.0)
  const projectLossCoord = (epoch: number, lossVal: number): [number, number] => {
    const x = padL + ((epoch - 1) / 149) * usableW;
    let normalizedY: number;

    if (isLogScale) {
      // Log10 scale: range from 0.002 to 2.5 -> log10 ranges approx -2.7 to 0.4
      const minLog = Math.log10(0.002);
      const maxLog = Math.log10(2.5);
      const currentLog = Math.log10(Math.max(0.002, lossVal));
      normalizedY = (currentLog - minLog) / (maxLog - minLog);
    } else {
      // Linear scale: 0 to 2.0
      normalizedY = lossVal / 2.0;
    }

    const y = padT + (1 - Math.min(1, Math.max(0, normalizedY))) * usableH;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  };

  // Path generator for Loss curves
  const getLossPath = (key: "trainLoss" | "valLoss" | "physicsPenalty") => {
    return LOSS_CONVERGENCE_SERIES.map((pt, i) => {
      const [x, y] = projectLossCoord(pt.epoch, pt[key]);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <section 
      id="ml-diagnostics-panel"
      className="relative rounded-2xl overflow-hidden p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.7)] bg-transparent flex-1 min-h-0"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.18)",
      }}
    >
      {/* Background layer with Noise & ambient glow */}
      <div className="absolute inset-0 bg-[#0F1B2F]/95 backdrop-blur-md pointer-events-none rounded-2xl overflow-hidden">
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={12}
        />
        <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col justify-between flex-1 min-h-0">
      {/* 1. Header Toolbar with Studio Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(0,242,254,0.14)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black font-rajdhani uppercase tracking-wider flex items-center">
              <span className="heading-gradient-shadow-wrapper">
                <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                  ROC-AUC & Loss Convergence Studio
                </span>
              </span>
            </h2>
          </div>
          <p className="text-xs mt-0.5 font-mono" style={{ color: '#00F2FE', textShadow: '1px 2px 6px rgba(0,0,0,0.9)' }}>
            Empirical Cross-Entropy &amp; Navier-Stokes PINN penalty convergence across 150 training epochs.
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] shrink-0">
            <button
              onClick={() => setActiveView("roc")}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                activeView === "roc"
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                  : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
              }`}
            >
              ROC-AUC
            </button>
            <button
              onClick={() => setActiveView("pr")}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                activeView === "pr"
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                  : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
              }`}
            >
              Precision-Recall
            </button>
            <button
              onClick={() => setActiveView("loss")}
              className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                activeView === "loss"
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                  : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
              }`}
            >
              Loss (150 Ep)
            </button>
          </div>

          {/* Scale Toggle for Loss View */}
          {activeView === "loss" && (
            <button
              onClick={() => setIsLogScale(!isLogScale)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-mono font-bold bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] hover:border-[#00F2FE]/70 text-[#8E9EB5] hover:text-[#00F2FE] transition-all cursor-pointer shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]"
              title="Toggle Logarithmic / Linear Y-Axis"
            >
              <Scale className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>{isLogScale ? "Log₁₀" : "Linear"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Main High-Density SVG Chart Canvas */}
      <div 
        ref={chartContainerRef}
        className="my-2.5 w-full flex-1 min-h-[140px] bg-[#050B14] rounded-xl p-2 relative overflow-hidden"
        style={{
          border: "1.5px solid rgba(0, 242, 254, 0.55)",
          boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85)",
        }}
      >
        
        {/* Subtle Background Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(0,242,254,0.3) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />

        <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-full">
          {/* Coordinate Graticules & Axis */}
          <g className="stroke-slate-800 stroke-[1]">
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
              const y = padT + frac * usableH;
              return (
                <line key={`h-grid-${idx}`} x1={padL} y1={y} x2={chartW - padR} y2={y} strokeDasharray="3 3" />
              );
            })}
            {/* Vertical Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1.0].map((frac, idx) => {
              const x = padL + frac * usableW;
              return (
                <line key={`v-grid-${idx}`} x1={x} y1={padT} x2={x} y2={chartH - padB} strokeDasharray="3 3" />
              );
            })}
          </g>

          {/* ================================================= */}
          {/* VIEW 1: ROC-AUC CURVES */}
          {/* ================================================= */}
          {activeView === "roc" && (
            <g id="roc-chart-group">
              {/* Chance Diagonal (y = x) */}
              <line
                x1={padL}
                y1={chartH - padB}
                x2={chartW - padR}
                y2={padT}
                stroke="#64748B"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                opacity="0.6"
              />

              {/* Individual Class Curves */}
              {Object.entries(ROC_CURVES_DATA).map(([key, points]) => {
                if (!visibleClasses[key]) return null;
                const isMacro = key === "macro";
                const color = isMacro ? "#00E676" : DVORAK_CLASSES[key as DvorakClassId]?.color || "#00F2FE";

                const pathStr = points.map((pt, i) => {
                  const [x, y] = projectRocCoord(pt.fpr, pt.tpr);
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ");

                return (
                  <path
                    key={`roc-${key}`}
                    d={pathStr}
                    fill="none"
                    stroke={color}
                    strokeWidth={isMacro ? 3.5 : 2}
                    strokeDasharray={isMacro ? "none" : key === "eye" ? "none" : "4 2"}
                    className="filter drop-shadow-[0_0_6px_rgba(0,242,254,0.4)] transition-all"
                  />
                );
              })}

              {/* Axis Labels */}
              <text x={padL + usableW / 2} y={chartH - 10} textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                False Positive Rate (1 - Specificity)
              </text>
              <text 
                x={15} 
                y={padT + usableH / 2} 
                textAnchor="middle" 
                fill="#94A3B8" 
                fontSize="10" 
                fontFamily="monospace"
                transform={`rotate(-90 15 ${padT + usableH / 2})`}
              >
                True Positive Rate (Sensitivity)
              </text>
            </g>
          )}

          {/* ================================================= */}
          {/* VIEW 2: PRECISION-RECALL (PR) CURVES */}
          {/* ================================================= */}
          {activeView === "pr" && (
            <g id="pr-chart-group">
              {/* Macro & Class Curves */}
              {Object.entries(PR_CURVES_DATA).map(([key, points]) => {
                const isMacro = key === "macro";
                const color = isMacro ? "#00F2FE" : key === "eye" ? "#00E676" : "#FFB300";

                const pathStr = points.map((pt, i) => {
                  const [x, y] = projectPrCoord(pt.recall, pt.precision);
                  return `${i === 0 ? "M" : "L"} ${x} ${y}`;
                }).join(" ");

                return (
                  <path
                    key={`pr-${key}`}
                    d={pathStr}
                    fill="none"
                    stroke={color}
                    strokeWidth={isMacro ? 3.5 : 2}
                    className="filter drop-shadow-[0_0_6px_rgba(0,242,254,0.4)]"
                  />
                );
              })}

              {/* Axis Labels */}
              <text x={padL + usableW / 2} y={chartH - 10} textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                Recall (Coverage of Landfall Gale Events)
              </text>
              <text 
                x={15} 
                y={padT + usableH / 2} 
                textAnchor="middle" 
                fill="#94A3B8" 
                fontSize="10" 
                fontFamily="monospace"
                transform={`rotate(-90 15 ${padT + usableH / 2})`}
              >
                Precision (Reliability Ratio)
              </text>
            </g>
          )}

          {/* ================================================= */}
          {/* VIEW 3: 150-EPOCH TRAINING LOSS CONVERGENCE */}
          {/* ================================================= */}
          {activeView === "loss" && (
            <g id="loss-chart-group">
              {/* Physics Penalty Target Threshold Line (L_physics < 0.005) */}
              {(() => {
                const [, yThresh] = projectLossCoord(1, 0.005);
                return (
                  <g>
                    <line
                      x1={padL}
                      y1={yThresh}
                      x2={chartW - padR}
                      y2={yThresh}
                      stroke="#00E676"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.8"
                    />
                    <text x={chartW - padR - 5} y={yThresh - 4} textAnchor="end" fill="#00E676" fontSize="9" fontFamily="monospace">
                      PINNs Bound: L_physics &lt; 0.005
                    </text>
                  </g>
                );
              })()}

              {/* Validation Loss Curve */}
              <path
                d={getLossPath("valLoss")}
                fill="none"
                stroke="#FF5E36"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_6px_rgba(255,94,54,0.6)]"
              />

              {/* Training Loss Curve */}
              <path
                d={getLossPath("trainLoss")}
                fill="none"
                stroke="#00F2FE"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_6px_rgba(0,242,254,0.6)]"
              />

              {/* Navier-Stokes Physics Loss */}
              <path
                d={getLossPath("physicsPenalty")}
                fill="none"
                stroke="#00E676"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="filter drop-shadow-[0_0_4px_rgba(0,230,118,0.5)]"
              />

              {/* Axis Labels */}
              <text x={padL + usableW / 2} y={chartH - 10} textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                Training Epoch (1 to 150)
              </text>
              <text 
                x={15} 
                y={padT + usableH / 2} 
                textAnchor="middle" 
                fill="#94A3B8" 
                fontSize="10" 
                fontFamily="monospace"
                transform={`rotate(-90 15 ${padT + usableH / 2})`}
              >
                {isLogScale ? "Log₁₀ Loss" : "Loss Magnitude"}
              </text>
            </g>
          )}

          {/* Coordinate Values on Y-Axis */}
          <g className="fill-slate-500 text-[9px] font-mono" textAnchor="end">
            <text x={padL - 6} y={padT + 4}>
              {activeView === "loss" ? (isLogScale ? "10⁰" : "2.0") : "1.0"}
            </text>
            <text x={padL - 6} y={padT + usableH / 2 + 3}>
              {activeView === "loss" ? (isLogScale ? "10⁻¹" : "1.0") : "0.5"}
            </text>
            <text x={padL - 6} y={chartH - padB + 3}>
              {activeView === "loss" ? (isLogScale ? "10⁻³" : "0.0") : "0.0"}
            </text>
          </g>

          {/* Coordinate Values on X-Axis */}
          <g className="fill-slate-500 text-[9px] font-mono" textAnchor="middle">
            <text x={padL} y={chartH - padB + 14}>
              {activeView === "loss" ? "1" : "0.0"}
            </text>
            <text x={padL + usableW / 2} y={chartH - padB + 14}>
              {activeView === "loss" ? "75" : "0.5"}
            </text>
            <text x={chartW - padR} y={chartH - padB + 14}>
              {activeView === "loss" ? "150" : "1.0"}
            </text>
          </g>
        </svg>

        {/* Legend Box in Top-Right of Chart */}
        <div 
          className="absolute top-3 right-3 overflow-hidden bg-[#0A1424]/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-mono flex flex-col gap-1 shadow-[0_4px_16px_rgba(0,0,0,0.7)]"
          style={{
            border: "1.5px solid rgba(0, 242, 254, 0.55)",
          }}
        >
          {/* Noise texture overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
            <Noise
              patternSize={150}
              patternScaleX={1}
              patternScaleY={1}
              patternRefreshInterval={3}
              patternAlpha={14}
            />
          </div>

          <div className="relative z-10 flex flex-col gap-1">
            {activeView === "roc" && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#00E676] rounded" />
                  <span className="text-[#00E676] font-bold">Macro-Avg AUC: 0.978</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#00F2FE] rounded" />
                  <span className="text-slate-300">5 Dvorak Classes</span>
                </div>
              </>
            )}

            {activeView === "pr" && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#00F2FE] rounded" />
                  <span className="text-[#00F2FE] font-bold">Macro AUC-PR: 0.965</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#00E676] rounded" />
                  <span className="text-slate-300">Cat 5 Rare Eye Pattern</span>
                </div>
              </>
            )}

            {activeView === "loss" && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#00F2FE] rounded" />
                  <span className="text-slate-300">Train Loss: <b>0.042</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#FF5E36] rounded" />
                  <span className="text-slate-300">Val Loss: <b>0.058</b></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-1 bg-[#00E676] rounded" />
                  <span className="text-[#00E676] font-bold">PINN: <b>&lt; 0.005</b></span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Class Toggle Filters (for ROC view) */}
      {activeView === "roc" && (
        <div className="flex items-center gap-2.5 pt-2.5 border-t border-[rgba(0,242,254,0.14)] text-[11px] font-mono">
          <span className="text-[#00F2FE] font-bold uppercase tracking-wider text-[10px] shrink-0 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">Filter Curves:</span>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
            {Object.keys(visibleClasses).map((k) => {
              const isMacro = k === "macro";
              const name = isMacro ? "Macro Average" : DVORAK_CLASSES[k as DvorakClassId]?.name || k;
              const color = isMacro ? "#00E676" : DVORAK_CLASSES[k as DvorakClassId]?.color || "#00F2FE";
              const isActive = visibleClasses[k];

              return (
                <button
                  key={`btn-${k}`}
                  onClick={() => toggleClass(k)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer border text-center justify-center flex items-center ${
                    isActive
                      ? "hover:brightness-110"
                      : "opacity-45 hover:opacity-90 hover:border-slate-500 hover:text-white"
                  }`}
                  style={{
                    backgroundColor: isActive ? `${color}1F` : "rgba(5, 11, 20, 0.7)",
                    borderColor: isActive ? `${color}B3` : "#1E3252",
                    color: isActive ? color : "#8E9EB5",
                    boxShadow: isActive ? `0 0 10px ${color}40` : "none",
                    textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                  }}
                  title={name}
                >
                  <span className="truncate">{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      </div>
    </section>
  );
}
