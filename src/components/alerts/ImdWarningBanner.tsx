"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { 
  Clock, 
  Waves, 
  Wind, 
  Calendar,
  Layers,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import Noise from "@/components/ui/Noise";
import { ShinyBadge } from "@/components/ui/ShinyBadge";
import { AlertStageNumber, AlertStageConfig } from "./types";
import { IMD_ALERT_STAGES } from "./alertsData";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

interface ImdWarningBannerProps {
  activeStage: AlertStageNumber;
  selectedStageFilter: AlertStageNumber;
  onSelectStageFilter: (stage: AlertStageNumber) => void;
  landfallTime?: string;
  surgeHeightM?: number;
  lastIssuedIst?: string;
}

/* ─── Custom GSAP expanding bubble hook for Stage Pill buttons ─── */
function useStagePillGsap(dep?: unknown) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    let active = true;
    const layout = () => {
      if (!active) return;
      const circle = circleRef.current;
      const btn = btnRef.current;
      if (!circle || !btn) return;

      const w = btn.offsetWidth || btn.getBoundingClientRect().width;
      const h = btn.offsetHeight || btn.getBoundingClientRect().height;
      if (!w || !h) return;

      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;

      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`,
      });

      const label = btn.querySelector<HTMLElement>(".pill-label");
      const hover = btn.querySelector<HTMLElement>(".pill-label-hover");

      if (label) gsap.set(label, { y: 0 });
      if (hover) gsap.set(hover, { y: h + 16, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.35, xPercent: -50, duration: 1.2, ease: "power2.easeOut", overwrite: "auto" }, 0);
      if (label) tl.to(label, { y: -(h + 10), duration: 1.2, ease: "power2.easeOut", overwrite: "auto" }, 0);
      if (hover) {
        gsap.set(hover, { y: Math.ceil(h + 20), opacity: 0 });
        tl.to(hover, { y: 0, opacity: 1, duration: 1.2, ease: "power2.easeOut", overwrite: "auto" }, 0);
      }
      tlRef.current = tl;
    };

    layout();
    const t1 = setTimeout(layout, 150);
    const t2 = setTimeout(layout, 400);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(layout).catch(() => {});

    return () => {
      active = false;
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [dep]);

  const handleEnter = () => {
    tlRef.current?.tweenTo(tlRef.current.duration(), { duration: 0.3, ease: "power2.easeOut", overwrite: "auto" });
  };
  const handleLeave = () => {
    tlRef.current?.tweenTo(0, { duration: 0.25, ease: "power2.easeOut", overwrite: "auto" });
  };

  return { btnRef, circleRef, handleEnter, handleLeave };
}

/* ─── Stage Pill Button matching StateSelectorPill styling and GSAP hover effect ─── */
function StagePillButton({
  cfg,
  isSelected,
  isLive,
  onClick,
}: {
  cfg: AlertStageConfig;
  isSelected: boolean;
  isLive: boolean;
  onClick: () => void;
}) {
  const { btnRef, circleRef, handleEnter, handleLeave } = useStagePillGsap(isSelected);
  const hoverTextColor = cfg.stage === 1 || cfg.stage === 2 ? "#050B14" : "#FFFFFF";

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="relative overflow-hidden cursor-pointer select-none transition-all duration-300 w-full"
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "40px",
        padding: "0 14px",
        borderRadius: "0.75rem",
        border: `1.5px solid ${isSelected ? cfg.colorHex : cfg.borderHex}`,
        background: isSelected ? cfg.bgHex : "rgba(5, 11, 20, 0.72)",
        boxShadow: isSelected
          ? `0 8px 24px -2px rgba(0,0,0,0.85), 0 0 16px ${cfg.colorHex}45, inset 0 1px 0 rgba(255,255,255,0.4)`
          : "0 4px 16px -2px rgba(0,0,0,0.85), 0 0 10px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        color: "#FFFFFF",
        fontFamily: "var(--font-rajdhani, sans-serif)",
        fontWeight: 700,
        fontSize: "13px",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
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
          background: cfg.colorHex,
          zIndex: 1,
          display: "block",
          pointerEvents: "none",
          willChange: "transform",
          transform: "scale(0)",
        }}
      />

      {/* Dual-label stack */}
      <span
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          lineHeight: 1,
          zIndex: 2,
        }}
      >
        {/* Default label (slides up on hover) */}
        <span
          className="pill-label"
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            lineHeight: 1,
            willChange: "transform",
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: cfg.colorHex,
                boxShadow: `0 0 8px ${cfg.colorHex}90`,
              }}
            />
            <span className="font-rajdhani uppercase tracking-wider text-xs sm:text-[13px] font-bold text-white">
              Stage {cfg.stage}
            </span>
          </div>

          {isLive && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-600 text-white font-black tracking-wider animate-pulse ml-1.5 shadow-sm">
              LIVE
            </span>
          )}
        </span>

        {/* Hover label (slides in from below) */}
        <span
          className="pill-label-hover"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            color: hoverTextColor,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            lineHeight: 1,
            willChange: "transform, opacity",
            fontWeight: 800,
          }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: hoverTextColor }}
            />
            <span
              className="font-rajdhani uppercase tracking-wider text-xs sm:text-[13px] font-extrabold"
              style={{ color: hoverTextColor }}
            >
              Stage {cfg.stage}
            </span>
          </div>

          {isLive && (
            <span
              className="text-[9px] font-mono px-1.5 py-0.5 rounded font-black tracking-wider ml-1.5 shadow-sm"
              style={{
                backgroundColor: hoverTextColor === "#FFFFFF" ? "#FFFFFF" : "#050B14",
                color: hoverTextColor === "#FFFFFF" ? "#D50000" : "#FFFFFF",
              }}
            >
              LIVE
            </span>
          )}
        </span>
      </span>
    </button>
  );
}

export function ImdWarningBanner({
  activeStage = 3,
  selectedStageFilter,
  onSelectStageFilter,
  landfallTime = "Tomorrow 18:30 IST • Puri Coast",
  surgeHeightM = 3.4,
  lastIssuedIst = "06:00 IST",
}: ImdWarningBannerProps) {
  // Countdown to next mandated bulletin (3h cycle)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(2 * 3600 + 44 * 60 + 38);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 3 * 3600));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");

  const viewedStage = IMD_ALERT_STAGES[selectedStageFilter] || IMD_ALERT_STAGES[activeStage];

  const sectionRef = useRef<HTMLElement | null>(null);
  const box1Ref = useRef<HTMLDivElement | null>(null);
  const box2Ref = useRef<HTMLDivElement | null>(null);
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

  // SVG mask with fill-rule="evenodd" to punch out the two telemetry boxes from banner background
  useIsomorphicLayoutEffect(() => {
    const updateCutouts = () => {
      if (!sectionRef.current || !box1Ref.current || !box2Ref.current) return;
      const sectionRect = sectionRef.current.getBoundingClientRect();
      const rect1 = box1Ref.current.getBoundingClientRect();
      const rect2 = box2Ref.current.getBoundingClientRect();
      if (
        sectionRect.width === 0 || sectionRect.height === 0 ||
        rect1.width === 0 || rect1.height === 0 ||
        rect2.width === 0 || rect2.height === 0
      ) return;

      const cw = Math.round(sectionRect.width);
      const ch = Math.round(sectionRect.height);

      const x1 = Math.round(rect1.left - sectionRect.left);
      const y1 = Math.round(rect1.top - sectionRect.top);
      const w1 = Math.round(rect1.width);
      const h1 = Math.round(rect1.height);
      const r1 = 12;

      const x2 = Math.round(rect2.left - sectionRect.left);
      const y2 = Math.round(rect2.top - sectionRect.top);
      const w2 = Math.round(rect2.width);
      const h2 = Math.round(rect2.height);
      const r2 = 12;

      const path1 = `M ${x1 + r1} ${y1} H ${x1 + w1 - r1} Q ${x1 + w1} ${y1} ${x1 + w1} ${y1 + r1} V ${y1 + h1 - r1} Q ${x1 + w1} ${y1 + h1} ${x1 + w1 - r1} ${y1 + h1} H ${x1 + r1} Q ${x1} ${y1 + h1} ${x1} ${y1 + h1 - r1} V ${y1 + r1} Q ${x1} ${y1} ${x1 + r1} ${y1} Z`;
      const path2 = `M ${x2 + r2} ${y2} H ${x2 + w2 - r2} Q ${x2 + w2} ${y2} ${x2 + w2} ${y2 + r2} V ${y2 + h2 - r2} Q ${x2 + w2} ${y2 + h2} ${x2 + w2 - r2} ${y2 + h2} H ${x2 + r2} Q ${x2} ${y2 + h2} ${x2} ${y2 + h2 - r2} V ${y2 + r2} Q ${x2} ${y2} ${x2 + r2} ${y2} Z`;

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}"><path fill-rule="evenodd" fill="#000" d="M 0 0 H ${cw} V ${ch} H 0 Z ${path1} ${path2}" /></svg>`;
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

    const resizeObserver = new ResizeObserver(updateCutouts);
    if (sectionRef.current) resizeObserver.observe(sectionRef.current);
    if (box1Ref.current) resizeObserver.observe(box1Ref.current);
    if (box2Ref.current) resizeObserver.observe(box2Ref.current);

    const t1 = setTimeout(updateCutouts, 60);
    const t2 = setTimeout(updateCutouts, 250);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updateCutouts).catch(() => {});
    }

    window.addEventListener("resize", updateCutouts);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCutouts);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="imd-warning-banner"
      className="relative overflow-hidden rounded-2xl transition-all duration-300 bg-transparent"
      style={{
        border: `1px solid ${viewedStage.borderHex}`,
        boxShadow: "0 8px 32px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.1)",
      }}
    >
      {/* Background layer with punched-out cutouts revealing the page background beneath */}
      <div 
        className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: viewedStage.bgHex,
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          ...maskStyle,
        }}
      >
        {/* Noise Film-Grain Texture Overlay */}
        <div className="absolute inset-0 overflow-hidden opacity-75">
          <Noise patternSize={250} patternScaleX={1} patternScaleY={1} patternRefreshInterval={2} patternAlpha={12} />
        </div>

        {/* Atmospheric Ambient Gradient */}
        <div 
          className="absolute top-0 right-0 w-1/2 h-full blur-3xl opacity-20 transition-colors duration-500"
          style={{ backgroundColor: viewedStage.colorHex }}
        />
      </div>

      <div className="relative z-10 p-4 sm:p-5 flex flex-col gap-4">
        
        {/* Top Horizon Line: Protocol Tabs + Live Cycle Status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b pb-3"
          style={{ borderColor: "rgba(255,255,255,0.12)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#00F2FE] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" />
              IMD 4-Stage Warning Horizon:
            </span>
          </div>

          {/* Interactive 4-Stage Segmented Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[1, 2, 3, 4].map((sNum) => {
              const cfg = IMD_ALERT_STAGES[sNum];
              const isSelected = selectedStageFilter === sNum;
              const isLive = activeStage === sNum;

              return (
                <StagePillButton
                  key={sNum}
                  cfg={cfg}
                  isSelected={isSelected}
                  isLive={isLive}
                  onClick={() => onSelectStageFilter(sNum as AlertStageNumber)}
                />
              );
            })}
          </div>
        </div>

        {/* Core Directive & Live Countdown Grid */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          
          {/* LEFT: Directive Details & Operational Mandate */}
          <div className="flex items-start max-w-3xl">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <ShinyBadge
                  className="pointer-events-auto shadow-[0_4px_14px_rgba(0,0,0,0.35),0_1px_3px_rgba(0,0,0,0.2),0_0_10px_rgba(0,0,0,0.25)]"
                  roundedClassName="rounded-lg"
                  speed={3}
                  spread={80}
                  borderColor={viewedStage.borderHex}
                  borderShineColor="#ffffff"
                  surfaceColor={viewedStage.bgHex}
                  surfaceShineColor="rgba(255, 255, 255, 0.55)"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" style={{ color: viewedStage.colorHex }} />
                  <span className="font-semibold text-white text-xs tracking-wider uppercase font-rajdhani">
                    {viewedStage.name} • {viewedStage.subName}
                  </span>
                </ShinyBadge>
              </div>

              <h2 className="text-base sm:text-lg md:text-xl font-bold text-white font-rajdhani tracking-wide leading-snug [text-shadow:0_2px_8px_rgba(0,0,0,0.95),0_1px_3px_rgba(0,0,0,0.95)]">
                {viewedStage.description}
              </h2>
            </div>
          </div>

          {/* RIGHT: Live Ticking Countdown & Surge Metrics (Cutout Apertures) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 xl:justify-end shrink-0 pt-2 xl:pt-0 border-t xl:border-t-0 border-white/10">
            
            {/* 1. Countdown Box (Cutout Aperture) */}
            <div 
              ref={box1Ref}
              className="flex flex-col justify-between px-4 py-2.5 rounded-xl bg-transparent transition-all flex-shrink-0"
              style={{
                width: "215px",
                height: "82px",
                borderRadius: "0.75rem",
                border: `1px solid ${viewedStage.borderHex}`,
                boxShadow: `inset 0 2px 10px rgba(0,0,0,0.85), 0 0 12px ${viewedStage.colorHex}20`,
              }}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00F2FE] flex items-center gap-1.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_8px_rgba(0,242,254,0.35)]">
                <Clock className="w-3.5 h-3.5 text-[#00F2FE] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" />
                Next Advisory In
              </span>
              <div className="text-lg sm:text-xl font-orbitron font-extrabold text-[#00F2FE] tracking-wider [text-shadow:0_2px_6px_rgba(0,0,0,0.95),0_0_12px_rgba(0,242,254,0.4)] leading-tight">
                <span>{pad(hours)}</span>
                <span>:</span>
                <span>{pad(minutes)}</span>
                <span>:</span>
                <span>{pad(seconds)}</span>
              </div>
              <span className="text-[9px] font-mono text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_8px_rgba(0,242,254,0.3)] leading-tight">
                Synchronized • 06:00 IST Cycle
              </span>
            </div>

            {/* 2. Landfall & Surge Pill (Cutout Aperture) */}
            <div 
              ref={box2Ref}
              className="flex flex-col justify-between px-4 py-2.5 rounded-xl bg-transparent transition-all flex-shrink-0"
              style={{
                width: "215px",
                height: "82px",
                borderRadius: "0.75rem",
                border: `1px solid ${viewedStage.borderHex}`,
                boxShadow: `inset 0 2px 10px rgba(0,0,0,0.85), 0 0 12px ${viewedStage.colorHex}20`,
              }}
            >
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF5E36] flex items-center gap-1.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_8px_rgba(255,94,54,0.35)]">
                <Waves className="w-3.5 h-3.5 text-[#FF5E36] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]" />
                Projected Landfall
              </span>
              <div className="text-xs sm:text-sm font-bold text-[#FF5E36] font-mono truncate [text-shadow:0_2px_6px_rgba(0,0,0,0.95),0_0_12px_rgba(255,94,54,0.4)] leading-tight">
                {landfallTime}
              </div>
              <div className="text-xs font-mono font-bold text-[#FF5E36] [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_8px_rgba(255,94,54,0.3)] leading-tight">
                Peak Surge: +{surgeHeightM}m AAT
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
