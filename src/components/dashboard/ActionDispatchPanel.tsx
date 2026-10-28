"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { 
  TrendingUp, 
  Download, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight 
} from "lucide-react";
import Noise from "@/components/ui/Noise";
import { gsap } from "gsap";

interface DispatchPillProps {
  href?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  iconHover?: React.ReactNode;
  label: string;
  labelHover?: string;
  right?: React.ReactNode;
  rightHover?: React.ReactNode;
  circleColor?: string;
  className?: string;
  ease?: string;
}

function DispatchPill({
  href,
  onClick,
  icon,
  iconHover,
  label,
  labelHover,
  right,
  rightHover,
  circleColor = "#00F2FE",
  className = "",
  ease = "power2.easeOut",
}: DispatchPillProps) {
  const pillRef = useRef<HTMLAnchorElement & HTMLButtonElement>(null);
  const circleRef = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const layout = () => {
      const circle = circleRef.current;
      const pill = pillRef.current;
      if (!circle || !pill) return;

      const rect = pill.getBoundingClientRect();
      const { width: w, height: h } = rect;
      if (w === 0 || h === 0) return;

      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 4;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 2;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;
      circle.style.backgroundColor = circleColor;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`,
      });

      const labelEl = pill.querySelector(".pill-label");
      const whiteEl = pill.querySelector(".pill-label-hover");

      if (labelEl) gsap.set(labelEl, { y: 0 });
      if (whiteEl) gsap.set(whiteEl, { y: h + 12, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.25, xPercent: -50, duration: 1.6, ease, overwrite: "auto" }, 0);
      if (labelEl) {
        tl.to(labelEl, { y: -(h + 8), duration: 1.6, ease, overwrite: "auto" }, 0);
      }
      if (whiteEl) {
        gsap.set(whiteEl, { y: Math.ceil(h + 30), opacity: 0 });
        tl.to(whiteEl, { y: 0, opacity: 1, duration: 1.6, ease, overwrite: "auto" }, 0);
      }

      tlRef.current = tl;
    };

    layout();
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [ease, circleColor, label]);

  const handleEnter = () => {
    tlRef.current?.tweenTo(tlRef.current.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };

  const handleLeave = () => {
    tlRef.current?.tweenTo(0, {
      duration: 0.25,
      ease,
      overwrite: "auto",
    });
  };

  const content = (
    <>
      <span 
        className="hover-circle" 
        ref={circleRef} 
        aria-hidden="true" 
        style={{ backgroundColor: circleColor }}
      />
      <span className="label-stack">
        <span className="pill-label">
          <span className="flex items-center gap-2">
            {icon}
            <span>{label}</span>
          </span>
          {right}
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <span className="flex items-center gap-2">
            {iconHover ?? icon}
            <span className="font-extrabold">{labelHover ?? label}</span>
          </span>
          {rightHover ?? right}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        ref={pillRef}
        href={href}
        className={`dispatch-pill ${className}`}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      ref={pillRef}
      onClick={onClick}
      type="button"
      className={`dispatch-pill ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {content}
    </button>
  );
}

