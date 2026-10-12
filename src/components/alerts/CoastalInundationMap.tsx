"use client";

import React, { useState, useRef } from "react";
import { 
  Waves, 
  Hospital, 
  ShieldCheck, 
  Zap, 
  Milestone, 
  Maximize2, 
  Minimize2, 
  Info, 
  Eye, 
  EyeOff, 
  Layers, 
  Compass, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Building2,
  Navigation
} from "lucide-react";
import { 
  InfrastructureNode, 
  InfrastructureType, 
  SurgeContourLevel, 
  DistrictVulnerability 
} from "./types";
import { CRITICAL_INFRASTRUCTURE_NODES } from "./alertsData";

interface CoastalInundationMapProps {
  selectedDistrict: DistrictVulnerability | null;
  onSelectDistrictById: (districtId: string) => void;
  onOpenEvacModal: (district: DistrictVulnerability) => void;
}

export function CoastalInundationMap({
  selectedDistrict,
  onSelectDistrictById,
  onOpenEvacModal,
}: CoastalInundationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Contour toggles (0.5m, 1.5m, 3.0m, 5.0m)
  const [visibleContours, setVisibleContours] = useState<Record<SurgeContourLevel, boolean>>({
    0.5: true,
    1.5: true,
    3.0: true,
    5.0: true,
  });

  // Infrastructure overlay layer toggles
  const [visibleLayers, setVisibleLayers] = useState<Record<InfrastructureType, boolean>>({
    hospital: true,
    shelter: true,
    substation: true,
    highway: true,
  });

  // Selected or hovered node for HUD popover
  const [activeNode, setActiveNode] = useState<InfrastructureNode | null>(null);

  // Toggle fullscreen
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleContour = (level: SurgeContourLevel) => {
    setVisibleContours((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const handleToggleLayer = (type: InfrastructureType) => {
    setVisibleLayers((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Filter nodes based on visible layers
  const displayedNodes = CRITICAL_INFRASTRUCTURE_NODES.filter(
    (node) => visibleLayers[node.type]
  );

  return (
    <div 
      ref={containerRef}
      id="coastal-inundation-canvas"
      className={`relative flex flex-col rounded-xl border border-[rgba(0,242,254,0.2)] bg-[#0A1220] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-300 ${
        isFullscreen ? "p-6 fixed inset-0 z-50 rounded-none bg-[#050B14]" : "h-full min-h-[460px] lg:min-h-[500px]"
      }`}
    >
      {/* Top Header & Layer Toggles Bar */}
      <div className="p-3 sm:p-4 bg-[#0F1B2F]/90 border-b border-[rgba(0,242,254,0.15)] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0E3D59] border border-[#00F2FE]/40 flex items-center justify-center">
            <Waves className="w-4 h-4 text-[#00F2FE]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white font-orbitron tracking-wide flex items-center gap-2">
              <span>Coastal Inundation & Infrastructure Map</span>
              <span className="text-[10px] font-mono text-[#00F2FE] bg-[#00F2FE]/10 px-1.5 py-0.5 rounded border border-[#00F2FE]/30 font-semibold">
                2D GIS SIMULATOR
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-mono">
              Bay of Bengal Surge Extent • Shoreline Inundation & Critical Facility Risk
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Fullscreen Button */}
          <button
            onClick={handleToggleFullscreen}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#050B14] hover:bg-[#16253D] border border-[#1E3252] hover:border-[#00F2FE]/50 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
            title="Toggle Fullscreen Map Canvas"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Strip: Contours & Critical Infrastructure Filters */}
      <div className="px-3 py-2.5 bg-[#08101E]/95 border-b border-[rgba(0,242,254,0.1)] flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
        
        {/* Surge Elevation Contour Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#00F2FE]" />
            Surge Contours:
          </span>

          <label className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#050B14] border border-[#00F2FE]/30 text-[11px] font-mono text-cyan-300 cursor-pointer hover:bg-cyan-950/30">
            <input
              type="checkbox"
              checked={visibleContours[0.5]}
              onChange={() => handleToggleContour(0.5)}
              className="accent-[#00F2FE] cursor-pointer w-3 h-3"
            />
            <span>0.5m Wash</span>
          </label>

          <label className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#050B14] border border-amber-500/30 text-[11px] font-mono text-amber-300 cursor-pointer hover:bg-amber-950/30">
            <input
              type="checkbox"
              checked={visibleContours[1.5]}
              onChange={() => handleToggleContour(1.5)}
              className="accent-[#FF9100] cursor-pointer w-3 h-3"
            />
            <span>1.5m Road</span>
          </label>

          <label className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#050B14] border border-red-500/30 text-[11px] font-mono text-red-300 cursor-pointer hover:bg-red-950/30">
            <input
              type="checkbox"
              checked={visibleContours[3.0]}
              onChange={() => handleToggleContour(3.0)}
              className="accent-[#D50000] cursor-pointer w-3 h-3"
            />
            <span>3.0m Struct</span>
          </label>

          <label className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#050B14] border border-fuchsia-500/30 text-[11px] font-mono text-fuchsia-300 cursor-pointer hover:bg-fuchsia-950/30">
            <input
              type="checkbox"
              checked={visibleContours[5.0]}
              onChange={() => handleToggleContour(5.0)}
              className="accent-[#E040FB] cursor-pointer w-3 h-3"
            />
            <span>5.0m Extreme</span>
          </label>
        </div>

        {/* Infrastructure Layer Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mr-1">
            Overlays:
          </span>

          <button
            onClick={() => handleToggleLayer("hospital")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium transition-all cursor-pointer border ${
              visibleLayers.hospital
                ? "bg-red-950/60 text-red-300 border-red-500/50 shadow-[0_0_8px_rgba(213,0,0,0.3)]"
                : "bg-[#050B14] text-slate-500 border-slate-800"
            }`}
          >
            <Hospital className="w-3 h-3 text-red-400" />
            <span>Hospitals</span>
          </button>

          <button
            onClick={() => handleToggleLayer("shelter")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium transition-all cursor-pointer border ${
              visibleLayers.shelter
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/50 shadow-[0_0_8px_rgba(0,230,118,0.3)]"
                : "bg-[#050B14] text-slate-500 border-slate-800"
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Shelters</span>
          </button>

          <button
            onClick={() => handleToggleLayer("substation")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium transition-all cursor-pointer border ${
              visibleLayers.substation
                ? "bg-amber-950/60 text-amber-300 border-amber-500/50 shadow-[0_0_8px_rgba(255,145,0,0.3)]"
                : "bg-[#050B14] text-slate-500 border-slate-800"
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Substations</span>
          </button>

          <button
            onClick={() => handleToggleLayer("highway")}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono font-medium transition-all cursor-pointer border ${
              visibleLayers.highway
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                : "bg-[#050B14] text-slate-500 border-slate-800"
            }`}
          >
            <Milestone className="w-3 h-3 text-cyan-400" />
            <span>Highways</span>
          </button>
        </div>

      </div>

      {/* Main Interactive Map Viewport */}
      <div className="relative flex-1 w-full bg-[#03070E] overflow-hidden select-none min-h-[340px]">
        
        {/* SVG Geospatial Canvas */}
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Ocean Depth Gradient */}
            <radialGradient id="bayOceanGrad" cx="75%" cy="70%" r="80%">
              <stop offset="0%" stopColor="#0B2B4A" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#07192C" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#030A14" stopOpacity="1" />
            </radialGradient>

            {/* Land Gradient */}
            <linearGradient id="coastalLandGrad" x1="0%" y1="0%" x2="60%" y2="80%">
              <stop offset="0%" stopColor="#0D1F1B" />
              <stop offset="60%" stopColor="#112520" />
              <stop offset="100%" stopColor="#0E1E1C" />
            </linearGradient>

            {/* Storm Surge Inundation Wave Gradients */}
            <radialGradient id="surgeWaveGrad5m" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#E040FB" stopOpacity="0.55" />
              <stop offset="70%" stopColor="#E040FB" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#E040FB" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="surgeWaveGrad3m" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D50000" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#D50000" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#D50000" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="surgeWaveGrad15m" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF9100" stopOpacity="0.45" />
              <stop offset="70%" stopColor="#FF9100" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#FF9100" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="surgeWaveGrad05m" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#00F2FE" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#00F2FE" stopOpacity="0" />
            </radialGradient>

            {/* Radar Sweep Pattern */}
            <pattern id="radarGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 242, 254, 0.05)" strokeWidth="0.8" />
            </pattern>
          </defs>

          {/* Deep Ocean Base (Bay of Bengal) */}
          <rect width="1000" height="650" fill="url(#bayOceanGrad)" />
          <rect width="1000" height="650" fill="url(#radarGrid)" />

          {/* Bathymetry Depth Contours in Bay of Bengal */}
          <path
            d="M 450 650 Q 600 500 700 350 T 950 150"
            fill="none"
            stroke="rgba(0, 242, 254, 0.12)"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
          <text x="710" y="370" fill="rgba(0,242,254,0.3)" fontSize="10" fontFamily="monospace">
            200m Continental Shelf Edge
          </text>

          <path
            d="M 520 650 Q 680 480 780 300 T 1000 80"
            fill="none"
            stroke="rgba(0, 242, 254, 0.08)"
            strokeWidth="1"
            strokeDasharray="2 4"
          />
          <text x="800" y="270" fill="rgba(0,242,254,0.25)" fontSize="9" fontFamily="monospace">
            1000m Deep Abyssal Plain
          </text>

          {/* Coastal Landmass (Odisha & West Bengal Shoreline) */}
          {/* Defined from SW (Ganjam) -> Puri -> Paradip -> Kendrapara -> Balasore -> Digha -> Sundarbans */}
          <path
            d="
              M 0 0
              L 0 650
              L 260 650
              C 300 580, 360 540, 420 510
              C 480 490, 560 480, 620 430
              C 670 390, 660 330, 670 270
              C 690 220, 750 190, 810 160
              C 880 130, 930 110, 1000 80
              L 1000 0
              Z
            "
            fill="url(#coastalLandGrad)"
            stroke="#1D3E35"
            strokeWidth="1.5"
          />

          {/* Estuaries, Rivers & Tidal Inlets (Mahanadi, Baitarani, Subarnarekha, Hooghly) */}
          <path
            d="M 280 340 Q 420 420 620 430"
            fill="none"
            stroke="#0B2B4A"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 330 250 Q 520 320 670 270"
            fill="none"
            stroke="#0B2B4A"
            strokeWidth="3.5"
          />
          <path
            d="M 450 150 Q 620 180 810 160"
            fill="none"
            stroke="#0B2B4A"
            strokeWidth="4"
          />

          {/* Dynamic Surge Reach Contours (Toggled by user) */}
          {/* Contour 0.5m: Beachfront wash over */}
          {visibleContours[0.5] && (
            <path
              d="
                M 270 650
                C 310 575, 370 535, 430 505
                C 490 485, 570 475, 630 425
                C 680 385, 670 325, 680 265
                C 700 215, 760 185, 820 155
                C 890 125, 940 105, 1000 75
              "
              fill="none"
              stroke="#00F2FE"
              strokeWidth="3.5"
              strokeOpacity="0.8"
              strokeDasharray="8 4"
            />
          )}

          {/* Contour 1.5m: Roadway inundation zone */}
          {visibleContours[1.5] && (
            <path
              d="
                M 250 650
                C 290 570, 350 530, 410 498
                C 470 478, 550 468, 610 415
                C 655 375, 650 315, 660 255
                C 680 205, 740 175, 800 148
                C 870 118, 920  98, 1000 68
              "
              fill="none"
              stroke="#FF9100"
              strokeWidth="3"
              strokeOpacity="0.85"
            />
          )}

          {/* Contour 3.0m: Structural flooding ground zero */}
          {visibleContours[3.0] && (
            <path
              d="
                M 230 650
                C 270 560, 330 520, 390 488
                C 450 468, 530 455, 590 405
                C 635 365, 630 305, 640 245
                C 660 195, 720 165, 780 138
                C 850 108, 900  88, 1000 58
              "
              fill="none"
              stroke="#D50000"
              strokeWidth="4"
              strokeOpacity="0.9"
            />
          )}

          {/* Contour 5.0m: Extreme saltwater reach */}
          {visibleContours[5.0] && (
            <path
              d="
                M 210 650
                C 250 550, 310 510, 370 478
                C 430 458, 510 445, 570 392
                C 615 352, 610 292, 620 232
                C 640 182, 700 152, 760 126
                C 830  96, 880  76, 1000 46
              "
              fill="none"
              stroke="#E040FB"
              strokeWidth="3"
              strokeOpacity="0.85"
              strokeDasharray="6 3"
            />
          )}

          {/* Active Surge Inundation Plume (Simulated Animated Saline Wash over Puri-Paradip) */}
          <polygon
            points="390,488 470,470 630,425 610,415 570,392 410,498"
            fill="url(#surgeWaveGrad3m)"
            className="animate-pulse"
          />

          {/* Cyclone MOCHA Eye Center & Eye-Wall Approach Vector */}
          <g transform="translate(680, 510)">
            {/* Outer Spiral Bands */}
            <circle r="60" fill="none" stroke="rgba(213,0,0,0.3)" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle r="40" fill="none" stroke="rgba(255,145,0,0.4)" strokeWidth="2" strokeDasharray="4 4" />
            <circle r="22" fill="none" stroke="rgba(0,242,254,0.6)" strokeWidth="2.5" />
            
            {/* Eye core */}
            <circle r="9" fill="#050B14" stroke="#D50000" strokeWidth="3" className="animate-ping opacity-60" />
            <circle r="6" fill="#D50000" />

            {/* Approach Vector Arrow to Puri (dx: -260, dy: -60) */}
            <line x1="0" y1="0" x2="-240" y2="-65" stroke="#FF4D4D" strokeWidth="2.5" strokeDasharray="6 4" />
            <polygon points="-240,-65 -225,-60 -230,-75" fill="#FF4D4D" />

            <text x="14" y="5" fill="#FF4D4D" fontSize="12" fontWeight="bold" fontFamily="monospace">
              MOCHA Eye (944 hPa)
            </text>
            <text x="14" y="20" fill="#00F2FE" fontSize="9" fontFamily="monospace">
              Speed: 18 km/h NW
            </text>
          </g>

          {/* District Spatial Boundary Outlines & Labels */}
          {/* Puri District Zone */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectDistrictById("od-puri")}
          >
            <circle 
              cx="410" 
              cy="500" 
              r={selectedDistrict?.id === "od-puri" ? "42" : "32"} 
              fill={selectedDistrict?.id === "od-puri" ? "rgba(213,0,0,0.28)" : "rgba(213,0,0,0.12)"}
              stroke="#D50000" 
              strokeWidth={selectedDistrict?.id === "od-puri" ? "3" : "1.5"}
              strokeDasharray="4 3"
            />
            <text x="385" y="475" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
              PURI (GROUND ZERO)
            </text>
            <text x="385" y="490" fill="#FF5E36" fontSize="9" fontFamily="monospace">
              Peak: 210 km/h • Surge +3.4m
            </text>
          </g>

          {/* Jagatsinghpur (Paradip) District Zone */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectDistrictById("od-jagatsinghpur")}
          >
            <circle 
              cx="610" 
              cy="430" 
              r={selectedDistrict?.id === "od-jagatsinghpur" ? "38" : "28"}
              fill={selectedDistrict?.id === "od-jagatsinghpur" ? "rgba(213,0,0,0.28)" : "rgba(213,0,0,0.12)"}
              stroke="#D50000" 
              strokeWidth={selectedDistrict?.id === "od-jagatsinghpur" ? "3" : "1.5"}
              strokeDasharray="4 3"
            />
            <text x="585" y="405" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              PARADIP PORT
            </text>
            <text x="585" y="418" fill="#FF9100" fontSize="9" fontFamily="monospace">
              Peak: 195 km/h • Surge +3.1m
            </text>
          </g>

          {/* Kendrapara District Zone */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectDistrictById("od-kendrapara")}
          >
            <circle 
              cx="570" 
              cy="340" 
              r={selectedDistrict?.id === "od-kendrapara" ? "35" : "25"}
              fill={selectedDistrict?.id === "od-kendrapara" ? "rgba(255,145,0,0.25)" : "rgba(255,145,0,0.08)"}
              stroke="#FF9100" 
              strokeWidth={selectedDistrict?.id === "od-kendrapara" ? "2.5" : "1.2"}
              strokeDasharray="4 3"
            />
            <text x="540" y="325" fill="#CBD5E1" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
              KENDRAPARA
            </text>
          </g>

          {/* Balasore District Zone */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectDistrictById("od-balasore")}
          >
            <circle 
              cx="700" 
              cy="210" 
              r={selectedDistrict?.id === "od-balasore" ? "32" : "22"}
              fill="rgba(0,242,254,0.08)" 
              stroke="#00F2FE" 
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            <text x="670" y="195" fill="#CBD5E1" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
              BALASORE (CHANDIPUR)
            </text>
          </g>

          {/* Purba Medinipur (Digha) Zone */}
          <g 
            className="cursor-pointer group"
            onClick={() => onSelectDistrictById("wb-purba-medinipur")}
          >
            <circle 
              cx="790" 
              cy="160" 
              r={selectedDistrict?.id === "wb-purba-medinipur" ? "36" : "26"}
              fill={selectedDistrict?.id === "wb-purba-medinipur" ? "rgba(213,0,0,0.28)" : "rgba(213,0,0,0.12)"}
              stroke="#D50000" 
              strokeWidth={selectedDistrict?.id === "wb-purba-medinipur" ? "3" : "1.5"}
              strokeDasharray="4 3"
            />
            <text x="760" y="145" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
              DIGHA (WB)
            </text>
          </g>

          {/* Highway Lines on Canvas */}
          {visibleLayers.highway && (
            <>
              {/* NH-316 Puri -> Inland Corridor */}
              <path
                d="M 400 500 Q 340 460 260 410"
                fill="none"
                stroke="#FF9100"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 4"
              />
              <text x="300" y="445" fill="#FF9100" fontSize="9" fontWeight="bold" fontFamily="monospace">
                NH-316 (WATCH 0.3m)
              </text>

              {/* SH-12 Paradip Arterial (Flooded) */}
              <path
                d="M 610 430 Q 520 420 440 380"
                fill="none"
                stroke="#D50000"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text x="500" y="415" fill="#FF4D4D" fontSize="9" fontWeight="bold" fontFamily="monospace">
                SH-12 (FLOODED 0.8m)
              </text>

              {/* NH-16 Main Inland Evacuation Artery (Dry corridor) */}
              <path
                d="M 260 410 Q 480 300 700 200"
                fill="none"
                stroke="#00E676"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <text x="460" y="280" fill="#00E676" fontSize="9" fontWeight="bold" fontFamily="monospace">
                NH-16 EXPRESSWAY (DRY EVAC ARTERY)
              </text>
            </>
          )}

          {/* Interactive Infrastructure Node Pins */}
          {displayedNodes.map((node) => {
            const cx = node.mapX * 10;
            const cy = node.mapY * 6.5;
            const isHovered = activeNode?.id === node.id;
            const isTargetDistrict = selectedDistrict?.id === node.districtId;

            // Pin styling based on infrastructure type
            let pinColor = "#00F2FE";
            let pinBg = "rgba(0, 242, 254, 0.2)";
            if (node.type === "hospital") {
              pinColor = "#EF4444";
              pinBg = "rgba(239, 68, 68, 0.3)";
            } else if (node.type === "shelter") {
              pinColor = "#10E7A2";
              pinBg = "rgba(16, 231, 162, 0.3)";
            } else if (node.type === "substation") {
              pinColor = "#F59E0B";
              pinBg = "rgba(245, 158, 11, 0.3)";
            } else if (node.type === "highway") {
              pinColor = node.status === "critical" ? "#DC2626" : "#22D3EE";
              pinBg = "rgba(34, 211, 238, 0.3)";
            }

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform"
                onClick={() => {
                  setActiveNode(node);
                  onSelectDistrictById(node.districtId);
                }}
                onMouseEnter={() => setActiveNode(node)}
              >
                {/* Halo for target district */}
                {isTargetDistrict && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 18 : 14}
                    fill={pinBg}
                    stroke={pinColor}
                    strokeWidth="1.5"
                    className="animate-pulse"
                  />
                )}

                {/* Core Pin Dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 8 : 6}
                  fill={pinColor}
                  stroke="#050B14"
                  strokeWidth="2"
                />

                {/* Tiny Icon representation in SVG */}
                <text
                  x={cx + 9}
                  y={cy + 4}
                  fill="#FFFFFF"
                  fontSize="8.5"
                  fontFamily="monospace"
                  fontWeight="bold"
                  opacity={isHovered || isTargetDistrict ? 1 : 0.8}
                >
                  {node.name.length > 22 ? `${node.name.slice(0, 20)}...` : node.name}
                </text>
              </g>
            );
          })}

        </svg>

        {/* Compass Rose Widget in Bottom Right */}
        <div className="absolute bottom-3 right-3 p-2 rounded-lg bg-[#050B14]/85 border border-[#1E3252] backdrop-blur-md flex flex-col items-center pointer-events-none">
          <Compass className="w-5 h-5 text-[#00F2FE]" />
          <span className="text-[9px] font-mono font-bold text-white mt-0.5">N</span>
          <span className="text-[7px] font-mono text-slate-400">Bay of Bengal</span>
        </div>

        {/* Legend Overlay Card in Top Left */}
        <div className="absolute top-3 left-3 p-2.5 rounded-lg bg-[#050B14]/90 border border-[#1E3252] backdrop-blur-md max-w-[210px] text-[10px] font-mono space-y-1 hidden sm:block pointer-events-none">
          <div className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
            <Info className="w-3 h-3 text-[#00F2FE]" />
            <span>Map Symbology</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>Hospital (Flood Risk)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
            <span>Shelter (Elevated Ramp)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span>33kV Substation (Cutoff)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-0.5 bg-emerald-400 shrink-0" />
            <span>Dry Evacuation Corridor</span>
          </div>
        </div>

        {/* Selected Node Tactical Popover HUD */}
        {activeNode && (
          <div className="absolute top-3 right-3 sm:right-16 z-20 w-72 sm:w-80 p-3.5 rounded-xl bg-[#0F1B2F]/95 border border-[#00F2FE]/40 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.8)] text-xs animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-2 border-b border-slate-700/60 pb-2 mb-2">
              <div className="flex items-center gap-2">
                {activeNode.type === "hospital" && <Hospital className="w-4 h-4 text-red-400" />}
                {activeNode.type === "shelter" && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                {activeNode.type === "substation" && <Zap className="w-4 h-4 text-amber-400" />}
                {activeNode.type === "highway" && <Milestone className="w-4 h-4 text-cyan-400" />}
                <div>
                  <div className="font-bold text-white font-rajdhani text-sm leading-tight">
                    {activeNode.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {activeNode.districtName} District
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Spec Attributes */}
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between items-center text-slate-300">
                <span className="text-slate-400">Flood Inundation Risk:</span>
                <span className={`font-bold ${activeNode.floodRiskM > 1.5 ? "text-red-400" : "text-emerald-400"}`}>
                  +{activeNode.floodRiskM}m above plinth
                </span>
              </div>

              {activeNode.generatorHealth && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Emergency Generator:</span>
                  <span className="font-bold text-emerald-300">
                    {activeNode.generatorHealth}
                  </span>
                </div>
              )}

              {activeNode.shelterCapacity && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Shelter Capacity:</span>
                  <span className="font-bold text-white">
                    {activeNode.shelterOccupants} / {activeNode.shelterCapacity} beds
                  </span>
                </div>
              )}

              {activeNode.rampStatus && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Ramp Access:</span>
                  <span className="font-bold text-[#00F2FE]">
                    {activeNode.rampStatus}
                  </span>
                </div>
              )}

              {activeNode.voltageTier && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Grid Node:</span>
                  <span className="font-bold text-amber-300">
                    {activeNode.voltageTier} ({activeNode.shutdownStatus})
                  </span>
                </div>
              )}

              {activeNode.highwayCondition && (
                <div className="flex justify-between items-center text-slate-300">
                  <span className="text-slate-400">Roadway Status:</span>
                  <span className={`font-bold ${activeNode.status === "critical" ? "text-red-400" : "text-emerald-400"}`}>
                    {activeNode.highwayCondition}
                  </span>
                </div>
              )}

              {activeNode.detourRoute && (
                <div className="pt-1 text-[10px] text-cyan-300/90 border-t border-slate-800">
                  <strong className="text-white">Evac Detour:</strong> {activeNode.detourRoute}
                </div>
              )}
            </div>

            {/* Quick Action Button */}
            {selectedDistrict && (
              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Target: {selectedDistrict.name}
                </span>
                <button
                  onClick={() => onOpenEvacModal(selectedDistrict)}
                  className="px-2.5 py-1 rounded bg-red-600/30 hover:bg-red-600/50 border border-red-500 text-red-200 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                >
                  Trigger Evac
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Info Strip */}
      <div className="px-3 py-2 bg-[#0F1B2F]/90 border-t border-[rgba(0,242,254,0.12)] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Telemetry Source: INCOIS Storm Surge Hydrodynamic Model & IMD High-Resolution WRF</span>
        </div>
        <div className="text-slate-300">
          Grid: 19.8°N, 85.8°E • Datum: WGS84
        </div>
      </div>
    </div>
  );
}
