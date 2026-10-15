"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  RotateCcw, 
  Sliders, 
  Eye, 
  Layers, 
  Gauge, 
  MapPin, 
  AlertTriangle,
  Compass,
  Wind,
  Maximize2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { BenchmarkStormInfo, StormReplayFrame } from "./types";
import Noise from "@/components/ui/Noise";
import ElasticSlider from "@/components/ui/ElasticSlider";
import { ShinyBadge } from "@/components/ui/ShinyBadge";

interface HistoricalReplaySandboxProps {
  storm: BenchmarkStormInfo;
  frameIndex?: number;
  onFrameChange?: (idx: number) => void;
}

// Haversine geodesic distance in kilometers
function computeHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function HistoricalReplaySandbox({ 
  storm,
  frameIndex,
  onFrameChange,
}: HistoricalReplaySandboxProps) {
  const [internalFrameIdx, setInternalFrameIdx] = useState<number>(0);
  const currentFrameIdx = frameIndex !== undefined ? frameIndex : internalFrameIdx;

  const setFrame = (idx: number) => {
    if (onFrameChange) {
      onFrameChange(idx);
    } else {
      setInternalFrameIdx(idx);
    }
  };

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(2); // 1x, 2x, 4x, 8x
  const [isLooping, setIsLooping] = useState<boolean>(true);

  // Layer Visibility Toggles
  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(true);
  const [showAiPrediction, setShowAiPrediction] = useState<boolean>(true);
  const [showErrorVectors, setShowErrorVectors] = useState<boolean>(true);
  const [showEyewallSwath, setShowEyewallSwath] = useState<boolean>(true);

  const frames = storm.frames;
  const currentFrame: StormReplayFrame = frames[currentFrameIdx] || frames[0];

  const currentFrameIdxRef = useRef(currentFrameIdx);
  currentFrameIdxRef.current = currentFrameIdx;

  // Real MapLibre Earth Satellite Map Integration
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState<boolean>(false);
  const [mapTick, setMapTick] = useState<number>(0);

  // Initialize MapLibre GL with real satellite imagery and zoomed-in bounding box
  useEffect(() => {
    let isMounted = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any = null;

    async function initMap() {
      if (!mapContainerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const maplibreglMod: any = await import("maplibre-gl");
      const maplibregl = maplibreglMod.default || maplibreglMod;
      if (!isMounted) return;

      const allLats = storm.frames.flatMap((f) => [f.latObs, f.latPred]);
      const allLons = storm.frames.flatMap((f) => [f.lonObs, f.lonPred]);
      const sMinLat = Math.min(...allLats);
      const sMaxLat = Math.max(...allLats);
      const sMinLon = Math.min(...allLons);
      const sMaxLon = Math.max(...allLons);

      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            "esri-satellite": {
              type: "raster",
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              ],
              tileSize: 256,
              attribution: "© Esri, Earthstar Geographics"
            },
            "esri-reference": {
              type: "raster",
              tiles: [
                "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              ],
              tileSize: 256,
              attribution: "© Esri"
            }
          },
          layers: [
            {
              id: "sat-base",
              type: "raster",
              source: "esri-satellite"
            },
            {
              id: "sat-reference",
              type: "raster",
              source: "esri-reference",
              paint: {
                "raster-opacity": 0.75
              }
            }
          ]
        },
        center: [(sMinLon + sMaxLon) / 2, (sMinLat + sMaxLat) / 2],
        zoom: 6.2,
        minZoom: 3,
        maxZoom: 13,
        pitchWithRotate: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      const handleUpdate = () => {
        if (isMounted) setMapTick((t) => (t + 1) % 10000);
      };

      map.on("load", () => {
        if (!isMounted) return;
        map.fitBounds(
          [[sMinLon, sMinLat], [sMaxLon, sMaxLat]],
          {
            padding: { top: 75, bottom: 65, left: 80, right: 80 },
            maxZoom: 6.8,
            duration: 0,
          }
        );
        setMapReady(true);
        handleUpdate();
      });

      map.on("move", handleUpdate);
      map.on("zoom", handleUpdate);
      map.on("resize", handleUpdate);

      setTimeout(() => {
        if (isMounted) {
          setMapReady(true);
          handleUpdate();
        }
      }, 200);
    }

    initMap();

    return () => {
      isMounted = false;
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [storm.id]);

  // Recenter and zoom to active storm bounds if storm changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const allLats = storm.frames.flatMap((f) => [f.latObs, f.latPred]);
    const allLons = storm.frames.flatMap((f) => [f.lonObs, f.lonPred]);
    map.fitBounds(
      [[Math.min(...allLons), Math.min(...allLats)], [Math.max(...allLons), Math.max(...allLats)]],
      {
        padding: { top: 75, bottom: 65, left: 80, right: 80 },
        maxZoom: 6.8,
        duration: 800,
      }
    );
  }, [storm.id, mapReady]);

  // Fallback math projection before map is ready
  const fallbackProject = useCallback((lat: number, lon: number): [number, number] => {
    const el = mapContainerRef.current;
    const w = el ? el.clientWidth : 800;
    const h = el ? el.clientHeight : 370;
    const paddingX = 70;
    const paddingY = 50;
    const usableW = Math.max(100, w - paddingX * 2);
    const usableH = Math.max(100, h - paddingY * 2);

    const lats = storm.frames.map((f) => f.latObs);
    const lons = storm.frames.map((f) => f.lonObs);
    const minLat = Math.min(...lats) - 1.5;
    const maxLat = Math.max(...lats) + 1.5;
    const minLon = Math.min(...lons) - 2.0;
    const maxLon = Math.max(...lons) + 2.0;

    const x = paddingX + ((lon - minLon) / (maxLon - minLon)) * usableW;
    const y = h - paddingY - ((lat - minLat) / (maxLat - minLat)) * usableH;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  }, [storm.frames]);

  // Project geographic coordinates [lat, lon] to live container screen pixels [x, y]
  const projectCoord = useCallback((lat: number, lon: number): [number, number] => {
    const map = mapInstanceRef.current;
    if (map && mapReady) {
      try {
        const p = map.project([lon, lat]);
        return [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10];
      } catch {
        return fallbackProject(lat, lon);
      }
    }
    return fallbackProject(lat, lon);
  }, [mapReady, mapTick, fallbackProject]);

  // Playback timer loop with smooth interval ref
  useEffect(() => {
    if (!isPlaying) return;

    const baseIntervalMs = 1200;
    const intervalTime = baseIntervalMs / speedMultiplier;

    const interval = setInterval(() => {
      const cur = currentFrameIdxRef.current;
      if (cur < frames.length - 1) {
        setFrame(cur + 1);
      } else if (isLooping) {
        setFrame(0);
      } else {
        setIsPlaying(false);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isPlaying, speedMultiplier, isLooping, frames.length]);

  // Reset frame when storm switches
  useEffect(() => {
    setFrame(0);
    setIsPlaying(false);
  }, [storm.id]);

  // Manual Controls
  const handlePlayPause = () => {
    if (!isPlaying && currentFrameIdx >= frames.length - 1) {
      setFrame(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleStepBack = () => {
    setIsPlaying(false);
    setFrame(Math.max(0, currentFrameIdx - 1));
  };
  const handleStepForward = () => {
    setIsPlaying(false);
    setFrame(Math.min(frames.length - 1, currentFrameIdx + 1));
  };
  const handleReset = () => {
    setIsPlaying(false);
    setFrame(0);
  };

  const lastFrame = frames[frames.length - 1];
  const [landfallX, landfallY] = projectCoord(lastFrame.latObs, lastFrame.lonObs);
  const distToLandfall = computeHaversineKm(currentFrame.latObs, currentFrame.lonObs, lastFrame.latObs, lastFrame.lonObs);
  const isAtLandfall = currentFrameIdx === frames.length - 1;

  // Build SVG path strings for entire history up to current frame
  const groundTruthPath = frames
    .slice(0, currentFrameIdx + 1)
    .map((f, i) => {
      const [x, y] = projectCoord(f.latObs, f.lonObs);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const aiPredictionPath = frames
    .slice(0, currentFrameIdx + 1)
    .map((f, i) => {
      const [x, y] = projectCoord(f.latPred, f.lonPred);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  // Full future ground truth reference (dimmed)
  const fullGroundTruthPath = frames
    .map((f, i) => {
      const [x, y] = projectCoord(f.latObs, f.lonObs);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  const [currObsX, currObsY] = projectCoord(currentFrame.latObs, currentFrame.lonObs);
  const [currPredX, currPredY] = projectCoord(currentFrame.latPred, currentFrame.lonPred);

  // Timeline marker milestones for the scrubber (matching MapLayerCanvas 72-Hr Scrubber style)
  const timelineMarkers = useMemo(() => {
    if (!frames || frames.length === 0) return [];
    const count = frames.length;
    if (count <= 4) {
      return frames.map((f, i) => ({
        index: i,
        label: f.timeLabel,
        isHighlight: f.category.toLowerCase().includes("landfall") || i === count - 1,
      }));
    }
    const indices = [
      0,
      Math.round((count - 1) * 0.25),
      Math.round((count - 1) * 0.5),
      Math.round((count - 1) * 0.75),
      count - 1,
    ];
    const unique = Array.from(new Set(indices));
    return unique.map((idx) => ({
      index: idx,
      label: frames[idx]?.timeLabel || "",
      isHighlight: frames[idx]?.category.toLowerCase().includes("landfall") || idx === count - 1,
    }));
  }, [frames]);

  return (
    <section 
      id="historical-replay-canvas"
      className="relative rounded-2xl overflow-hidden p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.7)] bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.4)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
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

      <div className="relative z-10 flex flex-col justify-between h-full">
        {/* 1. Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(0,242,254,0.14)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold font-orbitron tracking-wide text-[#00F2FE] uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            Historical Benchmark Replay Sandbox
          </h2>
        </div>

        {/* Layer Visibility Segmented Pills (Matches Forecast Horizon Segmented Bar styling) */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] shrink-0">
          {/* Ground Truth Toggle */}
          <button
            type="button"
            onClick={() => setShowGroundTruth((prev) => !prev)}
            title={showGroundTruth ? "Hide Ground Truth Trajectory" : "Show Ground Truth Trajectory"}
            className={`h-7 px-2.5 sm:px-3 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer shrink-0 ${
              showGroundTruth
                ? "bg-[#00E676]/15 border border-[#00E676]/70 text-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.25)]"
                : "bg-[#050B14]/70 hover:bg-[#00E676]/15 border border-[#1E3252] hover:border-[#00E676]/60 text-[#8E9EB5] hover:text-[#00E676]"
            }`}
          >
            <span>● Ground Truth</span>
          </button>

          {/* AI Forecast Toggle */}
          <button
            type="button"
            onClick={() => setShowAiPrediction((prev) => !prev)}
            title={showAiPrediction ? "Hide AI Prediction Trajectory" : "Show AI Prediction Trajectory"}
            className={`h-7 px-2.5 sm:px-3 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer shrink-0 ${
              showAiPrediction
                ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
            }`}
          >
            <span>-- AI Forecast</span>
          </button>

          {/* Error Vectors Toggle */}
          <button
            type="button"
            onClick={() => setShowErrorVectors((prev) => !prev)}
            title={showErrorVectors ? "Hide Error Vectors" : "Show Error Vectors"}
            className={`h-7 px-2.5 sm:px-3 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer shrink-0 ${
              showErrorVectors
                ? "bg-[#FF5E36]/15 border border-[#FF5E36]/70 text-[#FF5E36] shadow-[0_0_8px_rgba(255,94,54,0.25)]"
                : "bg-[#050B14]/70 hover:bg-[#FF5E36]/15 border border-[#1E3252] hover:border-[#FF5E36]/60 text-[#8E9EB5] hover:text-[#FF5E36]"
            }`}
          >
            <span>Δd Vectors</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Geospatial Radar Canvas with Live MapLibre Map */}
      <div 
        className="relative my-2.5 w-full h-[320px] sm:h-[370px] rounded-xl overflow-hidden bg-[#050B14]"
        style={{
          border: "1.5px solid rgba(0, 242, 254, 0.6)",
          boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.8)",
        }}
      >
        {/* Real Earth Satellite & Coastline Map Mount */}
        <div 
          ref={mapContainerRef} 
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" 
        />

        {/* Dark Tactical Vignette for Maximum Contrast */}
        <div className="absolute inset-0 pointer-events-none z-10 shadow-[inset_0_0_80px_rgba(5,11,20,0.85)] bg-[#050B14]/25" />

        {/* Tactical Radar Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none z-10"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.15) 1px, transparent 1px),
              linear-gradient(to right, rgba(0, 242, 254, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 242, 254, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px, 40px 40px, 40px 40px"
          }}
        />

        {/* Interactive Map Controls: Zoom In, Zoom Out, Recenter */}
        <div className="absolute top-3 right-3 z-30 flex flex-col gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-md border border-[rgba(0,242,254,0.35)] shadow-[0_4px_16px_rgba(0,0,0,0.7)]">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            title="Zoom In (+)"
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#00F2FE]/20 rounded transition cursor-pointer"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            title="Zoom Out (-)"
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#00F2FE]/20 rounded transition cursor-pointer"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              const allLats = storm.frames.flatMap((f) => [f.latObs, f.latPred]);
              const allLons = storm.frames.flatMap((f) => [f.lonObs, f.lonPred]);
              mapInstanceRef.current?.fitBounds(
                [[Math.min(...allLons), Math.min(...allLats)], [Math.max(...allLons), Math.max(...allLats)]],
                { padding: { top: 75, bottom: 65, left: 80, right: 80 }, maxZoom: 6.8, duration: 600 }
              );
            }}
            title="Recenter Map on Storm Track"
            className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-[#00F2FE] hover:bg-[#00F2FE]/20 rounded transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top-Left Vector Error Readout Pill */}
        <div className="absolute top-3 left-3 z-30 max-w-[92%] sm:max-w-md">
          <div 
            className="relative overflow-hidden flex flex-col gap-1.5 px-3.5 py-2.5 rounded-xl backdrop-blur-md"
            style={{
              background: "linear-gradient(135deg, rgba(255, 94, 54, 0.36) 0%, rgba(220, 70, 20, 0.24) 50%, rgba(15, 27, 47, 0.94) 100%)",
              border: "1.5px solid rgba(255, 94, 54, 0.75)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.7), 0 0 20px rgba(255, 94, 54, 0.28), inset 0 1px 0 rgba(255, 140, 100, 0.35)",
            }}
          >
            {/* React Bits Noise Background Overlay */}
            <Noise
              patternSize={250}
              patternScaleX={2}
              patternScaleY={2}
              patternRefreshInterval={2}
              patternAlpha={14}
            />

            <div className="relative z-10 flex flex-col gap-1.5">
              {/* Row 1: Plain-English Track Error & Operational Target */}
              <div className="flex items-center justify-between gap-2.5 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                    Track Error (Position Gap):
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-black text-[#FFB300] [text-shadow:0_1px_4px_rgba(0,0,0,0.95)]">
                    {currentFrame.crossTrackErrorKm.toFixed(1)} km
                  </span>
                </div>

                <span className="text-[10px] font-mono font-bold text-[#00E676] bg-[#00E676]/15 px-2 py-0.5 rounded border border-[#00E676]/40 [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                  ✓ Within &lt; 50 km Target
                </span>
              </div>

              {/* Row 2: Plain-English Metrics (Wind, Pressure, Intensity Pattern) */}
              <div className="flex items-center gap-2.5 text-[10px] font-mono text-white/90 pt-1 border-t border-[rgba(255,94,54,0.3)] flex-wrap [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                <span className="flex items-center gap-1">
                  <span className="text-slate-300">Wind Diff:</span>
                  <b className="text-[#FFB300] font-bold">
                    {currentFrame.intensityDeltaKts > 0 ? `+${currentFrame.intensityDeltaKts}` : currentFrame.intensityDeltaKts} kts
                  </b>
                </span>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-300">Pressure Diff:</span>
                  <b className="text-[#00F2FE] font-bold">
                    {currentFrame.pressureDeltaHpa > 0 ? `+${currentFrame.pressureDeltaHpa}` : currentFrame.pressureDeltaHpa} hPa
                  </b>
                </span>
                <span className="text-white/40">•</span>
                <span className="flex items-center gap-1">
                  <span className="text-slate-300">Stage:</span>
                  <b className="text-[#10E7A2] font-bold">
                    {currentFrame.dvorakTNumber} ({currentFrame.dvorakClass})
                  </b>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SVG Trajectory Projections Layer */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none select-none z-20"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="groundTruthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00E676" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10E7A2" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="aiPredGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="1" />
            </linearGradient>

            {/* Radial Eyewall Glow */}
            <radialGradient id="eyewallGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF5E36" stopOpacity="0.65" />
              <stop offset="55%" stopColor="#FFB300" stopOpacity="0.28" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Landfall Target Marker with Real-time Distance Indicator */}
          <g id="landfall-target" transform={`translate(${landfallX}, ${landfallY})`}>
            <circle r="14" fill="none" stroke="#FF5E36" strokeWidth="1" strokeDasharray="3 3" opacity="0.7">
              <animate attributeName="r" values="12;20;12" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle r="8" fill="rgba(255, 94, 54, 0.25)" stroke="#FF5E36" strokeWidth="1.5" />
            <circle r="2.5" fill="#FF5E36" />

            {/* Landfall Callout Tag */}
            <g transform="translate(14, -18)">
              <rect
                x="0"
                y="0"
                width="135"
                height="30"
                rx="5"
                fill="#050B14"
                stroke="#FF5E36"
                strokeWidth="1"
                opacity="0.94"
              />
              <text x="7" y="12" fill="#FF5E36" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                🎯 LANDFALL TARGET
              </text>
              <text x="7" y="24" fill="#E2E8F0" fontSize="8" fontFamily="monospace">
                {isAtLandfall ? "LANDFALL REACHED" : `${distToLandfall} km to impact`}
              </text>
            </g>
          </g>

          {/* Full Future Best-Track (Dotted faint background reference) */}
          <path
            d={fullGroundTruthPath}
            fill="none"
            stroke="#00E676"
            strokeWidth="1.5"
            strokeDasharray="2 4"
            opacity="0.35"
          />

          {/* 1. Ground Truth Best-Track Historical Segment */}
          {showGroundTruth && (
            <g id="layer-ground-truth">
              <path
                d={groundTruthPath}
                fill="none"
                stroke="url(#groundTruthGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_8px_rgba(0,230,118,0.7)]"
              />

              {/* Waypoint Nodes along Ground Truth */}
              {frames.slice(0, currentFrameIdx + 1).map((f, idx) => {
                const [x, y] = projectCoord(f.latObs, f.lonObs);
                const isCurrent = idx === currentFrameIdx;
                return (
                  <circle
                    key={`obs-pt-${idx}`}
                    cx={x}
                    cy={y}
                    r={isCurrent ? 6 : 3.5}
                    fill="#00E676"
                    stroke="#050B14"
                    strokeWidth={isCurrent ? 2 : 1}
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => {
                      setIsPlaying(false);
                      setFrame(idx);
                    }}
                  >
                    <title>{`${f.timeLabel}: ${f.latObs}°N, ${f.lonObs}°E (${f.windObsKts} kts)`}</title>
                  </circle>
                );
              })}
            </g>
          )}

          {/* 2. AI Prediction Historical Segment */}
          {showAiPrediction && (
            <g id="layer-ai-prediction">
              <path
                d={aiPredictionPath}
                fill="none"
                stroke="url(#aiPredGrad)"
                strokeWidth="3"
                strokeDasharray="6 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="filter drop-shadow-[0_0_8px_rgba(0,242,254,0.7)]"
              />

              {/* Waypoint Diamond Nodes along AI Prediction */}
              {frames.slice(0, currentFrameIdx + 1).map((f, idx) => {
                const [x, y] = projectCoord(f.latPred, f.lonPred);
                const isCurrent = idx === currentFrameIdx;
                return (
                  <rect
                    key={`pred-pt-${idx}`}
                    x={x - (isCurrent ? 5 : 3)}
                    y={y - (isCurrent ? 5 : 3)}
                    width={isCurrent ? 10 : 6}
                    height={isCurrent ? 10 : 6}
                    transform={`rotate(45 ${x} ${y})`}
                    fill="#00F2FE"
                    stroke="#050B14"
                    strokeWidth={isCurrent ? 2 : 1}
                    className="cursor-pointer pointer-events-auto"
                    onClick={() => {
                      setIsPlaying(false);
                      setFrame(idx);
                    }}
                  >
                    <title>{`Pred ${f.timeLabel}: ${f.latPred}°N, ${f.lonPred}°E (${f.windPredKts} kts)`}</title>
                  </rect>
                );
              })}
            </g>
          )}

          {/* 3. Error Vectors Connector Line (Cross-Track Deviation) */}
          {showErrorVectors && (
            <g id="layer-error-vector">
              <line
                x1={currObsX}
                y1={currObsY}
                x2={currPredX}
                y2={currPredY}
                stroke="#FF5E36"
                strokeWidth="2.5"
                strokeDasharray="3 3"
                className="filter drop-shadow-[0_0_6px_rgba(255,94,54,0.8)]"
              />
              <circle cx={currObsX} cy={currObsY} r="7" fill="none" stroke="#00E676" strokeWidth="2" />
              <circle cx={currPredX} cy={currPredY} r="7" fill="none" stroke="#00F2FE" strokeWidth="2" />
              
              {currentFrame.crossTrackErrorKm > 8 && (
                <g transform={`translate(${(currObsX + currPredX) / 2 + 10}, ${(currObsY + currPredY) / 2 - 4})`}>
                  <rect x="-3" y="-9" width="54" height="15" rx="3" fill="#0A1424" stroke="#FF5E36" strokeWidth="0.8" opacity="0.92" />
                  <text x="24" y="2" fill="#FFB300" fontSize="8.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                    {currentFrame.crossTrackErrorKm.toFixed(0)} km
                  </text>
                </g>
              )}
            </g>
          )}

          {/* 4. Active Eyewall Convective Swath (Pulsing Radar Rings strictly locked to Eye) */}
          {showEyewallSwath && (
            <g id="layer-eyewall" transform={`translate(${currObsX}, ${currObsY})`}>
              {/* Diffuse convective halo */}
              <circle
                r={Math.max(18, currentFrame.eyewallRadiusKm * 0.75)}
                fill="url(#eyewallGlow)"
              />

              {/* Eyewall rotating dashed perimeter - strictly rotated around its local (0, 0) */}
              <g>
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 0 0"
                  to="360 0 0"
                  dur="10s"
                  repeatCount="indefinite"
                />
                <circle
                  r={Math.max(12, currentFrame.eyewallRadiusKm * 0.45)}
                  fill="none"
                  stroke="#00E676"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  opacity="0.85"
                />
                {/* Spiral arm feeder notch */}
                <circle
                  cx={Math.max(12, currentFrame.eyewallRadiusKm * 0.45)}
                  cy="0"
                  r="2"
                  fill="#FFB300"
                />
              </g>

              {/* Concentric radar pulse waves expanding outward from eye */}
              <circle r="4" fill="#00E676" />
              <circle r="4" fill="none" stroke="#00E676" strokeWidth="1.5">
                <animate attributeName="r" values="4;30" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle r="4" fill="none" stroke="#00F2FE" strokeWidth="1">
                <animate attributeName="r" values="4;46" begin="0.7s" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.75;0" begin="0.7s" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* Landfall Crossing Alert Popup Banner on Canvas */}
          {currentFrame.category.includes("Landfall") && (
            <g transform={`translate(${Math.max(20, currObsX + 15)}, ${Math.max(45, currObsY - 20)})`}>
              <rect x="0" y="0" width="165" height="34" rx="6" fill="#0A1424" stroke="#FF5E36" strokeWidth="1.5" />
              <text x="10" y="15" fill="#FF5E36" fontSize="10" fontWeight="bold" fontFamily="monospace">
                ⚠️ LANDFALL CROSSING
              </text>
              <text x="10" y="27" fill="#E2E8F0" fontSize="9" fontFamily="sans-serif">
                {storm.landfallLocation.split("(")[0]}
              </text>
            </g>
          )}
        </svg>

        {/* Bottom Timeline Overlay Bar */}
        <div 
          className="absolute bottom-2.5 left-3 right-3 z-30 overflow-hidden flex items-center justify-between px-3.5 py-2 rounded-xl backdrop-blur-md"
          style={{
            background: "linear-gradient(135deg, rgba(14, 61, 89, 0.70) 0%, rgba(15, 27, 47, 0.72) 50%, rgba(10, 37, 64, 0.82) 100%)",
            border: "1.5px solid rgba(0, 242, 254, 0.7)",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 242, 254, 0.2), inset 0 1px 0 rgba(0, 242, 254, 0.35)",
          }}
        >
          {/* React Bits Noise Background Overlay */}
          <Noise
            patternSize={250}
            patternScaleX={2}
            patternScaleY={2}
            patternRefreshInterval={2}
            patternAlpha={14}
          />

          <div className="relative z-10 flex items-center justify-between w-full text-[11px] font-mono text-slate-300 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                FRAME {currentFrame.frameIndex + 1}/{frames.length}
              </span>
              <span className="text-white/40">•</span>
              <span className="text-white font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {currentFrame.timeLabel}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[10.5px] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
              <span className="flex items-center gap-1">
                <span className="text-slate-300">Observed:</span>
                <b className="text-[#00E676] font-bold">
                  {currentFrame.windObsKts} kts / {currentFrame.windObsKmh} km/h
                </b>
              </span>
              <span className="text-white/40">•</span>
              <span className="flex items-center gap-1">
                <span className="text-slate-300">Predicted:</span>
                <b className="text-[#00F2FE] font-bold">
                  {currentFrame.windPredKts} kts / {currentFrame.windPredKmh} km/h
                </b>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Replay Control Toolbar */}
      <div className="flex flex-col gap-3 pt-2 border-t border-[rgba(0,242,254,0.12)]">
        
        {/* Timeline Scrubber Slider (Matching 72-Hr Scrubber Styling & Effects) */}
        <div className="flex flex-col gap-1 w-full">
          {/* Scrubber Controls Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2">
              <span className="font-rajdhani text-xs font-bold uppercase tracking-wider text-[#00F2FE] flex items-center gap-1.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                ⏱️ Replay Scrubber
              </span>
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
                  FRAME {currentFrameIdx + 1}/{frames.length}
                </span>
              </ShinyBadge>
            </div>

            <div className="text-[11px] font-mono text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <span>{currentFrame.timestampUtc}</span>
              <span className="text-white/40">•</span>
              <span className={currentFrame.category.toLowerCase().includes("landfall") ? "text-[#FF5E36]" : "text-[#00E676]"}>
                ({currentFrame.category})
              </span>
            </div>
          </div>

          {/* Elastic Timeline Scrubber & Marker Ticks */}
          <div className="relative pt-0.5 pb-4 w-full">
            <ElasticSlider
              value={currentFrameIdx}
              startingValue={0}
              maxValue={frames.length - 1}
              isStepped={true}
              stepSize={1}
              onChange={(newVal) => {
                setIsPlaying(false);
                setFrame(Math.round(newVal));
              }}
              className="w-full"
            />
            <div className="absolute left-0 right-0 -bottom-1 flex justify-between px-1 pointer-events-none">
              {timelineMarkers.map((marker, idx) => (
                <span
                  key={`${marker.label}-${idx}`}
                  className={`font-jetbrains text-[9px] sm:text-[10px] tabular-nums tracking-wider ${
                    marker.isHighlight
                      ? "text-[#FF5E36] font-bold"
                      : "text-[#8E9EB5]"
                  } [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]`}
                >
                  {marker.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Play/Pause & Step Controls */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] shrink-0">
            <button
              type="button"
              onClick={handleReset}
              title="Reset to Frame 1"
              className="h-7 w-7 sm:w-8 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer shrink-0 bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleStepBack}
              title="Step Backward (1 Frame / -30 min)"
              disabled={currentFrameIdx === 0}
              className="h-7 w-7 sm:w-8 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer shrink-0 bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE] disabled:opacity-35 disabled:hover:bg-[#050B14]/70 disabled:hover:border-[#1E3252] disabled:hover:text-[#8E9EB5] disabled:cursor-not-allowed"
            >
              <SkipBack className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handlePlayPause}
              title={isPlaying ? "Pause Simulation" : "Play Sequential Simulation"}
              className={`h-7 px-3 sm:px-3.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 justify-center uppercase tracking-wider transition cursor-pointer shrink-0 ${
                isPlaying 
                  ? "bg-[#FF5E36]/15 border border-[#FF5E36]/70 text-[#FF5E36] shadow-[0_0_8px_rgba(255,94,54,0.25)]" 
                  : "bg-[#00F2FE]/15 hover:bg-[#00F2FE]/25 border border-[#00F2FE]/70 hover:border-[#00F2FE] text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Replay</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleStepForward}
              title="Step Forward (1 Frame / +30 min)"
              disabled={currentFrameIdx === frames.length - 1}
              className="h-7 w-7 sm:w-8 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer shrink-0 bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE] disabled:opacity-35 disabled:hover:bg-[#050B14]/70 disabled:hover:border-[#1E3252] disabled:hover:text-[#8E9EB5] disabled:cursor-not-allowed"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Speed Selector & Loop Toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] shrink-0">
            {/* Speed Multiplier */}
            {[1, 2, 4, 8].map((speed) => (
              <button
                key={`spd-${speed}`}
                type="button"
                onClick={() => setSpeedMultiplier(speed)}
                title={`${speed}x Playback Speed`}
                className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center justify-center transition cursor-pointer shrink-0 ${
                  speedMultiplier === speed
                    ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                    : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                }`}
              >
                <span>{speed}x</span>
              </button>
            ))}

            <div className="w-[1px] h-4 bg-[rgba(0,242,254,0.25)] mx-0.5" />

            {/* Loop Toggle */}
            <button
              type="button"
              onClick={() => setIsLooping(!isLooping)}
              title={isLooping ? "Disable Continuous Loop" : "Enable Continuous Loop"}
              className={`h-7 px-2.5 sm:px-3 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 justify-center transition cursor-pointer shrink-0 ${
                isLooping
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                  : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
              }`}
            >
              <span>Loop</span>
              <span className={`w-1.5 h-1.5 rounded-full ${isLooping ? "bg-[#00F2FE]" : "bg-slate-600"}`} />
            </button>
          </div>

        </div>

      </div>

      </div>

    </section>
  );
}