// Client-side file trigger
const triggerDownload = (filename: string, content: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// RFC 7946 Standard GIS FeatureCollection
const buildGeoJson = () => {
  return {
    type: "FeatureCollection",
    generator: "CYCLO-AI Real-Time GIS Telemetry & PINN Ensemble Engine v2.4",
    generatedAt: new Date().toISOString(),
    crs: {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:OGC:1.3:CRS84"
      }
    },
    stormMetadata: {
      stormId: "BOB-02-2026",
      stormName: "CYCLONE ARNAB",
      basin: "Bay of Bengal",
      category: "Category 4 Severe Cyclonic Storm",
      currentLLCC: [88.512, 14.234],
      vmaxKmh: 155,
      vmaxKts: 84,
      centralPressureHpa: 964,
      rmwKm: 28,
      headingDeg: 335,
      translationSpeedKmh: 18,
      status: "Stage 3 Cyclone Warning"
    },
    features: [
      // 1. Current Low-Level Circulation Center (Eye LLCC)
      {
        type: "Feature",
        id: "eye_llcc_live",
        geometry: {
          type: "Point",
          coordinates: [88.512, 14.234]
        },
        properties: {
          layer: "Current_Eye_LLCC",
          name: "Cyclone ARNAB (Eye LLCC)",
          leadTime: "T-0h (LIVE)",
          vmaxKmh: 155,
          vmaxKts: 84,
          pcHpa: 964,
          rmwKm: 28,
          timestamp: new Date().toISOString(),
          sstDegC: 30.4,
          shearKts: 8.5
        }
      },
      // 2. Observed Past Track Polyline (-72h to LIVE)
      {
        type: "Feature",
        id: "observed_past_track",
        geometry: {
          type: "LineString",
          coordinates: [
            [92.15, 8.80],
            [90.80, 10.45],
            [89.65, 12.10],
            [88.95, 13.30],
            [88.512, 14.234]
          ]
        },
        properties: {
          layer: "Observed_Past_Track",
          name: "Past 72-Hour Observed Track",
          startHour: -72,
          endHour: 0,
          color: "#00F2FE",
          strokeWidth: 3
        }
      },
      // 3. Observed Past Waypoints
      ...[
        { hour: -72, lng: 92.15, lat: 8.80, vmax: 55, pc: 1004, cat: "Deep Depression" },
        { hour: -48, lng: 90.80, lat: 10.45, vmax: 85, pc: 994, cat: "Cyclonic Storm" },
        { hour: -24, lng: 89.65, lat: 12.10, vmax: 120, pc: 982, cat: "Severe Cyclonic Storm" },
        { hour: -12, lng: 88.95, lat: 13.30, vmax: 140, pc: 972, cat: "Very Severe Cyclonic Storm" }
      ].map(wp => ({
        type: "Feature",
        id: `observed_wp_${wp.hour}`,
        geometry: {
          type: "Point",
          coordinates: [wp.lng, wp.lat]
        },
        properties: {
          layer: "Observed_Waypoints",
          leadTimeHour: wp.hour,
          vmaxKmh: wp.vmax,
          pcHpa: wp.pc,
          category: wp.cat
        }
      })),
      // 4. PINN 120h AI Forecast Trajectory Polyline
      {
        type: "Feature",
        id: "pinn_forecast_track",
        geometry: {
          type: "LineString",
          coordinates: [
            [88.512, 14.234],
            [88.10, 15.20],
            [87.65, 16.25],
            [86.70, 18.20],
            [85.65, 20.15],
            [84.90, 21.60],
            [84.20, 23.10],
            [83.50, 24.80]
          ]
        },
        properties: {
          layer: "PINN_AI_Forecast_Track",
          name: "120-Hour Physics-Informed Neural Network Forecast",
          peakVmaxKmh: 165,
          color: "#FF5E36",
          strokeWidth: 3,
          strokeDasharray: "4,4"
        }
      },
      // 5. Forecast Waypoints
      ...[
        { hour: 6, lng: 88.10, lat: 15.20, vmax: 160, pc: 960, cat: "Cat 4 Severe" },
        { hour: 12, lng: 87.65, lat: 16.25, vmax: 165, pc: 956, cat: "Cat 4 Peak" },
        { hour: 24, lng: 86.70, lat: 18.20, vmax: 160, pc: 960, cat: "Cat 4 Landfall Approach" },
        { hour: 36, lng: 85.65, lat: 20.15, vmax: 130, pc: 975, cat: "Severe Cyclonic Storm (Inland)" },
        { hour: 48, lng: 84.90, lat: 21.60, vmax: 85, pc: 990, cat: "Cyclonic Storm" },
        { hour: 72, lng: 84.20, lat: 23.10, vmax: 50, pc: 1002, cat: "Depression" },
        { hour: 120, lng: 83.50, lat: 24.80, vmax: 35, pc: 1008, cat: "Well-Marked Low" }
      ].map(wp => ({
        type: "Feature",
        id: `forecast_wp_${wp.hour}`,
        geometry: {
          type: "Point",
          coordinates: [wp.lng, wp.lat]
        },
        properties: {
          layer: "Forecast_Waypoints",
          leadTimeHour: wp.hour,
          vmaxKmh: wp.vmax,
          pcHpa: wp.pc,
          category: wp.cat
        }
      })),
      // 6. 120-Hour Cone of Uncertainty Polygon
      {
        type: "Feature",
        id: "cone_of_uncertainty_120h",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [88.512, 14.234],
            [89.15, 15.60],
            [89.40, 17.10],
            [88.80, 19.40],
            [87.90, 21.80],
            [86.80, 23.90],
            [85.40, 25.60],
            [81.60, 24.20],
            [82.90, 22.40],
            [84.30, 20.20],
            [85.50, 18.00],
            [86.90, 16.00],
            [87.70, 14.80],
            [88.512, 14.234]
          ]]
        },
        properties: {
          layer: "Cone_Of_Uncertainty",
          confidenceLevel: "68% (1-Sigma Ensemble Spread)",
          fillColor: "#00F2FE",
          fillOpacity: 0.18,
          strokeColor: "#00F2FE"
        }
      },
      // 7. Projected Coastal Landfall Point
      {
        type: "Feature",
        id: "landfall_intercept_odisha",
        geometry: {
          type: "Point",
          coordinates: [85.83, 19.81]
        },
        properties: {
          layer: "Coastal_Landfall_Intercept",
          targetLocation: "Puri-Dhamra Coastal Sector, Odisha",
          estimatedLandfallHour: "+28h",
          projectedSurgeMeters: 3.4,
          peakWindsKmh: 165,
          dangerLevel: "Stage 3 Severe Risk"
        }
      },
      // 8. Coastal Doppler Weather Radar (DWR) Stations
      ...[
        { name: "DWR Chennai", lng: 80.25, lat: 13.08, status: "Active Lock" },
        { name: "DWR Machilipatnam", lng: 81.15, lat: 16.18, status: "Active Lock" },
        { name: "DWR Visakhapatnam", lng: 83.30, lat: 17.70, status: "Tracking Core" },
        { name: "DWR Gopalpur", lng: 84.90, lat: 19.26, status: "Tracking Core" },
        { name: "DWR Paradip", lng: 86.60, lat: 20.30, status: "Direct Path Intercept" },
        { name: "DWR Kolkata", lng: 88.35, lat: 22.57, status: "Secondary Peripheral" }
      ].map(radar => ({
        type: "Feature",
        id: `radar_${radar.name.replace(/\s+/g, "_").toLowerCase()}`,
        geometry: {
          type: "Point",
          coordinates: [radar.lng, radar.lat]
        },
        properties: {
          layer: "Doppler_Radar_Network",
          stationName: radar.name,
          operationalStatus: radar.status,
          coverageRadiusKm: 400
        }
      }))
    ]
  };
};

