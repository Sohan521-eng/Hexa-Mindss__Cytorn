"use client";

import React, { useState } from "react";
import { X, TrendingDown, Layers, Building2, Shield, Zap, Route } from "lucide-react";
import { PURI_TRANSECT_PROFILE } from "./digitalTwinData";
import { TransectPoint } from "./types";

interface ElevationTransectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSurgeMeters: number;
}

export function ElevationTransectModal({
  isOpen,
  onClose,
  currentSurgeMeters,
}: ElevationTransectModalProps) {
  const [hoveredPoint, setHoveredPoint] = useState<TransectPoint | null>(null);

  if (!isOpen) return null;

  // Chart Dimensions & Scales
  const width = 800;
  const height = 360;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };

  const minDistance = 0;
  const maxDistance = 9.0; // km
  const minElevation = -8.0; // meters MSL
  const maxElevation = 8.0; // meters MSL

  const scaleX = (km: number) =>
    padding.left + ((km - minDistance) / (maxDistance - minDistance)) * (width - padding.left - padding.right);

  const scaleY = (m: number) =>
    height - padding.bottom - ((m - minElevation) / (maxElevation - minElevation)) * (height - padding.top - padding.bottom);

  // SVG Terrain path
  const terrainPath = PURI_TRANSECT_PROFILE.map((pt, i) => {
    const x = scaleX(pt.distanceKm);
    const y = scaleY(pt.elevationMsl);
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");

  // Closed path for terrain fill
  const terrainAreaPath = `${terrainPath} L ${scaleX(maxDistance)} ${scaleY(minElevation)} L ${scaleX(minDistance)} ${scaleY(minElevation)} Z`;

  // Surge water line at currentSurgeMeters
  const waterY = scaleY(currentSurgeMeters);
  const mslY = scaleY(0);

  // Find land-water intersection (where elevation reaches water height)
  const coastInterceptKm = 4.2; // approx distance where elevation exceeds surge
  const waterEndX = scaleX(coastInterceptKm);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B14]/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-[#0F1B2F]/95 border border-[#00F2FE]/40 rounded-2xl shadow-[0_0_40px_rgba(0,242,254,0.25)] flex flex-col overflow-hidden text-white font-jakarta"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E3A5F] bg-[#050B14]/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#00F2FE]/20 border border-[#00F2FE]/50 flex items-center justify-center text-[#00F2FE]">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold uppercase tracking-wider text-white">
                COASTAL ELEVATION TRANSECT TOOL
              </h2>
              <p className="text-xs font-rajdhani text-slate-400">
                Puri Coastline (Seafront) → Pipili Inland Ridge Elevation Cross-Section vs. +{currentSurgeMeters.toFixed(1)}m Surge Line
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#050B14] hover:bg-[#FF5E36]/20 border border-[#1E3A5F] hover:border-[#FF5E36] text-slate-400 hover:text-[#FF5E36] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: SVG Elevation Chart */}
        <div className="p-6 flex flex-col gap-4">
          <div className="relative w-full overflow-x-auto bg-[#050B14]/90 rounded-xl border border-[#1E3A5F] p-2">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto min-w-[650px]"
            >
              <defs>
                {/* Terrain Gradient */}
                <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E3A5F" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#0B1528" stopOpacity="0.95" />
                </linearGradient>

                {/* Flood Water Gradient */}
                <linearGradient id="floodGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#0E3D59" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {[-6, -4, -2, 0, 2, 4, 6].map((el) => {
                const y = scaleY(el);
                return (
                  <g key={el}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={width - padding.right}
                      y2={y}
                      stroke={el === 0 ? "rgba(255,255,255,0.4)" : "rgba(30,58,95,0.4)"}
                      strokeDasharray={el === 0 ? "" : "4 4"}
                      strokeWidth={el === 0 ? "1.5" : "1"}
                    />
                    <text
                      x={padding.left - 10}
                      y={y + 3}
                      fill={el === 0 ? "#FFFFFF" : "#64748B"}
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      textAnchor="end"
                    >
                      {el > 0 ? `+${el}m` : `${el}m`}
                    </text>
                  </g>
                );
              })}

              {/* 0m MSL Datum line label */}
              <text
                x={width - padding.right + 5}
                y={mslY + 3}
                fill="#94A3B8"
                fontSize="9"
                fontFamily="Rajdhani"
                fontWeight="bold"
              >
                0m MSL
              </text>

              {/* Terrain Polygon Fill */}
              <path d={terrainAreaPath} fill="url(#terrainGrad)" />
              <path d={terrainPath} fill="none" stroke="#60A5FA" strokeWidth="2.5" />

              {/* Flood Water Fill Layer */}
              <rect
                x={padding.left}
                y={waterY}
                width={Math.max(0, waterEndX - padding.left)}
                height={Math.max(0, height - padding.bottom - waterY)}
                fill="url(#floodGrad)"
                clipPath="url(#floodClip)"
              />

              {/* Surge Water Surface Line */}
              <line
                x1={padding.left}
                y1={waterY}
                x2={waterEndX}
                y2={waterY}
                stroke="#00F2FE"
                strokeWidth="2.5"
                strokeDasharray="6 3"
              />
              <text
                x={waterEndX + 8}
                y={waterY + 3}
                fill="#00F2FE"
                fontSize="10"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
              >
                SURGE PEAK (+{currentSurgeMeters.toFixed(1)}m)
              </text>

              {/* Asset Marker Pins */}
              {PURI_TRANSECT_PROFILE.filter((pt) => pt.assetType).map((pt) => {
                const x = scaleX(pt.distanceKm);
                const y = scaleY(pt.elevationMsl);
                const isFlooded = currentSurgeMeters > pt.elevationMsl;

                return (
                  <g
                    key={pt.name}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Vertical guideline */}
                    <line
                      x1={x}
                      y1={y}
                      x2={x}
                      y2={height - padding.bottom}
                      stroke={isFlooded ? "rgba(239,68,68,0.5)" : "rgba(16,231,162,0.5)"}
                      strokeDasharray="2 2"
                    />

                    {/* Pin Circle */}
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill={isFlooded ? "#EF4444" : "#10E7A2"}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      className="transition-transform group-hover:scale-125"
                    />

                    {/* Pin Label */}
                    <text
                      x={x}
                      y={y - 12}
                      fill={isFlooded ? "#FCA5A5" : "#6EE7B7"}
                      fontSize="9"
                      fontFamily="Rajdhani"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {pt.name}
                    </text>
                  </g>
                );
              })}

              {/* Distance Axis (X-Axis) */}
              <line
                x1={padding.left}
                y1={height - padding.bottom}
                x2={width - padding.right}
                y2={height - padding.bottom}
                stroke="#475569"
                strokeWidth="1.5"
              />
              {[0, 1.5, 3.0, 4.5, 6.0, 7.5, 9.0].map((km) => {
                const x = scaleX(km);
                return (
                  <g key={km}>
                    <line x1={x} y1={height - padding.bottom} x2={x} y2={height - padding.bottom + 5} stroke="#64748B" />
                    <text
                      x={x}
                      y={height - padding.bottom + 18}
                      fill="#94A3B8"
                      fontSize="10"
                      fontFamily="JetBrains Mono"
                      textAnchor="middle"
                    >
                      {km} km
                    </text>
                  </g>
                );
              })}
              <text
                x={width / 2}
                y={height - 15}
                fill="#94A3B8"
                fontSize="11"
                fontFamily="Rajdhani"
                fontWeight="bold"
                textAnchor="middle"
              >
                DISTANCE INLAND FROM CONTINENTAL SHELF (KILOMETERS)
              </text>
            </svg>
          </div>

          {/* Hover Telemetry Card or Default Overview */}
          <div className="p-3.5 rounded-xl bg-[#050B14]/80 border border-[#1E3A5F] flex flex-wrap items-center justify-between gap-3 text-xs">
            {hoveredPoint ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-rajdhani font-bold text-slate-400">POINT:</span>
                  <span className="font-bold text-white text-sm">{hoveredPoint.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-rajdhani font-bold text-slate-400">DISTANCE:</span>
                  <span className="font-jetbrains text-[#00F2FE]">{hoveredPoint.distanceKm} km inland</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-rajdhani font-bold text-slate-400">BASE ELEVATION:</span>
                  <span className="font-jetbrains text-amber-300">+{hoveredPoint.elevationMsl}m MSL</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-rajdhani font-bold text-slate-400">STATUS:</span>
                  {currentSurgeMeters > hoveredPoint.elevationMsl ? (
                    <span className="font-chakra font-bold text-[#EF4444] px-1.5 py-0.5 rounded bg-[#EF4444]/20 border border-[#EF4444]/40">
                      SUBMERGED (+{(currentSurgeMeters - hoveredPoint.elevationMsl).toFixed(1)}m water)
                    </span>
                  ) : (
                    <span className="font-chakra font-bold text-[#10E7A2] px-1.5 py-0.5 rounded bg-[#10E7A2]/20 border border-[#10E7A2]/40">
                      DRY SAFE (+{(hoveredPoint.elevationMsl - currentSurgeMeters).toFixed(1)}m clearance)
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-300 font-rajdhani text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] animate-pulse" />
                <span>
                  Hover over any node along the transect to inspect exact ground elevation vs. surge depth above floor level.
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-[#00F2FE]/20 hover:bg-[#00F2FE]/30 border border-[#00F2FE]/50 text-[#00F2FE] font-rajdhani font-bold transition-all ml-auto"
            >
              CLOSE TRANSECT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
