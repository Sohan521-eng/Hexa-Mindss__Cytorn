"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Building2, 
  Zap, 
  Route, 
  CheckCircle2, 
  FileText, 
  FileJson, 
  FileSpreadsheet, 
  TrendingUp,
  MapPin
} from "lucide-react";
import { DistrictInfo, StormContext, InfrastructurePOI, RbacRole } from "./types";
import { CRITICAL_INFRASTRUCTURE, calculatePoiStatus } from "./digitalTwinData";
import { exportTwinGeoJson, exportTwinCsv, exportTwinPdf } from "./exportTwinReport";
import Noise from "@/components/ui/Noise";
import { ShinyBadge } from "@/components/ui/ShinyBadge";
import { ShinyText } from "@/components/ui/ShinyText";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

interface DistrictImpactRailProps {
  district: DistrictInfo;
  storm: StormContext;
  surgeLevel: number;
  rbacRole: RbacRole;
  onOpenEvacModal?: () => void;
  onSelectPoi: (poi: InfrastructurePOI) => void;
  selectedPoiId: string | null;
}

/* ─── SC-Styled Pill Button with GSAP Bubble & Dual-Label Stack ─── */
function ExportPillButton({
  onClick,
  color,
  icon: Icon,
  title,
  subtitle,
}: {
  onClick: () => void;
  color: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  subtitle: string;
}) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tlRef = useRef<any>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let active = true;
    const layout = () => {
      if (!active) return;
      const circle = circleRef.current;
      const btn = btnRef.current;
      if (!circle || !btn) return;
      const { width: w, height: h } = btn.getBoundingClientRect();
      if (!w || !h) return;
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      import("gsap").then(({ gsap }) => {
        if (!active) return;
        gsap.set(circle, { xPercent: -50, scale: 0, transformOrigin: `50% ${D - delta}px` });
        const label = btn.querySelector<HTMLElement>(".pill-label");
        const hover = btn.querySelector<HTMLElement>(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (hover) gsap.set(hover, { y: h + 100, opacity: 0 });

        tlRef.current?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(circle, { scale: 1.35, xPercent: -50, duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
        if (label) tl.to(label, { y: -(h + 8), duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
        if (hover) {
          gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(hover, { y: 0, opacity: 1, duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
        }
        tlRef.current = tl;
      });
    };

    layout();
    window.addEventListener("resize", layout);
    document.fonts?.ready.then(layout).catch(() => {});
    return () => {
      active = false;
      window.removeEventListener("resize", layout);
    };
  }, []);

  const handleEnter = () => {
    setIsHovered(true);
    tlRef.current?.tweenTo(tlRef.current.duration(), { duration: 0.3, ease: "power2.easeOut", overwrite: "auto" });
  };

  const handleLeave = () => {
    setIsHovered(false);
    tlRef.current?.tweenTo(0, { duration: 0.25, ease: "power2.easeOut", overwrite: "auto" });
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative w-full overflow-hidden cursor-pointer select-none transition-all duration-200"
      style={{
        height: "46px",
        padding: "0 14px",
        backgroundColor: isHovered ? `${color}22` : `${color}14`,
        border: `1.5px solid ${isHovered ? color : `${color}99`}`,
        borderRadius: "0.75rem",
        boxShadow: isHovered
          ? `0 10px 28px -2px rgba(0,0,0,0.95), 0 5px 14px rgba(0,0,0,0.95), 0 0 20px ${color}80, inset 0 1px 0 rgba(255,255,255,0.6)`
          : `0 6px 20px -2px rgba(0,0,0,0.85), 0 3px 10px rgba(0,0,0,0.95), 0 0 12px ${color}26, inset 0 1px 0 rgba(255,255,255,0.35)`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
      }}
    >
      {/* GSAP expanding bubble */}
      <span
        ref={circleRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          borderRadius: "50%",
          backgroundColor: color,
          zIndex: 1,
          display: "block",
          pointerEvents: "none",
          willChange: "transform",
          transform: "scale(0)",
        }}
      />

      {/* Dual-label stack */}
      <span style={{ position: "relative", display: "flex", alignItems: "center", width: "100%", height: "100%", zIndex: 2 }}>
        {/* Default label (slides up on hover) */}
        <span
          className="pill-label"
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            height: "100%",
            textAlign: "left",
            lineHeight: 1.15,
            willChange: "transform",
          }}
        >
          <Icon className="w-4 h-4 shrink-0" style={{ color }} />
          <div className="flex flex-col min-w-0">
            <span 
              className="text-xs font-rajdhani font-bold truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]"
              style={{ color: "#FFFFFF" }}
            >
              {title}
            </span>
            <span className="text-[9px] font-jetbrains text-slate-400 truncate">
              {subtitle}
            </span>
          </div>
        </span>

        {/* Hover label (dark #050B14, slides in from below) */}
        <span
          className="pill-label-hover"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            color: "#050B14",
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: "100%",
            height: "100%",
            textAlign: "left",
            lineHeight: 1.15,
            willChange: "transform, opacity",
            fontWeight: 800,
          }}
        >
          <Icon className="w-4 h-4 shrink-0 text-[#050B14]" />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-rajdhani font-extrabold text-[#050B14] truncate">
              {title}
            </span>
            <span className="text-[9px] font-jetbrains text-[#050B14]/85 font-bold truncate">
              {subtitle}
            </span>
          </div>
        </span>
      </span>
    </button>
  );
}