// OGC KML 2.2 Standard for Google Earth 3D
const buildKml = () => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Cyclone ARNAB (BOB-02) GIS Vector Package v2.4</name>
    <description>CYCLO-AI Real-Time GIS Telemetry, PINN Ensemble Trajectory &amp; Coastal Landfall Threat Package</description>
    <Style id="eyeStyle">
      <IconStyle>
        <scale>1.4</scale>
        <color>ff365eff</color>
      </IconStyle>
      <LabelStyle><color>ffffffff</color><scale>1.1</scale></LabelStyle>
    </Style>
    <Style id="pastTrackStyle">
      <LineStyle><color>fffef200</color><width>4</width></LineStyle>
    </Style>
    <Style id="forecastTrackStyle">
      <LineStyle><color>ff365eff</color><width>4</width></LineStyle>
    </Style>
    <Style id="coneStyle">
      <LineStyle><color>7ffef200</color><width>2</width></LineStyle>
      <PolyStyle><color>40fef200</color></PolyStyle>
    </Style>
    <Style id="landfallStyle">
      <IconStyle><scale>1.5</scale><color>ff0000ff</color></IconStyle>
    </Style>

    <!-- LIVE EYE CENTER -->
    <Placemark>
      <name>Cyclone ARNAB (Eye LLCC) - LIVE</name>
      <description><![CDATA[
        <b>Storm:</b> Cyclone ARNAB (BOB-02)<br/>
        <b>Intensity:</b> Category 4 Severe (155 km/h / 84 kts)<br/>
        <b>Central Pressure:</b> 964 hPa<br/>
        <b>RMW:</b> 28 km<br/>
        <b>Status:</b> Stage 3 IMD Cyclone Warning
      ]]></description>
      <styleUrl>#eyeStyle</styleUrl>
      <Point>
        <coordinates>88.512,14.234,0</coordinates>
      </Point>
    </Placemark>

    <!-- OBSERVED PAST TRACK (72h) -->
    <Placemark>
      <name>Observed Past Track (-72h to LIVE)</name>
      <styleUrl>#pastTrackStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>
          92.15,8.80,0
          90.80,10.45,0
          89.65,12.10,0
          88.95,13.30,0
          88.512,14.234,0
        </coordinates>
      </LineString>
    </Placemark>

    <!-- PINN FORECAST TRACK (120h) -->
    <Placemark>
      <name>PINN AI Forecast Trajectory (0h to +120h)</name>
      <styleUrl>#forecastTrackStyle</styleUrl>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>
          88.512,14.234,0
          88.10,15.20,0
          87.65,16.25,0
          86.70,18.20,0
          85.65,20.15,0
          84.90,21.60,0
          84.20,23.10,0
          83.50,24.80,0
        </coordinates>
      </LineString>
    </Placemark>

    <!-- 120H CONE OF UNCERTAINTY -->
    <Placemark>
      <name>120h Cone of Uncertainty (68% Confidence)</name>
      <styleUrl>#coneStyle</styleUrl>
      <Polygon>
        <outerBoundaryIs>
          <LinearRing>
            <coordinates>
              88.512,14.234,0
              89.15,15.60,0
              89.40,17.10,0
              88.80,19.40,0
              87.90,21.80,0
              86.80,23.90,0
              85.40,25.60,0
              81.60,24.20,0
              82.90,22.40,0
              84.30,20.20,0
              85.50,18.00,0
              86.90,16.00,0
              87.70,14.80,0
              88.512,14.234,0
            </coordinates>
          </LinearRing>
        </outerBoundaryIs>
      </Polygon>
    </Placemark>

    <!-- LANDFALL TARGET -->
    <Placemark>
      <name>Projected Landfall Intercept: Puri-Dhamra Sector</name>
      <description><![CDATA[
        <b>ETA:</b> T+28 Hours<br/>
        <b>Peak Wind:</b> 165 km/h<br/>
        <b>Surge:</b> +3.4m Astronomical Above Tide<br/>
        <b>Threat Sector:</b> Odisha Coastal Corridor
      ]]></description>
      <styleUrl>#landfallStyle</styleUrl>
      <Point>
        <coordinates>85.83,19.81,0</coordinates>
      </Point>
    </Placemark>
  </Document>
