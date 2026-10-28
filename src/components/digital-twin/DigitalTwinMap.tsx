"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { 
  Maximize2, 
  Minimize2, 
  Plus, 
  Minus, 
  Ruler, 
  TrendingDown, 
  Crosshair, 
  Building2, 
  Shield, 
  Zap, 
  Route, 
  Anchor, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  Compass,
  Layers,
  MapPin,
  Waves
} from "lucide-react";
import { 
  DistrictInfo, 
  StormContext, 
  InfrastructurePOI, 
  ViewMode3D, 
  SurgeContourLevel, 
  InfrastructureType 
} from "./types";
import { 
  CRITICAL_INFRASTRUCTURE, 
  calculatePoiStatus, 
  CONTOUR_TIERS_CONFIG,
  COASTAL_CONTOUR_POLYGONS
} from "./digitalTwinData";

interface DigitalTwinMapProps {
  district: DistrictInfo;
  storm: StormContext;
  surgeLevel: number;
  currentHour: number;
  viewMode: ViewMode3D;
  visibleContours: Record<SurgeContourLevel, boolean>;
  contourOpacity: number;
  visibleLayers: Record<InfrastructureType, boolean>;
  selectedPoi: InfrastructurePOI | null;
  onSelectPoi: (poi: InfrastructurePOI | null) => void;
  onOpenTransectModal: () => void;
}

// MapLibre base raster tile configuration
function buildBaseMapStyle(isSatellite: boolean): any {
  if (isSatellite) {
    return {
      version: 8,
      sources: {
        "satellite-tiles": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          ],
          tileSize: 256,
          attribution: "© Esri World Imagery"
        }
      },
      layers: [
        {
          id: "satellite-layer",
          type: "raster",
          source: "satellite-tiles",
          paint: {
            "raster-opacity": 0.85,
            "raster-contrast": 0.15,
          }
        }
      ]
    };
  }

  // Dark Oceanic Basemap (CartoDB Dark Matter / Oceanic Dark)
  return {
    version: 8,
    sources: {
      "carto-dark": {
        type: "raster",
        tiles: [
          "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
          "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
        ],
        tileSize: 256,
        attribution: "© CARTO, OpenStreetMap contributors"
      }
    },
    layers: [
      {
        id: "carto-dark-layer",
        type: "raster",
        source: "carto-dark",
        paint: {
          "raster-opacity": 0.9,
          "raster-contrast": 0.25,
        }
      }
    ]
  };
}