export function DistrictImpactRail({
  district,
  storm,
  surgeLevel,
  rbacRole,
  onOpenEvacModal,
  onSelectPoi,
  selectedPoiId,
}: DistrictImpactRailProps) {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});
  const railRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const kpiCard1Ref = useRef<HTMLDivElement | null>(null);
  const kpiCard2Ref = useRef<HTMLDivElement | null>(null);
  const kpiCard3Ref = useRef<HTMLDivElement | null>(null);
  const kpiCard4Ref = useRef<HTMLDivElement | null>(null);

  // SVG mask to punch out the 4 KPI cards as cutout apertures
  useIsomorphicLayoutEffect(() => {
    const updateCutouts = () => {
      if (!railRef.current) return;
      const railRect = railRef.current.getBoundingClientRect();
      if (railRect.width === 0 || railRect.height === 0) return;

      const cw = Math.round(railRect.width);
      const ch = Math.round(railRect.height);

      const makePath = (el: HTMLElement | null, r: number) => {
        if (!el) return "";
        const b = el.getBoundingClientRect();
        const x = Math.round(b.left - railRect.left);
        const y = Math.round(b.top - railRect.top);
        const w = Math.round(b.width);
        const h = Math.round(b.height);
        if (w <= 0 || h <= 0) return "";
        return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
      };

      const path1 = makePath(kpiCard1Ref.current, 12);
      const path2 = makePath(kpiCard2Ref.current, 12);
      const path3 = makePath(kpiCard3Ref.current, 12);
      const path4 = makePath(kpiCard4Ref.current, 12);
      const paths = [path1, path2, path3, path4].filter(Boolean).join(" ");
      if (!paths) return;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}"><path fill-rule="evenodd" fill="#000" d="M 0 0 H ${cw} V ${ch} H 0 Z ${paths}" /></svg>`;
      const dataUri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

      setMaskStyle({
        WebkitMaskImage: dataUri,
        maskImage: dataUri,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      });
    };

    updateCutouts();

    const ro = new ResizeObserver(updateCutouts);
    if (railRef.current) ro.observe(railRef.current);
    if (scrollContainerRef.current) ro.observe(scrollContainerRef.current);
    if (kpiCard1Ref.current) ro.observe(kpiCard1Ref.current);
    if (kpiCard2Ref.current) ro.observe(kpiCard2Ref.current);
    if (kpiCard3Ref.current) ro.observe(kpiCard3Ref.current);
    if (kpiCard4Ref.current) ro.observe(kpiCard4Ref.current);

    const timer = setTimeout(updateCutouts, 60);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updateCutouts).catch(() => {});
    }

    const scrollEl = scrollContainerRef.current;
    if (scrollEl) {
      scrollEl.addEventListener("scroll", updateCutouts);
    }
    window.addEventListener("resize", updateCutouts);

    return () => {
      clearTimeout(timer);
      ro.disconnect();
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", updateCutouts);
      }
      window.removeEventListener("resize", updateCutouts);
    };
  }, [district, surgeLevel]);

  // Filter infrastructure for this district
  const districtPois = CRITICAL_INFRASTRUCTURE.filter((p) => p.districtId === district.id);

  const hospitals = districtPois.filter((p) => p.type === "hospital");
  const substations = districtPois.filter((p) => p.type === "substation");
  const highways = districtPois.filter((p) => p.type === "highway");
  const shelters = districtPois.filter((p) => p.type === "shelter");

  // Dynamic Impact KPIs scaled by surge level
  const affectedAreaKm2 = Math.round(district.totalAreaKm2 * 0.06 * (surgeLevel / 3.0));
  const populationAtRisk = Math.round(district.population * 0.08 * (surgeLevel / 3.0));
  const impassableKm = Math.min(district.highwayKm, Math.round(23 * (surgeLevel / 3.0)));

  const handleExport = (type: "geojson" | "csv" | "pdf") => {
    if (type === "geojson") {
      exportTwinGeoJson(district, storm, surgeLevel);
      setDownloadNotice("Exported GeoJSON (RFC 7946)");
    } else if (type === "csv") {
      exportTwinCsv(district, storm, surgeLevel);
      setDownloadNotice("Exported Impact Matrix CSV");
    } else {
      exportTwinPdf(district, storm, surgeLevel);
      setDownloadNotice("Generated Official IMD/NDMA PDF Report");
    }
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <aside
      ref={railRef}
      id="district-impact-rail"
      className="relative z-20 w-full lg:w-80 xl:w-96 shrink-0 rounded-2xl overflow-hidden flex flex-col text-white shadow-2xl transition-all duration-200 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.45)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.15)",
      }}
    >
      {/* Background layer with Noise & subtle ambient cyan glow */}
      <div 
        className="absolute inset-0 bg-[#0F1B2F]/85 backdrop-blur-xl pointer-events-none rounded-2xl overflow-hidden"
        style={maskStyle}
      >
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={25}
        />
        <div className="absolute top-0 right-0 w-72 h-36 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div 
        ref={scrollContainerRef}
        className="relative z-10 flex-1 flex flex-col p-4 gap-4 overflow-y-auto custom-scrollbar"
      >
        {/* 1. Header & District Title */}
      <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-orbitron font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            {(district?.name || "District").toUpperCase()} IMPACT INTELLIGENCE
          </h2>
        </div>
        <ShinyBadge
          speed={2.5}
          spread={90}
          yoyo
          borderColor="rgba(245, 158, 11, 0.45)"
          borderShineColor="#FDE68A"
          surfaceColor="rgba(245, 158, 11, 0.05)"
          surfaceShineColor="rgba(255, 255, 255, 0.35)"
          roundedClassName="rounded-md"
          innerClassName="px-2 py-0.5 bg-[#070D18]/95 border-amber-500/40 flex items-center gap-1"
          className="shadow-[0_0_10px_rgba(245,158,11,0.2)] shrink-0"
        >
          <ShinyText
            text={`RISK ${district.riskScore}/100`}
            speed={2.5}
            color="#FCD34D"
            shineColor="#FFFFFF"
            spread={90}
            className="text-[10px] font-jetbrains font-extrabold uppercase tracking-wider whitespace-nowrap drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]"
          />
        </ShinyBadge>
      </div>

      {/* 2. Surge Impact Summary Bar (KPI Grid - Cutout Apertures) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Affected Area */}
        <div 
          ref={kpiCard1Ref}
          className="p-2.5 rounded-xl bg-transparent flex flex-col transition-all"
          style={{
            border: "1.5px solid rgba(0, 242, 254, 0.75)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
          }}
        >
          <span className="text-[10px] font-rajdhani font-bold text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            AFFECTED AREA
          </span>
          <span className="text-base font-jetbrains font-extrabold text-[#00F2FE] mt-0.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            {affectedAreaKm2} <span className="text-xs font-normal text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">km²</span>
          </span>
          <span className="text-[10px] font-jetbrains font-medium text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            {((affectedAreaKm2 / district.totalAreaKm2) * 100).toFixed(1)}% of district
          </span>
        </div>

        {/* Population at Risk */}
        <div 
          ref={kpiCard2Ref}
          className="p-2.5 rounded-xl bg-transparent flex flex-col transition-all"
          style={{
            border: "1.5px solid rgba(255, 94, 54, 0.75)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
          }}
        >
          <span className="text-[10px] font-rajdhani font-bold text-[#FF5E36] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            CITIZENS IN SURGE ZONE
          </span>
          <span className="text-base font-jetbrains font-extrabold text-[#FF5E36] mt-0.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            ~{populationAtRisk.toLocaleString()}
          </span>
          <span className="text-[10px] font-jetbrains font-medium text-[#FF5E36] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            0-5km coastal strip
          </span>
        </div>

        {/* Safe Shelters */}
        <div 
          ref={kpiCard3Ref}
          className="p-2.5 rounded-xl bg-transparent flex flex-col transition-all"
          style={{
            border: "1.5px solid rgba(16, 231, 162, 0.75)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
          }}
        >
          <span className="text-[10px] font-rajdhani font-bold text-[#10E7A2] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            SAFE SHELTER CAPACITY
          </span>
          <span className="text-base font-jetbrains font-extrabold text-[#10E7A2] mt-0.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            {shelters.length} / {district.sheltersCount}
          </span>
          <span className="text-[10px] font-jetbrains font-medium text-[#10E7A2] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            21,400 dry beds
          </span>
        </div>

        {/* Impassable Highway */}
        <div 
          ref={kpiCard4Ref}
          className="p-2.5 rounded-xl bg-transparent flex flex-col transition-all"
          style={{
            border: "1.5px solid rgba(245, 158, 11, 0.75)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85)",
          }}
        >
          <span className="text-[10px] font-rajdhani font-bold text-[#F59E0B] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            IMPASSABLE HIGHWAY
          </span>
          <span className="text-base font-jetbrains font-extrabold text-[#F59E0B] mt-0.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            {impassableKm} <span className="text-xs font-normal text-[#F59E0B] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">km</span>
          </span>
          <span className="text-[10px] font-jetbrains font-medium text-[#F59E0B] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            NH-316 cut off
          </span>
        </div>
      </div>

      {/* 3. GIS & Impact Export Matrix (Scientist Pill Style Action Buttons) */}
      <div className="flex flex-col gap-2 pt-1 pb-1">
        <ExportPillButton
          onClick={() => handleExport("geojson")}
          color="#00F2FE"
          icon={FileJson}
          title="GeoJSON Vector Polygons (.geojson)"
          subtitle="GIS Shapefiles & Contours"
        />

        <ExportPillButton
          onClick={() => handleExport("csv")}
          color="#10E7A2"
          icon={FileSpreadsheet}
          title="District Impact Matrix (.csv)"
          subtitle="Tabular Asset Damage Assessment"
        />

        <ExportPillButton
          onClick={() => handleExport("pdf")}
          color="#FF5E36"
          icon={FileText}
          title="Official IMD/NDMA Whitepaper (.pdf)"
          subtitle="Full Inundation Briefing Document"
        />

        {/* Download notice */}
        {downloadNotice && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#10E7A2]/15 border border-[#10E7A2]/30 text-xs font-jetbrains text-[#10E7A2] animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        )}
      </div>

      {/* 4. Critical Infrastructure Summary Cards */}
      <div className="flex flex-col gap-3 pt-2 border-t border-[#1E3A5F]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            OPERATIONAL ASSETS (TAP TO FOCUS)
          </span>
          <span className="text-[10px] font-jetbrains text-slate-400">
            {districtPois.length} MONITORED
          </span>
        </div>

        {/* Hospital Card */}
        {hospitals.map((hosp) => {
          const { floodDepth, status } = calculatePoiStatus(hosp, surgeLevel);
          const isSelected = selectedPoiId === hosp.id;
          const isCritical = status === "critical" || status === "flooded";
          const cardColor = isCritical ? "#EF4444" : status === "warning" ? "#F59E0B" : "#10E7A2";

          return (
            <div
              key={hosp.id}
              onClick={() => onSelectPoi(hosp)}
              className="p-3 rounded-xl transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? `${cardColor}26` : "rgba(5, 11, 20, 0.8)",
                border: `1.5px solid ${isSelected ? cardColor : `${cardColor}70`}`,
                boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 shrink-0" style={{ color: cardColor }} />
                  <span 
                    className="text-xs font-rajdhani font-bold line-clamp-1"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    {hosp.name}
                  </span>
                </div>
                <span
                  className="text-[9px] font-chakra font-bold px-1.5 py-0.5 rounded border uppercase shrink-0"
                  style={{
                    color: cardColor,
                    borderColor: `${cardColor}60`,
                    backgroundColor: `${cardColor}20`,
                    textShadow: "0 2px 4px rgba(0,0,0,0.95)",
                  }}
                >
                  {status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-jetbrains">
                <div>
                  <span 
                    className="block text-[9px] font-rajdhani font-bold uppercase tracking-wider"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    FLOOD DEPTH:
                  </span>
                  <span 
                    className="font-bold text-[10px]"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    {floodDepth > 0 ? `+${floodDepth}m at T+28h` : "DRY (0.0m)"}
                  </span>
                </div>
                <div>
                  <span 
                    className="block text-[9px] font-rajdhani font-bold uppercase tracking-wider"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    GENERATOR:
                  </span>
                  <span 
                    className="font-bold text-[10px]"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    {hosp.details.generatorStatus === "below_flood_line" ? "BELOW FLOOD LINE ⚠️" : "SAFE"}
                  </span>
                </div>
              </div>

              <p 
                className="text-[10px] font-rajdhani mt-2 pt-1.5 border-t"
                style={{ 
                  color: cardColor, 
                  borderColor: `${cardColor}30`,
                  textShadow: "0 2px 4px rgba(0,0,0,0.95)" 
                }}
              >
                → <span>{hosp.actionRecommendation}</span>
              </p>
            </div>
          );
        })}

        {/* Power Grid Card */}
        {substations.map((sub) => {
          const { status } = calculatePoiStatus(sub, surgeLevel);
          const isSelected = selectedPoiId === sub.id;
          const cardColor = status === "safe" ? "#10E7A2" : "#F59E0B";

          return (
            <div
              key={sub.id}
              onClick={() => onSelectPoi(sub)}
              className="p-3 rounded-xl transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? `${cardColor}26` : "rgba(5, 11, 20, 0.8)",
                border: `1.5px solid ${isSelected ? cardColor : `${cardColor}70`}`,
                boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 shrink-0" style={{ color: cardColor }} />
                  <span 
                    className="text-xs font-rajdhani font-bold line-clamp-1"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    {sub.name}
                  </span>
                </div>
                <span 
                  className="text-[9px] font-chakra font-bold px-1.5 py-0.5 rounded border uppercase shrink-0"
                  style={{
                    color: cardColor,
                    borderColor: `${cardColor}60`,
                    backgroundColor: `${cardColor}20`,
                    textShadow: "0 2px 4px rgba(0,0,0,0.95)",
                  }}
                >
                  {status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-jetbrains">
                <div>
                  <span 
                    className="block text-[9px] font-rajdhani font-bold uppercase tracking-wider"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    BASE MSL:
                  </span>
                  <span 
                    className="font-bold text-[10px]"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    +{sub.elevationMsl}m MSL
                  </span>
                </div>
                <div>
                  <span 
                    className="block text-[9px] font-rajdhani font-bold uppercase tracking-wider"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    SHUTDOWN ETA:
                  </span>
                  <span 
                    className="font-bold text-[10px]"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    {sub.details.shutdownEta}
                  </span>
                </div>
              </div>

              <p 
                className="text-[10px] font-rajdhani mt-2 pt-1.5 border-t"
                style={{ 
                  color: cardColor, 
                  borderColor: `${cardColor}30`,
                  textShadow: "0 2px 4px rgba(0,0,0,0.95)" 
                }}
              >
                → <span>{sub.actionRecommendation}</span>
              </p>
            </div>
          );
        })}

        {/* Highway Artery Card */}
        {highways.map((hw) => {
          const isSelected = selectedPoiId === hw.id;
          const isSafe = hw.status === "safe";
          const cardColor = isSafe ? "#00F2FE" : "#EF4444";

          return (
            <div
              key={hw.id}
              onClick={() => onSelectPoi(hw)}
              className="p-3 rounded-xl transition-all cursor-pointer"
              style={{
                backgroundColor: isSelected ? `${cardColor}26` : "rgba(5, 11, 20, 0.8)",
                border: `1.5px solid ${isSelected ? cardColor : `${cardColor}70`}`,
                boxShadow: "inset 0 1px 4px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Route className="w-4 h-4 shrink-0" style={{ color: cardColor }} />
                  <span 
                    className="text-xs font-rajdhani font-bold line-clamp-1"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    {hw.name}
                  </span>
                </div>
                <span
                  className="text-[9px] font-chakra font-bold px-1.5 py-0.5 rounded border uppercase shrink-0"
                  style={{
                    color: cardColor,
                    borderColor: `${cardColor}60`,
                    backgroundColor: `${cardColor}20`,
                    textShadow: "0 2px 4px rgba(0,0,0,0.95)",
                  }}
                >
                  {isSafe ? "DRY ROUTE" : "IMPASSABLE"}
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-2 text-[10px] font-jetbrains">
                <div>
                  <span 
                    className="text-[9px] font-rajdhani font-bold uppercase tracking-wider"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    FLOOD CUT: </span>
                  <span 
                    className="font-bold text-[10px]"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    {hw.details.floodCutKm}
                  </span>
                </div>
                <div>
                  <span 
                    className="text-[9px] font-rajdhani font-bold uppercase tracking-wider"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    CONVOY ALTERNATE: </span>
                  <span 
                    className="font-bold text-[10px]"
                    style={{ color: cardColor, textShadow: "0 2px 4px rgba(0,0,0,0.95)" }}
                  >
                    {hw.details.alternateRoute}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </aside>
  );
}