</kml>`;
};

interface ActionDispatchPanelProps {
  onOpenXai?: () => void;
}

export function ActionDispatchPanel({ onOpenXai }: ActionDispatchPanelProps) {
  const [broadcastConfirmed, setBroadcastConfirmed] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(null);

  const handleExportGeoJson = () => {
    const geojson = buildGeoJson();
    const filename = "cyclone_arnab_gis_vector_v2.4.geojson";
    triggerDownload(filename, JSON.stringify(geojson, null, 2), "application/geo+json");
    setLastExported(filename);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4500);
  };

  const handleExportKml = () => {
    const kml = buildKml();
    const filename = "cyclone_arnab_gis_vector_v2.4.kml";
    triggerDownload(filename, kml, "application/vnd.google-earth.kml+xml");
    setLastExported(filename);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4500);
  };

  const handleExport = () => {
    handleExportGeoJson();
  };

  const handleBroadcast = () => {
    setBroadcastConfirmed((prev) => !prev);
  };

  return (
    <Card 
      variant="glass" 
      className="relative overflow-hidden p-4 flex flex-col justify-between h-full min-h-[360px] bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_0_15px_rgba(0,242,254,0.1)]"
    >
      {/* React Bits Noise Background Overlay */}
      <Noise
        patternSize={250}
        patternScaleX={1.2}
        patternScaleY={1.2}
        patternRefreshInterval={2}
        patternAlpha={9}
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col justify-between flex-1">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3 border-b border-[#1E3252] pb-2.5">
            <h3 className="font-rajdhani text-sm font-bold uppercase tracking-wider text-[#00F2FE]">
              Action Dispatch Hub
            </h3>
            <span className="text-[10px] font-mono text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#00F2FE]/30 uppercase">
              Ops Ready
            </span>
          </div>

          <p className="text-[11px] text-[#00F2FE] mb-4">
            Direct operational dispatch triggers for rapid response coordination, model exports, and national civil emergency broadcasting.
          </p>

          {/* Action Buttons Stack matching ScientistProfilePill 3D & GSAP hover effect */}
          <div className="flex flex-col gap-2.5">
            {/* Button 1: Forecast & Trajectory Link (Cyan) */}
            <DispatchPill
              href="/forecast"
              className="dispatch-pill-cyan"
              circleColor="#00F2FE"
              icon={<TrendingUp className="w-4 h-4 text-[#00F2FE] shrink-0" />}
              iconHover={<TrendingUp className="w-4 h-4 text-[#050B14] shrink-0" />}
              label="Forecast & Trajectory Ensembles"
              right={<ArrowUpRight className="w-4 h-4 text-[#00F2FE] shrink-0" />}
              rightHover={<ArrowUpRight className="w-4 h-4 text-[#050B14] shrink-0" />}
            />

            {/* Button 2: Export GeoJSON / KML (Deeper shade of blue) */}
            <div>
              <DispatchPill
                onClick={handleExport}
                className={`dispatch-pill-blue ${exportSuccess ? "!border-[#10E7A2] !shadow-[0_0_20px_rgba(16,231,162,0.35)]" : ""}`}
                circleColor={exportSuccess ? "#10E7A2" : "#1D63FF"}
                icon={
                  exportSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10E7A2] shrink-0" />
                  ) : (
                    <Download className="w-4 h-4 text-[#60A5FA] shrink-0" />
                  )
                }
                iconHover={
                  exportSuccess ? (
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  ) : (
                    <Download className="w-4 h-4 text-white shrink-0" />
                  )
                }
                label={exportSuccess ? "GeoJSON Package Exported!" : "Export GeoJSON / KML Vector"}
                labelHover={exportSuccess ? "GeoJSON Package Exported!" : "Export GeoJSON / KML Vector"}
                right={
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      exportSuccess
                        ? "bg-[#10E7A2]/20 text-[#10E7A2] border border-[#10E7A2]/40"
                        : "text-[#93C5FD]"
                    }`}
                  >
                    {exportSuccess ? "RFC 7946" : "v2.4"}
                  </span>
                }
                rightHover={
                  <span className="text-[10px] font-mono text-white font-bold">
                    {exportSuccess ? "RFC 7946" : "v2.4"}
                  </span>
                }
              />
              {exportSuccess && (
                <div className="flex items-center justify-between px-2.5 py-1.5 mt-1.5 rounded-lg bg-[#10E7A2]/10 border border-[#10E7A2]/30 text-[10px] font-mono text-[#10E7A2] animate-in fade-in slide-in-from-top-1">
                  <span className="flex items-center gap-1.5 truncate">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Saved: {lastExported}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExportKml();
                    }}
                    className="ml-2 px-2 py-0.5 rounded bg-[#1D63FF]/40 hover:bg-[#1D63FF]/70 text-white border border-[#1D63FF]/60 transition text-[9px] shrink-0 font-sans font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="w-2.5 h-2.5" />
                    Get .KML
                  </button>
                </div>
              )}
            </div>

            {/* Button 3: Broadcast Alert (NDMA - Orange) */}
            <div>
              <DispatchPill
                onClick={handleBroadcast}
                className={`dispatch-pill-orange ${broadcastConfirmed ? "!border-[#10E7A2] !shadow-[0_0_22px_rgba(16,231,162,0.45)]" : ""}`}
                circleColor={broadcastConfirmed ? "#10E7A2" : "#FF5E36"}
                icon={
                  broadcastConfirmed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#10E7A2] shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#FF5E36] shrink-0" />
                  )
                }
                iconHover={
                  broadcastConfirmed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#050B14] shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-[#050B14] shrink-0" />
                  )
                }
                label={
                  broadcastConfirmed
                    ? "NDMA Channel Armed: Broadcast Ready"
                    : "Broadcast Alert (NDMA / CAP-IN)"
                }
                right={
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      broadcastConfirmed
                        ? "bg-[#10E7A2]/20 text-[#10E7A2] border border-[#10E7A2]/40"
                        : "bg-[#FF5E36]/25 text-[#FF5E36] border border-[#FF5E36]/50"
                    }`}
                  >
                    STAGE 3
                  </span>
                }
                rightHover={
                  <span className="text-[9px] font-mono bg-black/25 text-[#050B14] px-1.5 py-0.5 rounded font-bold">
                    STAGE 3
                  </span>
                }
              />
              {broadcastConfirmed && (
                <p className="text-[10px] font-mono text-[#10E7A2] mt-1.5 px-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Encrypted link verified with State Emergency Operations Center (SEOC).
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Protocol Footer */}
        <div className="mt-4 pt-2.5 border-t border-[#1E3252] flex items-center justify-between text-[10px] font-mono text-[#8E9EB5]">
          <span>CAP-IN Protocol: v1.2</span>
          <span className="text-[#00F2FE]">IMD Priority Sector 02</span>
        </div>
      </div>
    </Card>
  );
}