export function DigitalTwinMap({
  district,
  storm,
  surgeLevel,
  currentHour,
  viewMode,
  visibleContours,
  contourOpacity,
  visibleLayers,
  selectedPoi,
  onSelectPoi,
  onOpenTransectModal,
}: DigitalTwinMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapTick, setMapTick] = useState(0);

  const [cursorGeo, setCursorGeo] = useState<{ lng: number; lat: number; elevation: number }>({
    lng: district.center[0],
    lat: district.center[1],
    elevation: 1.8,
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Ruler Tool State
  const [isRulerActive, setIsRulerActive] = useState(false);
  const [rulerPoints, setRulerPoints] = useState<Array<{ lng: number; lat: number }>>([]);

  // Time progression multiplier (peak surge at T+28h)
  const timeFactor = Math.max(0.15, 1 - Math.abs(currentHour - 28) / 36);
  const effectiveSurge = +(surgeLevel * timeFactor).toFixed(2);

  // Filter infrastructure for this district and selected layers
  const filteredPois = useMemo(() => {
    return CRITICAL_INFRASTRUCTURE.filter(
      (p) => p.districtId === district.id && visibleLayers[p.type]
    );
  }, [district.id, visibleLayers]);

  // Project geographic coordinates [lng, lat] to container screen coordinates { x, y }
  const projectPoint = useCallback((lng: number, lat: number): { x: number; y: number } | null => {
    const map = mapInstanceRef.current;
    if (!map) return null;
    try {
      const p = map.project([lng, lat]);
      return { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 };
    } catch {
      return null;
    }
  }, []);

  // Helper to convert an array of [lng, lat] to an SVG polygon path string
  const coordsToSvgPath = useCallback((coords: [number, number][]): string => {
    if (!coords || coords.length === 0) return "";
    let d = "";
    coords.forEach((c, idx) => {
      const pt = projectPoint(c[0], c[1]);
      if (!pt) return;
      d += `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y} `;
    });
    return d.length > 0 ? `${d}Z` : "";
  }, [projectPoint]);

  // Initialize MapLibre GL map
  useEffect(() => {
    let map: any = null;
    let isCancelled = false;

    async function initMap() {
      if (!mapContainerRef.current) return;

      try {
        const maplibreglMod: any = await import("maplibre-gl");
        const maplibregl = maplibreglMod.default || maplibreglMod;

        if (isCancelled) return;

        map = new maplibregl.Map({
          container: mapContainerRef.current,
          style: buildBaseMapStyle(viewMode === "satellite"),
          center: district.center,
          zoom: district.zoom,
          pitch: viewMode === "3d" ? 60 : 0,
          bearing: viewMode === "3d" ? -18 : 0,
          maxPitch: 82,
          attributionControl: false,
        });

        map.on("load", () => {
          if (!isCancelled) {
            mapInstanceRef.current = map;
            setMapLoaded(true);
            setMapTick((t) => t + 1);
          }
        });

        map.on("move", () => {
          setMapTick((t) => t + 1);
        });

        map.on("mousemove", (e: any) => {
          const lng = +e.lngLat.lng.toFixed(4);
          const lat = +e.lngLat.lat.toFixed(4);

          // Estimate DEM elevation based on distance from Bay of Bengal coastline (roughly southeast)
          const distFromShore = Math.max(0, (lng - 85.80) * 0.45 + (lat - 19.78) * 0.55);
          const elevation = +(distFromShore * 12.0 - 1.4).toFixed(1);

          setCursorGeo({ lng, lat, elevation });
        });

        map.on("click", (e: any) => {
          if (isRulerActive) {
            const pt = { lng: +e.lngLat.lng.toFixed(4), lat: +e.lngLat.lat.toFixed(4) };
            setRulerPoints((prev) => (prev.length >= 2 ? [pt] : [...prev, pt]));
          }
        });
      } catch (err) {
        console.warn("MapLibre GL initialization notice:", err);
      }
    }

    initMap();

    return () => {
      isCancelled = true;
      if (map) {
        try {
          map.remove();
        } catch {}
      }
      mapInstanceRef.current = null;
    };
  }, []);

  // Sync viewMode changes (2D Flat vs. 3D Oblique vs. Satellite)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    if (viewMode === "3d") {
      map.easeTo({
        pitch: 60,
        bearing: -18,
        duration: 900,
      });
    } else if (viewMode === "2d") {
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 700,
      });
    }

    // Update style if switching to/from satellite
    try {
      map.setStyle(buildBaseMapStyle(viewMode === "satellite"));
    } catch {}
  }, [viewMode, mapLoaded]);

  // Sync district change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;

    map.flyTo({
      center: district.center,
      zoom: district.zoom,
      pitch: viewMode === "3d" ? 60 : 0,
      bearing: viewMode === "3d" ? -18 : 0,
      duration: 1200,
      essential: true,
    });
  }, [district, mapLoaded]);

  // Center on Landfall Target
  const handleCenterOnLandfall = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.flyTo({
      center: [85.83, 19.81],
      zoom: 11.2,
      pitch: viewMode === "3d" ? 60 : 0,
      bearing: -20,
      duration: 1200,
      essential: true,
    });
  };

  // Zoom controls
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };
  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Calculate Haversine distance between ruler points
  const calculateDistanceKm = () => {
    if (rulerPoints.length < 2) return null;
    const [p1, p2] = rulerPoints;
    const R = 6371; // km
    const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
    const dLon = ((p2.lng - p1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((p1.lat * Math.PI) / 180) *
        Math.cos((p2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return +(R * c).toFixed(2);
  };

  const measuredKm = calculateDistanceKm();

  // Projected Landfall Target Screen Coordinates
  const landfallScreenPt = projectPoint(85.83, 19.81);

  return (
    <div
      ref={containerRef}
      id="inundation-map-canvas"
      className="relative flex-1 w-full h-full min-h-[480px] bg-[#050B14] overflow-hidden select-none"
    >
      {/* 1. Underlying MapLibre GL WebGL Canvas Container */}
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-grab active:cursor-grabbing"
      />

      {/* 2. Overlaid Synchronized SVG Hydrodynamic & Contour Layer */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        key={mapTick}
      >
        <defs>
          <filter id="twinCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="twinRedGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Bathymetric Surge Inundation Contour Polygons */}
        {/* Tier 1: 0.5m Cyan Contour */}
        {visibleContours[0.5] && effectiveSurge >= 0.5 && (
          <path
            d={coordsToSvgPath(COASTAL_CONTOUR_POLYGONS["0.5"])}
            fill="#22D3EE"
            fillOpacity={contourOpacity * 0.45}
            stroke="#22D3EE"
            strokeWidth="2"
            filter="url(#twinCyanGlow)"
          />
        )}

        {/* Tier 2: 1.5m Amber Contour */}
        {visibleContours[1.5] && effectiveSurge >= 1.5 && (
          <path
            d={coordsToSvgPath(COASTAL_CONTOUR_POLYGONS["1.5"])}
            fill="#F59E0B"
            fillOpacity={contourOpacity * 0.5}
            stroke="#F59E0B"
            strokeWidth="2.2"
          />
        )}

        {/* Tier 3: 3.0m Red Contour */}
        {visibleContours[3.0] && effectiveSurge >= 2.8 && (
          <path
            d={coordsToSvgPath(COASTAL_CONTOUR_POLYGONS["3.0"])}
            fill="#EF4444"
            fillOpacity={contourOpacity * 0.55}
            stroke="#EF4444"
            strokeWidth="2.5"
            filter="url(#twinRedGlow)"
          />
        )}

        {/* Tier 4: 4.5m+ Magenta Contour */}
        {visibleContours[4.5] && effectiveSurge >= 4.0 && (
          <path
            d={coordsToSvgPath(COASTAL_CONTOUR_POLYGONS["4.5"])}
            fill="#D946EF"
            fillOpacity={contourOpacity * 0.6}
            stroke="#D946EF"
            strokeWidth="2.8"
          />
        )}

        {/* Landfall Target Crosshair */}
        {landfallScreenPt && (
          <g transform={`translate(${landfallScreenPt.x}, ${landfallScreenPt.y})`}>
            <circle
              r="24"
              fill="none"
              stroke="#FF5E36"
              strokeWidth="2"
              strokeDasharray="4 4"
              className="animate-spin"
              style={{ animationDuration: "10s" }}
            />
            <circle r="10" fill="#FF5E36" fillOpacity="0.3" stroke="#FF5E36" strokeWidth="2" />
            <circle r="3.5" fill="#FFFFFF" />
            <line x1="-30" y1="0" x2="30" y2="0" stroke="#FF5E36" strokeWidth="1.5" />
            <line x1="0" y1="-30" x2="0" y2="30" stroke="#FF5E36" strokeWidth="1.5" />
            <rect x="34" y="-11" width="160" height="22" rx="4" fill="#0F1B2F" stroke="#FF5E36" strokeWidth="1" />
            <text x="42" y="4" fill="#FFFFFF" fontSize="9.5" fontFamily="Rajdhani" fontWeight="bold">
              LANDFALL TARGET (T+28h)
            </text>
          </g>
        )}

        {/* Ruler Measurement Line & Label */}
        {rulerPoints.length === 2 && (() => {
          const pt1 = projectPoint(rulerPoints[0].lng, rulerPoints[0].lat);
          const pt2 = projectPoint(rulerPoints[1].lng, rulerPoints[1].lat);
          if (!pt1 || !pt2) return null;

          return (
            <g>
              <line
                x1={pt1.x}
                y1={pt1.y}
                x2={pt2.x}
                y2={pt2.y}
                stroke="#00F2FE"
                strokeWidth="2.5"
                strokeDasharray="6 3"
              />
              <circle cx={pt1.x} cy={pt1.y} r="5" fill="#00F2FE" />
              <circle cx={pt2.x} cy={pt2.y} r="5" fill="#00F2FE" />
              {measuredKm && (
                <g transform={`translate(${(pt1.x + pt2.x) / 2}, ${(pt1.y + pt2.y) / 2 - 12})`}>
                  <rect x="-35" y="-12" width="70" height="20" rx="4" fill="#0F1B2F" stroke="#00F2FE" strokeWidth="1" />
                  <text x="0" y="2" fill="#00F2FE" fontSize="10" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">
                    {measuredKm} km
                  </text>
                </g>
              )}
            </g>
          );
        })()}
      </svg>

      {/* 3. HTML Infrastructure Marker Pins Positioned over Map Coordinates */}
      <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
        {filteredPois.map((poi) => {
          const pt = projectPoint(poi.coordinates[0], poi.coordinates[1]);
          if (!pt) return null;

          const { floodDepth, status } = calculatePoiStatus(poi, effectiveSurge);
          const isSelected = selectedPoi?.id === poi.id;

          const pinColor =
            status === "flooded" || status === "critical"
              ? "#EF4444"
              : status === "warning"
              ? "#F59E0B"
              : "#10E7A2";

          return (
            <div
              key={poi.id}
              onClick={(e) => {
                e.stopPropagation();
                onSelectPoi(poi);
              }}
              style={{
                transform: `translate(${pt.x}px, ${pt.y}px)`,
                left: 0,
                top: 0,
              }}
              className="absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            >
              {/* Pulsing ring for flooded/critical assets */}
              {(status === "critical" || status === "flooded") && (
                <div className="absolute -inset-2 rounded-full border border-[#EF4444] animate-ping opacity-75" />
              )}

              {/* Pin Pill Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform group-hover:scale-125 border shadow-lg ${
                  isSelected
                    ? "bg-[#0F1B2F] border-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.6)]"
                    : "bg-[#0F1B2F] border-slate-700"
                }`}
                style={{ borderColor: isSelected ? "#00F2FE" : pinColor }}
              >
                {poi.type === "hospital" && <Building2 className="w-3.5 h-3.5 text-[#EF4444]" />}
                {poi.type === "shelter" && <Shield className="w-3.5 h-3.5 text-[#10E7A2]" />}
                {poi.type === "substation" && <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />}
                {poi.type === "highway" && <Route className="w-3.5 h-3.5 text-[#00F2FE]" />}
                {(poi.type === "port" || poi.type === "cluster") && <Anchor className="w-3.5 h-3.5 text-[#93C5FD]" />}
              </div>

              {/* Hover Tooltip Label */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
                <div className="px-2 py-1 rounded-md bg-[#0F1B2F]/95 border border-[#00F2FE]/40 text-white shadow-xl text-[10px] font-rajdhani font-bold flex items-center gap-1.5">
                  <span>{poi.name}</span>
                  <span className={floodDepth > 0 ? "text-[#EF4444]" : "text-[#10E7A2]"}>
                    {floodDepth > 0 ? `+${floodDepth}m` : "DRY"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Top-Right Map Toolbox Bar */}
      <div className="absolute top-4 right-4 z-25 flex items-center gap-1.5 p-1 rounded-xl bg-[#0F1B2F]/90 backdrop-blur-md border border-[#00F2FE]/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        
        {/* Orthodromic Distance Ruler */}
        <button
          onClick={() => {
            setIsRulerActive(!isRulerActive);
            setRulerPoints([]);
          }}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isRulerActive
              ? "bg-[#00F2FE] text-[#050B14]"
              : "text-slate-300 hover:text-[#00F2FE] hover:bg-[#00F2FE]/10"
          }`}
          title={isRulerActive ? "Click 2 points on map to measure" : "Activate Orthodromic Distance Ruler"}
        >
          <Ruler className="w-4 h-4" />
        </button>

        {/* Elevation Transect Tool */}
        <button
          onClick={onOpenTransectModal}
          className="p-2 rounded-lg text-slate-300 hover:text-[#00F2FE] hover:bg-[#00F2FE]/10 transition-colors cursor-pointer"
          title="Open Coastal Elevation Cross-Section Transect"
        >
          <TrendingDown className="w-4 h-4" />
        </button>

        {/* Center on Landfall */}
        <button
          onClick={handleCenterOnLandfall}
          className="p-2 rounded-lg text-slate-300 hover:text-[#FF5E36] hover:bg-[#FF5E36]/10 transition-colors cursor-pointer"
          title="Center Camera on Projected Landfall Sector"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-[#1E3A5F] mx-0.5" />

        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#00F2FE]/10 transition-colors cursor-pointer"
          title="Zoom In"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#00F2FE]/10 transition-colors cursor-pointer"
          title="Zoom Out"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-[#00F2FE]/10 transition-colors cursor-pointer"
          title="Toggle Fullscreen EOC Mode"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 5. Bottom-Left Live Cursor Tracker HUD */}
      <div className="absolute bottom-4 left-4 z-25 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0F1B2F]/90 backdrop-blur-md border border-[#00F2FE]/25 shadow-lg text-[10px] font-jetbrains text-slate-300">
        <div className="flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span>CURSOR:</span>
          <span className="text-white font-bold">{cursorGeo.lat}°N, {cursorGeo.lng}°E</span>
        </div>
        <div className="w-[1px] h-3.5 bg-[#1E3A5F]" />
        <div>
          <span>GROUND: </span>
          <span className={cursorGeo.elevation < effectiveSurge ? "text-[#EF4444] font-bold" : "text-[#10E7A2] font-bold"}>
            {cursorGeo.elevation > 0 ? `+${cursorGeo.elevation}m` : `${cursorGeo.elevation}m`} MSL
          </span>
        </div>
        <div className="w-[1px] h-3.5 bg-[#1E3A5F]" />
        <div>
          <span>SURGE: </span>
          <span className="text-[#00F2FE] font-bold">+{effectiveSurge}m AAT</span>
        </div>
      </div>

      {/* 6. Active Ruler Readout Banner if Measuring */}
      {isRulerActive && (
        <div className="absolute top-4 left-4 z-25 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00F2FE]/15 border border-[#00F2FE] text-white text-xs font-rajdhani font-bold shadow-[0_0_15px_rgba(0,242,254,0.3)] animate-in fade-in">
          <Ruler className="w-4 h-4 text-[#00F2FE]" />
          <span>
            {rulerPoints.length === 0 && "CLICK 1ST POINT ON MAP TO START MEASUREMENT"}
            {rulerPoints.length === 1 && "CLICK 2ND POINT TO COMPLETE DISTANCE"}
            {rulerPoints.length === 2 && `MEASURED ORTHODROMIC DISTANCE: ${measuredKm} KM`}
          </span>
          <button
            onClick={() => {
              setIsRulerActive(false);
              setRulerPoints([]);
            }}
            className="ml-2 hover:text-[#FF5E36] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 7. Selected POI Inspection Card */}
      {selectedPoi && (
        <div className="absolute bottom-16 right-4 sm:right-6 z-35 w-72 sm:w-80 rounded-2xl bg-[#0F1B2F]/95 backdrop-blur-2xl border border-[#00F2FE]/40 p-4 shadow-[0_10px_35px_rgba(0,0,0,0.8)] text-white animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 border-b border-[#1E3A5F] pb-2">
            <div className="flex items-center gap-2">
              {selectedPoi.type === "hospital" && <Building2 className="w-4 h-4 text-[#EF4444]" />}
              {selectedPoi.type === "shelter" && <Shield className="w-4 h-4 text-[#10E7A2]" />}
              {selectedPoi.type === "substation" && <Zap className="w-4 h-4 text-[#F59E0B]" />}
              {selectedPoi.type === "highway" && <Route className="w-4 h-4 text-[#00F2FE]" />}
              {(selectedPoi.type === "port" || selectedPoi.type === "cluster") && <Anchor className="w-4 h-4 text-[#93C5FD]" />}
              <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-white">
                {selectedPoi.name}
              </span>
            </div>
            <button
              onClick={() => onSelectPoi(null)}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          {(() => {
            const { floodDepth, status } = calculatePoiStatus(selectedPoi, effectiveSurge);
            return (
              <div className="flex flex-col gap-2 mt-2.5">
                <div className="grid grid-cols-2 gap-2 text-[10px] font-jetbrains">
                  <div className="p-2 rounded-lg bg-[#050B14]">
                    <span className="text-slate-500 block">BASE MSL:</span>
                    <span className="text-white font-bold">+{selectedPoi.elevationMsl}m</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#050B14]">
                    <span className="text-slate-500 block">FLOOD DEPTH:</span>
                    <span className={floodDepth > 0 ? "text-[#EF4444] font-bold" : "text-[#10E7A2] font-bold"}>
                      {floodDepth > 0 ? `+${floodDepth}m` : "DRY SAFE"}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] font-rajdhani text-slate-300">
                  <strong className="text-[#00F2FE]">RECOMMENDED ACTION: </strong>
                  {selectedPoi.actionRecommendation}
                </div>

                {selectedPoi.details.nearestShelter && (
                  <div className="text-[10px] font-jetbrains text-slate-400">
                    Nearest Shelter: <span className="text-[#10E7A2]">{selectedPoi.details.nearestShelter}</span>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* 8. Compass Rose Decorator */}
      <div className="absolute top-4 left-4 z-20 hidden md:flex flex-col items-center pointer-events-none opacity-40">
        <span className="text-[10px] font-orbitron font-bold text-[#00F2FE]">N</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-[#00F2FE] to-transparent" />
      </div>

    </div>
  );
}
