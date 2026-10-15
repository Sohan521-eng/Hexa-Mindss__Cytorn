"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Hospital, 
  ShieldCheck, 
  Zap, 
  Milestone, 
  Maximize2, 
  Minimize2, 
  Info, 
  Layers, 
  ChevronRight,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import Noise from "@/components/ui/Noise";
import { 
  InfrastructureNode, 
  InfrastructureType, 
  SurgeContourLevel, 
  DistrictVulnerability 
} from "./types";
import { CRITICAL_INFRASTRUCTURE_NODES } from "./alertsData";
import { useGsapPill, PillButton } from "@/components/forecast/ForecastTopBar";

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
  const mapViewportRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Map Zoom & Pan State (Atomic unified state for mouse scroll wheel & drag)
  const [viewState, setViewState] = useState({
    zoom: 1,
    panX: 0,
    panY: 0,
  });
  const viewStateRef = useRef(viewState);
  viewStateRef.current = viewState;
  const { zoom, panX, panY } = viewState;

  const [isDragging, setIsDragging] = useState(false);
  const hasMovedRef = useRef(false);
  const dragStartRef = useRef({
    clientX: 0,
    clientY: 0,
    panX: 0,
    panY: 0,
  });

  const symbologyPill = useGsapPill(isLegendOpen);
  const fullscreenPill = useGsapPill(isFullscreen);

  // Atomic focal point zoom function
  const zoomAtPoint = useCallback((zoomDelta: number, clientX?: number, clientY?: number) => {
    const current = viewStateRef.current;
    // zoomDelta > 0 means zoom in, < 0 means zoom out
    const factor = zoomDelta > 0 ? 1.18 : 0.85;
    const nextZoom = Math.min(Math.max(current.zoom * factor, 0.75), 6.0);
    if (Math.abs(nextZoom - current.zoom) < 0.001) return;

    const viewport = mapViewportRef.current;
    if (!viewport || clientX === undefined || clientY === undefined) {
      setViewState((prev) => ({
        ...prev,
        zoom: nextZoom,
      }));
      return;
    }

    const rect = viewport.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    // Viewport center on screen
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Mouse pixel offset from center
    const mousePixelOffsetX = clientX - centerX;
    const mousePixelOffsetY = clientY - centerY;

    // SVG canvas scale factor (preserveAspectRatio="xMidYMid slice" on 1000x650)
    const svgScale = Math.max(rect.width / 1000, rect.height / 650);
    const mouseSvgOffsetX = mousePixelOffsetX / svgScale;
    const mouseSvgOffsetY = mousePixelOffsetY / svgScale;

    // Scale ratio k = nextZoom / current.zoom
    const k = nextZoom / current.zoom;

    // Focal point preservation formula: ensures the exact point under the mouse cursor remains stationary
    const nextPanX = current.panX - (k - 1) * (mouseSvgOffsetX - current.panX);
    const nextPanY = current.panY - (k - 1) * (mouseSvgOffsetY - current.panY);

    const maxPanX = 1800 * nextZoom;
    const maxPanY = 1200 * nextZoom;

    setViewState({
      zoom: nextZoom,
      panX: Math.min(Math.max(nextPanX, -maxPanX), maxPanX),
      panY: Math.min(Math.max(nextPanY, -maxPanY), maxPanY),
    });
  }, []);

  // Non-passive wheel event listener to zoom in and out with mouse scroll
  useEffect(() => {
    const viewport = mapViewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent) => {
      // Prevent browser page from scrolling while zooming map
      e.preventDefault();
      (e as any).__handledByMap = true;

      // Allow natural scrolling inside the legend card if hovered
      const target = e.target as HTMLElement | null;
      if (target?.closest(".symbology-legend-card")) return;

      const zoomDelta = e.deltaY < 0 ? 1 : -1;
      zoomAtPoint(zoomDelta, e.clientX, e.clientY);
    };

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, [zoomAtPoint]);

  // Global mouseup listener to release dragging if cursor leaves viewport
  useEffect(() => {
    if (!isDragging) return;
    const onWindowMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", onWindowMouseUp);
    return () => window.removeEventListener("mouseup", onWindowMouseUp);
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, .symbology-legend-card")) return;

    hasMovedRef.current = false;
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      panX: viewStateRef.current.panX,
      panY: viewStateRef.current.panY,
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const viewport = mapViewportRef.current;
    if (!viewport) return;
    const rect = viewport.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const dxPixels = e.clientX - dragStartRef.current.clientX;
    const dyPixels = e.clientY - dragStartRef.current.clientY;

    if (Math.hypot(dxPixels, dyPixels) > 4) {
      hasMovedRef.current = true;
    }

    const svgScale = Math.max(rect.width / 1000, rect.height / 650);
    const dxSvg = dxPixels / svgScale;
    const dySvg = dyPixels / svgScale;

    const currentZoom = viewStateRef.current.zoom;
    const maxPanX = 1800 * currentZoom;
    const maxPanY = 1200 * currentZoom;

    setViewState((prev) => ({
      ...prev,
      panX: Math.min(Math.max(dragStartRef.current.panX + dxSvg, -maxPanX), maxPanX),
      panY: Math.min(Math.max(dragStartRef.current.panY + dySvg, -maxPanY), maxPanY),
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setViewState({ zoom: 1, panX: 0, panY: 0 });
  };

  const handleZoomIn = () => {
    zoomAtPoint(1);
  };

  const handleZoomOut = () => {
    zoomAtPoint(-1);
  };

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

  const displayedNodes = CRITICAL_INFRASTRUCTURE_NODES.filter(
    (node) => visibleLayers[node.type]
  );

  return (
    <div 
      ref={containerRef}
      id="coastal-inundation-canvas"
      className={`relative flex flex-col rounded-xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none bg-[#050B14] p-0" : "h-full min-h-[500px] lg:min-h-[560px]"
      }`}
      style={{
        background: "#0F1B2F",
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.15)",
      }}
    >
      {/* Noise Film Grain Texture — matches other pages */}
      <Noise patternSize={250} patternScaleX={1.2} patternScaleY={1.2} patternRefreshInterval={2} patternAlpha={12} />

      {/* ─── Top Header & Controls Portion (with Dedicated Noise Background) ─── */}
      <div className="relative overflow-hidden bg-[#0A1220]/95 border-b border-[rgba(0,242,254,0.18)] shrink-0">
        {/* Dedicated React Bits Noise Grain Texture */}
        <Noise 
          patternSize={250} 
          patternScaleX={1.2} 
          patternScaleY={1.2} 
          patternRefreshInterval={2} 
          patternAlpha={16} 
        />

        {/* Top Header & Layer Toggles Bar */}
        <div className="relative z-10 p-3 sm:p-4 border-b border-[rgba(0,242,254,0.12)] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-wide flex items-center gap-2">
              <span className="heading-gradient-shadow-wrapper">
                <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                  Coastal Flooding & Storm Surge Map
                </span>
              </span>
            </h3>
            <p className="text-xs text-[#00F2FE] font-medium font-sans [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              Predicted flood water levels and essential emergency services at risk
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Legend Toggle Button (Matching StateSelectorPill without click glow) */}
            <PillButton
              btnRef={symbologyPill.btnRef}
              circleRef={symbologyPill.circleRef}
              handleEnter={symbologyPill.handleEnter}
              handleLeave={symbologyPill.handleLeave}
              open={false}
              onClick={() => setIsLegendOpen(!isLegendOpen)}
              icon={<Info style={{ width: 14, height: 14 }} className="text-[#00F2FE]" />}
              label="SYMBOLOGY"
              style={{
                height: "38px",
                borderRadius: "0.75rem",
                border: "1.5px solid rgba(0,242,254,0.65)",
                background: "rgba(0,242,254,0.08)",
                boxShadow: "0 4px 16px -2px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.2)",
                padding: "0 14px",
                fontSize: "12px",
                outline: "none",
              }}
            />

            {/* Fullscreen Button (Matching StateSelectorPill without click glow) */}
            <PillButton
              btnRef={fullscreenPill.btnRef}
              circleRef={fullscreenPill.circleRef}
              handleEnter={fullscreenPill.handleEnter}
              handleLeave={fullscreenPill.handleLeave}
              open={false}
              onClick={handleToggleFullscreen}
              icon={isFullscreen ? <Minimize2 style={{ width: 14, height: 14 }} className="text-[#00F2FE]" /> : <Maximize2 style={{ width: 14, height: 14 }} className="text-[#00F2FE]" />}
              label={isFullscreen ? "EXIT FULLSCREEN" : "FULLSCREEN"}
              style={{
                height: "38px",
                borderRadius: "0.75rem",
                border: "1.5px solid rgba(0,242,254,0.65)",
                background: "rgba(0,242,254,0.08)",
                boxShadow: "0 4px 16px -2px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.2)",
                padding: "0 14px",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Control Strip: Contours & Critical Infrastructure Filters */}
        <div className="relative z-10 px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          {/* Surge Height Contours Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00F2FE] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] shrink-0">
              Surge Contours:
            </span>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
              {/* 0.5m Wash */}
              <button
                type="button"
                onClick={() => handleToggleContour(0.5)}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer ${
                  visibleContours[0.5]
                    ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                }`}
              >
                0.5m Wash
              </button>

              {/* 1.5m Road */}
              <button
                type="button"
                onClick={() => handleToggleContour(1.5)}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer ${
                  visibleContours[1.5]
                    ? "bg-[#FF9100]/15 border border-[#FF9100]/70 text-[#FF9100] shadow-[0_0_8px_rgba(255,145,0,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#FF9100]/15 border border-[#1E3252] hover:border-[#FF9100]/60 text-[#8E9EB5] hover:text-[#FF9100]"
                }`}
              >
                1.5m Road
              </button>

              {/* 3.0m Threat */}
              <button
                type="button"
                onClick={() => handleToggleContour(3.0)}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer ${
                  visibleContours[3.0]
                    ? "bg-[#D50000]/15 border border-[#D50000]/70 text-[#FF4D4D] shadow-[0_0_8px_rgba(213,0,0,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#D50000]/15 border border-[#1E3252] hover:border-[#D50000]/60 text-[#8E9EB5] hover:text-[#FF4D4D]"
                }`}
              >
                3.0m Threat
              </button>

              {/* 5.0m Extreme */}
              <button
                type="button"
                onClick={() => handleToggleContour(5.0)}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer ${
                  visibleContours[5.0]
                    ? "bg-[#E040FB]/15 border border-[#E040FB]/70 text-[#E040FB] shadow-[0_0_8px_rgba(224,64,251,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#E040FB]/15 border border-[#1E3252] hover:border-[#E040FB]/60 text-[#8E9EB5] hover:text-[#E040FB]"
                }`}
              >
                5.0m Extreme
              </button>
            </div>
          </div>

          {/* Infrastructure Layer Filter Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00F2FE] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] shrink-0">
              Overlays:
            </span>

            <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
              {/* Hospitals */}
              <button
                type="button"
                onClick={() => handleToggleLayer("hospital")}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  visibleLayers.hospital
                    ? "bg-[#D50000]/15 border border-[#D50000]/70 text-[#FF4D4D] shadow-[0_0_8px_rgba(213,0,0,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#D50000]/15 border border-[#1E3252] hover:border-[#D50000]/60 text-[#8E9EB5] hover:text-[#FF4D4D]"
                }`}
              >
                <Hospital className="w-3.5 h-3.5 shrink-0" />
                <span>Hospitals</span>
              </button>

              {/* Shelters */}
              <button
                type="button"
                onClick={() => handleToggleLayer("shelter")}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  visibleLayers.shelter
                    ? "bg-[#00E676]/15 border border-[#00E676]/70 text-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#00E676]/15 border border-[#1E3252] hover:border-[#00E676]/60 text-[#8E9EB5] hover:text-[#00E676]"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Shelters</span>
              </button>

              {/* Substations */}
              <button
                type="button"
                onClick={() => handleToggleLayer("substation")}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  visibleLayers.substation
                    ? "bg-[#FF9100]/15 border border-[#FF9100]/70 text-[#FF9100] shadow-[0_0_8px_rgba(255,145,0,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#FF9100]/15 border border-[#1E3252] hover:border-[#FF9100]/60 text-[#8E9EB5] hover:text-[#FF9100]"
                }`}
              >
                <Zap className="w-3.5 h-3.5 shrink-0" />
                <span>Substations</span>
              </button>

              {/* Corridors */}
              <button
                type="button"
                onClick={() => handleToggleLayer("highway")}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  visibleLayers.highway
                    ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.15)]"
                    : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                }`}
              >
                <Milestone className="w-3.5 h-3.5 shrink-0" />
                <span>Corridors</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Interactive Map Viewport (Edge-to-Edge with Scroll Zoom & Drag Pan) */}
      <div 
        ref={mapViewportRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={(e) => {
          if ((e.nativeEvent as any).__handledByMap) return;
          const target = e.target as HTMLElement | null;
          if (target?.closest(".symbology-legend-card")) return;
          const zoomDelta = e.deltaY < 0 ? 1 : -1;
          zoomAtPoint(zoomDelta, e.clientX, e.clientY);
        }}
        className={`relative flex-1 w-full bg-[#03070E] overflow-hidden select-none min-h-[380px] lg:min-h-[460px] ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* SVG Geospatial Canvas */}
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full object-cover"
          preserveAspectRatio="xMidYMid slice"
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

          {/* Master Zoom & Pan Transform Group */}
          <g
            transform={`translate(${500 + panX}, ${325 + panY}) scale(${zoom}) translate(-500, -325)`}
          >
            {/* Deep Bay Ocean Base (Seamless Extended Coverage) */}
            <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#bayOceanGrad)" />

            {/* Radar Bathymetry Grid (Seamless Extended Coverage) */}
            <rect x="-2000" y="-2000" width="5000" height="5000" fill="url(#radarGrid)" />

            {/* Coastal Landmass (Odisha & West Bengal shoreline polygon - Extended) */}
            <path
              d="
                M -2000 -2000
                L 2000 -2000
                L 1000 50
                C 920 70, 850 110, 780 140
                C 720 165, 660 195, 640 245
                C 630 305, 635 365, 590 405
                C 530 455, 450 468, 390 488
                C 330 520, 270 560, 230 650
                C 190 730, 150 820, 100 2000
                L -2000 2000
                Z
              "
              fill="url(#coastalLandGrad)"
              stroke="#1E3E34"
              strokeWidth="2"
            />

            {/* Shoreline Foam Glow */}
            <path
              d="
                M 1000 50
                C 920 70, 850 110, 780 140
                C 720 165, 660 195, 640 245
                C 630 305, 635 365, 590 405
                C 530 455, 450 468, 390 488
                C 330 520, 270 560, 230 650
                C 190 730, 150 820, 100 2000
              "
              fill="none"
              stroke="#10E7A2"
              strokeWidth="2"
              strokeOpacity="0.45"
            />

            {/* 4 Surge Inundation Extent Contours */}
            {/* Contour 0.5m: Lowland tidal wash */}
            {visibleContours[0.5] && (
              <path
                d="
                  M 250 650
                  C 290 575, 350 535, 410 500
                  C 470 480, 550 468, 610 418
                  C 655 378, 650 318, 660 258
                  C 680 208, 740 178, 800 150
                  C 870 120, 920 100, 1000 70
                "
                fill="none"
                stroke="#00F2FE"
                strokeWidth="2.5"
                strokeOpacity="0.8"
                strokeDasharray="4 2"
              />
            )}

            {/* Contour 1.5m: Critical roadway cutoff */}
            {visibleContours[1.5] && (
              <path
                d="
                  M 240 650
                  C 280 568, 340 528, 400 494
                  C 460 474, 540 461, 600 411
                  C 645 371, 640 311, 650 251
                  C 670 201, 730 171, 790 144
                  C 860 114, 910  94, 1000 64
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

            {/* Active Surge Inundation Plume */}
            <polygon
              points="390,488 470,470 630,425 610,415 570,392 410,498"
              fill="url(#surgeWaveGrad3m)"
              className="animate-pulse"
            />

            {/* Cyclone MOCHA Eye Center & Approach Vector */}
            <g transform="translate(680, 510)">
              <circle r="60" fill="none" stroke="rgba(213,0,0,0.3)" strokeWidth="1.5" strokeDasharray="6 6" />
              <circle r="40" fill="none" stroke="rgba(255,145,0,0.4)" strokeWidth="2" strokeDasharray="4 4" />
              <circle r="22" fill="none" stroke="rgba(0,242,254,0.6)" strokeWidth="2.5" />
              
              <circle r="9" fill="#050B14" stroke="#D50000" strokeWidth="3" className="animate-ping opacity-60" />
              <circle r="6" fill="#D50000" />

              <line x1="0" y1="0" x2="-240" y2="-65" stroke="#FF4D4D" strokeWidth="2.5" strokeDasharray="6 4" />
              <polygon points="-240,-65 -225,-60 -230,-75" fill="#FF4D4D" />

              <text x="14" y="5" fill="#FF4D4D" fontSize="12" fontWeight="bold" fontFamily="monospace">
                MOCHA Eye (944 hPa)
              </text>
              <text x="14" y="20" fill="#00F2FE" fontSize="9" fontFamily="monospace">
                Approach: 18 km/h NW
              </text>
            </g>

            {/* District Spatial Boundary Outlines & Labels */}
            {/* Puri District Zone */}
            <g 
              className="cursor-pointer group"
              onClick={() => {
                if (hasMovedRef.current) return;
                onSelectDistrictById("od-puri");
              }}
            >
              <circle 
                cx="410" 
                cy="500" 
                r={selectedDistrict?.id === "od-puri" ? "42" : "32"} 
                fill={selectedDistrict?.id === "od-puri" ? "rgba(213,0,0,0.3)" : "rgba(213,0,0,0.12)"}
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
              onClick={() => {
                if (hasMovedRef.current) return;
                onSelectDistrictById("od-jagatsinghpur");
              }}
            >
              <circle 
                cx="590" 
                cy="410" 
                r={selectedDistrict?.id === "od-jagatsinghpur" ? "40" : "30"} 
                fill={selectedDistrict?.id === "od-jagatsinghpur" ? "rgba(213,0,0,0.3)" : "rgba(213,0,0,0.12)"}
                stroke="#D50000" 
                strokeWidth={selectedDistrict?.id === "od-jagatsinghpur" ? "3" : "1.5"}
                strokeDasharray="4 3"
              />
              <text x="560" y="388" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
                PARADIP PORT
              </text>
              <text x="560" y="402" fill="#FF9100" fontSize="9" fontFamily="monospace">
                Peak: 195 km/h • Surge +3.1m
              </text>
            </g>

            {/* Kendrapara District Zone */}
            <g 
              className="cursor-pointer group"
              onClick={() => {
                if (hasMovedRef.current) return;
                onSelectDistrictById("od-kendrapara");
              }}
            >
              <circle 
                cx="635" 
                cy="310" 
                r={selectedDistrict?.id === "od-kendrapara" ? "36" : "26"} 
                fill={selectedDistrict?.id === "od-kendrapara" ? "rgba(255,145,0,0.3)" : "rgba(255,145,0,0.12)"}
                stroke="#FF9100" 
                strokeWidth={selectedDistrict?.id === "od-kendrapara" ? "2.5" : "1.2"}
              />
              <text x="615" y="290" fill="#E2E8F0" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                KENDRAPARA
              </text>
            </g>

            {/* Balasore District Zone */}
            <g 
              className="cursor-pointer group"
              onClick={() => {
                if (hasMovedRef.current) return;
                onSelectDistrictById("od-balasore");
              }}
            >
              <circle 
                cx="760" 
                cy="150" 
                r={selectedDistrict?.id === "od-balasore" ? "34" : "24"} 
                fill={selectedDistrict?.id === "od-balasore" ? "rgba(255,214,0,0.3)" : "rgba(255,214,0,0.1)"}
                stroke="#FFD600" 
                strokeWidth={selectedDistrict?.id === "od-balasore" ? "2.5" : "1.2"}
              />
              <text x="735" y="135" fill="#E2E8F0" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                BALASORE (Chandipur)
              </text>
            </g>

            {/* Critical Infrastructure Interactive Node Pins */}
            {displayedNodes.map((node) => {
              const isHovered = activeNode?.id === node.id;
              const posX = (node.mapX / 100) * 1000;
              const posY = (node.mapY / 100) * 650;
              return (
                <g
                  key={node.id}
                  transform={`translate(${posX}, ${posY})`}
                  className="cursor-pointer group"
                  onClick={() => {
                    if (hasMovedRef.current) return;
                    setActiveNode(node);
                  }}
                >
                  {/* Ping wave for critical flood exposure */}
                  {node.status === "critical" && (
                    <circle r="14" fill="none" stroke="#D50000" strokeWidth="1.5" className="animate-ping opacity-60" />
                  )}

                  {/* Node Outer Circle */}
                  <circle
                    r={isHovered ? "11" : "8"}
                    fill={
                      node.type === "hospital"
                        ? "#D50000"
                        : node.type === "shelter"
                        ? "#00E676"
                        : node.type === "substation"
                        ? "#FF9100"
                        : "#00F2FE"
                    }
                    stroke="#FFFFFF"
                    strokeWidth={isHovered ? "2.5" : "1.5"}
                    className="transition-all duration-200"
                  />

                  {/* Inner status dot */}
                  <circle r="3.5" fill="#050B14" />

                  {/* Node Label on Hover or Critical */}
                  {(isHovered || node.status === "critical") && (
                    <text
                      x="12"
                      y="4"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      className="drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
                    >
                      {node.name}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Interactive Floating Zoom & Navigation Controls HUD */}
        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 p-1 rounded-xl bg-[#050B14]/90 border border-[rgba(0,242,254,0.35)] backdrop-blur-xl shadow-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg bg-[#0F1B2F] hover:bg-[#00F2FE]/20 border border-[rgba(0,242,254,0.25)] hover:border-[#00F2FE] text-[#00F2FE] flex items-center justify-center transition-colors cursor-pointer text-sm font-bold font-mono"
            title="Zoom In (or Mouse Scroll Up)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="h-7 px-2 rounded-lg bg-[#0F1B2F] hover:bg-[#00F2FE]/20 border border-[rgba(0,242,254,0.25)] hover:border-[#00F2FE] text-[#00F2FE] flex items-center gap-1 justify-center transition-colors cursor-pointer text-[10px] font-mono font-bold"
            title="Reset Map Zoom & Pan"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{Math.round(zoom * 100)}%</span>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg bg-[#0F1B2F] hover:bg-[#00F2FE]/20 border border-[rgba(0,242,254,0.25)] hover:border-[#00F2FE] text-[#00F2FE] flex items-center justify-center transition-colors cursor-pointer text-sm font-bold font-mono"
            title="Zoom Out (or Mouse Scroll Down)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>



        {/* Floating Expandable Symbology Card */}
        {isLegendOpen && (
          <div className="symbology-legend-card absolute top-3 left-3 w-80 sm:w-[350px] max-h-[calc(100%-24px)] flex flex-col rounded-2xl bg-[#050B14]/95 border border-[rgba(0,242,254,0.35)] backdrop-blur-2xl shadow-[0_16px_48px_rgba(0,0,0,0.85)] z-30 overflow-hidden animate-in fade-in zoom-in-95">
            {/* Background Noise Effect */}
            <Noise
              patternSize={250}
              patternScaleX={1.2}
              patternScaleY={1.2}
              patternRefreshInterval={2}
              patternAlpha={15}
            />

            {/* Header */}
            <div className="relative z-10 px-3.5 py-3 border-b border-[rgba(0,242,254,0.2)] bg-[#07111F]/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center shrink-0">
                  <Info className="w-3.5 h-3.5 text-[#00F2FE]" />
                </div>
                <div>
                  <div className="font-bold text-white font-rajdhani text-sm uppercase tracking-wider leading-none">
                    Map Symbology & Legend
                  </div>
                  <div className="text-[10px] font-mono text-[#00F2FE] leading-tight mt-0.5">
                    Visual indicators & operational meanings
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsLegendOpen(false)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer text-xs"
                title="Close Symbology Legend"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div 
              className="relative z-10 p-3.5 space-y-4 overflow-y-auto text-[11px] font-mono"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,242,254,0.35) transparent"
              }}
            >
              {/* 1. Critical Infrastructure Section */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                  Critical Infrastructure Pins
                </div>

                {/* Hospital */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#D50000] border border-white flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(213,0,0,0.5)]">
                    <span className="w-1 h-1 rounded-full bg-[#050B14]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span>Hospital (Flood Risk)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-500/40">CRITICAL</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Emergency medical facilities exposed to saltwater inundation; ICU generator standby.
                    </p>
                  </div>
                </div>

                {/* Cyclone Shelter */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#00E676] border border-white flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(0,230,118,0.5)]">
                    <span className="w-1 h-1 rounded-full bg-[#050B14]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span>Cyclone Shelter (Active)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">SAFE HAVEN</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Elevated reinforced concrete shelter with designated capacity & relief supply stocks.
                    </p>
                  </div>
                </div>

                {/* 33kV Substation */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#FF9100] border border-white flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(255,145,0,0.5)]">
                    <span className="w-1 h-1 rounded-full bg-[#050B14]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span>Power Substation (Cutoff Risk)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40">GRID CUTOFF</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      33kV/132kV transmission switchyard facing precautionary shutdown to prevent electrocution.
                    </p>
                  </div>
                </div>

                {/* Evacuation Corridor */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full bg-[#00F2FE] border border-white flex items-center justify-center shrink-0 shadow-[0_0_8px_rgba(0,242,254,0.5)]">
                    <span className="w-1 h-1 rounded-full bg-[#050B14]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span>Evacuation Corridor (Highway)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/40">ARTERIAL</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Designated national/state transit highways (NH-16 / NH-316) for vehicular evacuation.
                    </p>
                  </div>
                </div>

                {/* Active Inundation Alarm Ping */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 relative flex h-4 w-4 items-center justify-center shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600 border border-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span>Critical Inundation Alarm</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-500/40">PULSING</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Active flood alert indicating water level currently breaching site safety limits.
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Surge Inundation Contours Section */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                  Surge Inundation Contours
                </div>

                {/* 5.0m Extreme */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-6 h-0 border-t-2 border-dashed border-[#E040FB] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span className="text-fuchsia-300">5.0m Extreme Surge Contour</span>
                      <span className="text-[9px] font-mono text-fuchsia-400">PURPLE</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Maximum saltwater reach during high-tide peak; severe deep-inland breach.
                    </p>
                  </div>
                </div>

                {/* 3.0m Threat */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-6 h-1 bg-[#D50000] rounded shrink-0 shadow-[0_0_6px_rgba(213,0,0,0.6)]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span className="text-red-300">3.0m Threat Level (Ground Zero)</span>
                      <span className="text-[9px] font-mono text-red-400">RED SOLID</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Structural flooding zone; ground floors submerged with catastrophic wall damages.
                    </p>
                  </div>
                </div>

                {/* 1.5m Roadway */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-6 h-0.5 bg-[#FF9100] rounded shrink-0 shadow-[0_0_6px_rgba(255,145,0,0.6)]" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span className="text-amber-300">1.5m Roadway Cutoff Line</span>
                      <span className="text-[9px] font-mono text-amber-400">ORANGE SOLID</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Road impassability threshold; vehicle exhaust submerged and transit blocked.
                    </p>
                  </div>
                </div>

                {/* 0.5m Tidal Wash */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-6 h-0 border-t-2 border-dashed border-[#00F2FE] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span className="text-cyan-300">0.5m Tidal Wash Extent</span>
                      <span className="text-[9px] font-mono text-cyan-400">CYAN DASHED</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Lowland sea wash line; coastal mudflats, estuaries and salt pan overtopping.
                    </p>
                  </div>
                </div>

                {/* Active Surge Plume */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-6 h-3 rounded bg-gradient-to-r from-red-600/60 to-purple-600/40 border border-red-500/50 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span className="text-rose-300">Active Surge Inundation Plume</span>
                      <span className="text-[9px] font-mono text-rose-400">LIVE PLUME</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Live animated hydrodynamic plume modeling current surging saltwater front.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Storm Center & Threat Sectors */}
              <div className="space-y-2.5">
                <div className="text-[10px] font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5 pb-1 border-b border-slate-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                  Storm Dynamics & Threat Sectors
                </div>

                {/* MOCHA Eye */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-5 h-5 rounded-full border border-red-500/40 flex items-center justify-center shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full border border-amber-500/50 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D50000]" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span className="text-red-400">Cyclone Eye Center (944 hPa)</span>
                      <span className="text-[9px] font-mono text-red-400">EYEWALL</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Low-pressure eye vortex ringed by destructive eyewall winds (up to 210 km/h).
                    </p>
                  </div>
                </div>

                {/* Track Vector */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-1 flex items-center w-6 shrink-0">
                    <span className="w-4 h-0 border-t-2 border-dashed border-[#FF4D4D]" />
                    <span className="text-[#FF4D4D] text-[10px] -ml-1">▶</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span className="text-red-300">Projected Approach Track</span>
                      <span className="text-[9px] font-mono text-cyan-400">18 km/h NW</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      AI and radar track vector forecasting movement direction toward landfall.
                    </p>
                  </div>
                </div>

                {/* Ground Zero District */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-dashed border-[#D50000] bg-red-950/40 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span>Ground Zero Sector (Puri / Paradip)</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-950/70 text-red-300 border border-red-500/40">LANDFALL</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Primary landfall sector facing maximum sustained winds & surge exceeding 3.0m.
                    </p>
                  </div>
                </div>

                {/* Secondary Threat Sector */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-4 h-4 rounded-full border-2 border-[#FFD600] bg-amber-950/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span>Secondary Warning Sector</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-500/40">HIGH RISK</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Flanking coastal districts under storm force squalls and moderate tidal inundation.
                    </p>
                  </div>
                </div>

                {/* Shoreline */}
                <div className="flex items-start gap-2.5">
                  <div className="mt-1.5 w-6 h-0.5 bg-[#10E7A2] shadow-[0_0_6px_#10E7A2] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-xs leading-tight font-rajdhani flex items-center justify-between">
                      <span className="text-emerald-300">Mean High-Water Shoreline</span>
                      <span className="text-[9px] font-mono text-emerald-400">COAST</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-sans leading-snug mt-0.5">
                      Baseline coastal boundary demarcating landmass from the Bay of Bengal ocean.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Node Tactical Popover HUD */}
        {activeNode && (
          <div className="absolute top-3 right-3 sm:right-14 z-30 w-72 sm:w-80 p-3.5 rounded-2xl bg-[#0F1B2F]/95 border border-[#00F2FE]/40 backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.9)] text-xs animate-in fade-in zoom-in-95">
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
            </div>

            {/* Evacuation CTA */}
            {selectedDistrict && (
              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Sector: {selectedDistrict.name}
                </span>
                <button
                  onClick={() => onOpenEvacModal(selectedDistrict)}
                  className="px-2.5 py-1 rounded-lg bg-red-600/30 hover:bg-red-600/50 border border-red-500 text-red-200 text-[10px] font-mono font-bold transition-colors cursor-pointer"
                >
                  Order Evacuation
                </button>
              </div>
            )}
          </div>
        )}

      </div>


    </div>
  );
}
