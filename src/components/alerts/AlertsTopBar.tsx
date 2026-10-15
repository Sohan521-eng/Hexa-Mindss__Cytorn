"use client";

import React, { useRef, useState, useEffect } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;
import { 
  Radio, 
  MapPin, 
  ChevronDown, 
  PhoneCall, 
  Waves
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import Noise from "@/components/ui/Noise";
import { DistrictVulnerability } from "./types";
import { gsap } from "gsap";
import { useGsapPill, PillButton } from "@/components/forecast/ForecastTopBar";

const PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.96, y: -6 },
  visible: {
    opacity: 1, scale: 1, y: 0,
    transition: {
      duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      staggerChildren: 0.04, delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0, scale: 0.96, y: -4,
    transition: { duration: 0.15, ease: [0.42, 0, 0.58, 1] as [number, number, number, number] },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -8, y: -2 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

const COASTAL_STATES = [
  { id: "All States", name: "All Coastal States", basin: "East & West Coast Threat Sectors" },
  { id: "Odisha", name: "Odisha", basin: "Bay of Bengal (Puri / Dhamra)" },
  { id: "West Bengal", name: "West Bengal", basin: "Bay of Bengal (Sundarbans / Digha)" },
  { id: "Andhra Pradesh", name: "Andhra Pradesh", basin: "Bay of Bengal (Visakhapatnam / Kakinada)" },
  { id: "Tamil Nadu", name: "Tamil Nadu", basin: "Bay of Bengal (Chennai / Nagapattinam)" },
  { id: "Gujarat", name: "Gujarat", basin: "Arabian Sea (Kutch / Saurashtra)" },
];

/* ─── State Selector Pill — matches ForecastTopBar StormSelectorPill styling and animations ─── */
function StateSelectorPill({
  selectedState,
  onSelectState,
}: {
  selectedState: string;
  onSelectState: (state: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const { btnRef, circleRef, handleEnter, handleLeave } = useGsapPill(selectedState);

  useEffect(() => { setMounted(true); }, []);

  const updateDropPos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropWidth = 280;
      let left = r.left;
      if (typeof window !== "undefined" && left + dropWidth > window.innerWidth - 12) {
        left = Math.max(12, window.innerWidth - dropWidth - 12);
      }
      setDropPos({ top: r.bottom + 6, left });
    }
  };

  useEffect(() => {
    if (!open) return;
    updateDropPos();
    const h = () => updateDropPos();
    window.addEventListener("scroll", h, true);
    window.addEventListener("resize", h);
    return () => { 
      window.removeEventListener("scroll", h, true); 
      window.removeEventListener("resize", h); 
    };
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!wrapRef.current?.contains(t) && !dropdownRef.current?.contains(t)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayLabel = selectedState === "All States" ? "ALL COASTAL STATES" : `STATE: ${selectedState.toUpperCase()}`;

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <PillButton
        btnRef={btnRef}
        circleRef={circleRef}
        handleEnter={handleEnter}
        handleLeave={handleLeave}
        open={open}
        onClick={() => { if (!open) updateDropPos(); setOpen((o) => !o); }}
        icon={<MapPin style={{ width: 14, height: 14 }} />}
        label={displayLabel}
        style={{
          height: "42px",
          minWidth: "210px",
          borderRadius: "0.75rem",
          border: `1.5px solid ${open ? "#00F2FE" : "rgba(0,242,254,0.65)"}`,
          boxShadow: open
            ? "0 12px 32px -2px rgba(0,0,0,0.95), 0 0 24px rgba(0,242,254,0.7), inset 0 1px 0 rgba(255,255,255,0.4)"
            : "0 4px 16px -2px rgba(0,0,0,0.85), 0 0 14px rgba(0,242,254,0.2), inset 0 1px 0 rgba(224,252,255,0.4)",
          padding: "0 16px",
        }}
      />
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              key="state-selector-dropdown"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={PANEL_VARIANTS}
              style={{ position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 9999, transformOrigin: "top left" }}
              className="min-w-[280px] bg-[#0F1B2F]/95 backdrop-blur-xl border border-[rgba(0,242,254,0.45)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(0,242,254,0.18)] transform-gpu overflow-hidden"
            >
              <Noise patternSize={250} patternScaleX={2.5} patternScaleY={2.5} patternRefreshInterval={2} patternAlpha={10} />
              <div className="relative z-10 flex flex-col space-y-1">
                {COASTAL_STATES.map((st) => {
                  const active = st.id === selectedState;
                  return (
                    <motion.button
                      key={st.id}
                      variants={ITEM_VARIANTS}
                      type="button"
                      onClick={() => { onSelectState(st.id); setOpen(false); }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                        active
                          ? "bg-[rgba(0,242,254,0.14)] border-[rgba(0,242,254,0.5)] shadow-[0_0_12px_rgba(0,242,254,0.22)]"
                          : "bg-transparent border-transparent hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center ${active ? "bg-[#00F2FE]/20 text-[#00F2FE]" : "bg-white/5 text-[#8E9EB5]"}`}>
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div>
                          <div className={`text-xs font-bold font-rajdhani uppercase tracking-wider ${active ? "text-[#00F2FE]" : "text-white"}`}>
                            {st.name}
                          </div>
                          <div className="text-[10px] text-[#8E9EB5] font-mono leading-tight">
                            {st.basin}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        active
                          ? "bg-[#10E7A2]/15 text-[#10E7A2] border-[#10E7A2]/40"
                          : "bg-white/5 text-[#8E9EB5] border-white/10"
                      }`}>
                        {active ? "ACTIVE" : "SELECT"}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

interface AlertsTopBarProps {
  stormName: string;
  stormCode: string;
  selectedState: string;
  onSelectState: (state: string) => void;
  allDistricts: DistrictVulnerability[];
  activeStage: number;
}

/* ─── GSAP Interactive Expanding Pill Button for EOC Hotline ─── */
function EocHotlinePill() {
  const pillRef = useRef<HTMLAnchorElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    let active = true;
    const layout = () => {
      if (!active) return;
      const circle = circleRef.current;
      const pill = pillRef.current;
      if (!circle || !pill) return;

      const w = pill.offsetWidth || pill.getBoundingClientRect().width;
      const h = pill.offsetHeight || pill.getBoundingClientRect().height;
      if (w === 0 || h === 0) return;

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

      const label = pill.querySelector<HTMLElement>(".pill-label");
      const hover = pill.querySelector<HTMLElement>(".pill-label-hover");

      if (label) gsap.set(label, { y: 0 });
      if (hover) gsap.set(hover, { y: h + 12, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });

      tl.to(circle, { scale: 1.5, xPercent: -50, duration: 1.2, ease: "power2.easeOut", overwrite: "auto" }, 0);
      if (label) tl.to(label, { y: -(h + 8), duration: 1.2, ease: "power2.easeOut", overwrite: "auto" }, 0);
      if (hover) {
        gsap.set(hover, { y: Math.ceil(h + 80), opacity: 0 });
        tl.to(hover, { y: 0, opacity: 1, duration: 1.2, ease: "power2.easeOut", overwrite: "auto" }, 0);
      }
      tlRef.current = tl;
    };

    layout();
    const timer = setTimeout(layout, 250);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleEnter = () => {
    tlRef.current?.tweenTo(tlRef.current.duration(), { duration: 0.3, ease: "power2.easeOut", overwrite: "auto" });
  };
  const handleLeave = () => {
    tlRef.current?.tweenTo(0, { duration: 0.25, ease: "power2.easeOut", overwrite: "auto" });
  };

  return (
    <a
      ref={pillRef}
      href="tel:1078"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="National Disaster Management Helpline (Toll-Free 1078)"
      className="relative overflow-hidden inline-flex items-center justify-center px-4 rounded-xl bg-gradient-to-r from-red-600/30 via-red-500/20 to-red-600/30 text-white font-rajdhani font-bold text-[13px] uppercase tracking-[0.05em] transition-all group cursor-pointer flex-shrink-0"
      style={{
        height: "42px",
        minWidth: "210px",
        borderRadius: "0.75rem",
        border: "1.5px solid #EF4444",
        boxShadow: "0 4px 16px -2px rgba(0,0,0,0.85), 0 0 16px rgba(239,68,68,0.4), inset 0 1px 0 rgba(255,255,255,0.25)",
      }}
    >
      {/* GSAP expanding background circle */}
      <span
        ref={circleRef}
        className="absolute left-1/2 rounded-full pointer-events-none bg-gradient-to-r from-red-500 to-rose-600 z-0"
      />
      {/* Default Label */}
      <span className="pill-label relative z-10 flex items-center gap-2">
        <PhoneCall className="w-3.5 h-3.5 text-red-400" />
        <span>EOC Hotline: 1078</span>
      </span>
      {/* Hover Reveal Label */}
      <span className="pill-label-hover absolute z-10 flex items-center gap-1.5 text-white font-bold tracking-wider">
        <PhoneCall className="w-3.5 h-3.5 text-white" />
        <span>DIAL NDMA 1078</span>
      </span>
    </a>
  );
}

export function AlertsTopBar({
  stormName,
  stormCode,
  selectedState,
  onSelectState,
  allDistricts,
  activeStage,
}: AlertsTopBarProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const activeCycloneRef = useRef<HTMLDivElement | null>(null);
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

  // SVG mask to punch out the Active Cyclone chip from the header background
  useIsomorphicLayoutEffect(() => {
    const updateCutouts = () => {
      if (!headerRef.current || !activeCycloneRef.current) return;
      const headerRect = headerRef.current.getBoundingClientRect();
      const chipRect = activeCycloneRef.current.getBoundingClientRect();
      if (headerRect.width === 0 || headerRect.height === 0 || chipRect.width === 0 || chipRect.height === 0) return;

      const cw = Math.round(headerRect.width);
      const ch = Math.round(headerRect.height);

      const x = Math.round(chipRect.left - headerRect.left);
      const y = Math.round(chipRect.top - headerRect.top);
      const w = Math.round(chipRect.width);
      const h = Math.round(chipRect.height);
      const r = 12; // rounded-xl radius

      // SVG path with fill-rule="evenodd": outer rect filled, chip aperture cut out
      const path = `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}"><path fill-rule="evenodd" fill="#000" d="M 0 0 H ${cw} V ${ch} H 0 Z ${path}" /></svg>`;
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
    if (headerRef.current) resizeObserver.observe(headerRef.current);
    if (activeCycloneRef.current) resizeObserver.observe(activeCycloneRef.current);

    const timer = setTimeout(updateCutouts, 60);
    if (typeof document !== "undefined" && document.fonts) {
      document.fonts.ready.then(updateCutouts).catch(() => {});
    }

    window.addEventListener("resize", updateCutouts);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCutouts);
    };
  }, []);

  return (
    <header 
      ref={headerRef}
      id="alerts-top-bar"
      className="w-full rounded-xl p-3 sm:p-4 mb-4 relative overflow-hidden transition-all duration-200 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.18)",
      }}
    >
      {/* Background layer with punched-out cutout revealing the page background beneath */}
      <div 
        className="absolute inset-0 bg-[#0F1B2F]/95 backdrop-blur-md pointer-events-none rounded-xl overflow-hidden"
        style={maskStyle}
      >
        {/* Noise film-grain overlay — exactly matches RadiometricStrip & ForecastTopBar */}
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={12}
        />

        {/* Atmospheric cyan/blue ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        
        {/* Left: Mission Brand & Title */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-2">
              <span className="heading-gradient-shadow-wrapper">
                <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                  Coastal Alert & Decision Hub
                </span>
              </span>
            </h1>
            <p className="text-xs text-[#00F2FE] font-medium font-sans hidden sm:block [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              Multi-agency emergency management, hydrodynamic surge monitoring, and automated CAP broadcast mesh
            </p>
          </div>

        {/* Right: Operational Controls & Authority Badges */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Active Storm Indicator Chip (Cutout Aperture) */}
          <div 
            ref={activeCycloneRef}
            className="flex items-center justify-center px-4 rounded-xl bg-transparent transition-all flex-shrink-0"
            style={{
              height: "42px",
              minWidth: "210px",
              borderRadius: "0.75rem",
              border: "1.5px solid rgba(0, 242, 254, 0.55)",
              boxShadow: "inset 0 2px 8px rgba(0,0,0,0.85), 0 0 14px rgba(0,242,254,0.18)",
            }}
          >
            <div className="flex flex-col justify-center text-center">
              <span className="text-[9px] uppercase tracking-wider text-[#00F2FE]/75 font-mono font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] leading-tight">
                Active Cyclone
              </span>
              <span className="text-xs font-bold text-[#00F2FE] font-mono flex items-center justify-center gap-1 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] leading-tight mt-0.5">
                {stormName} <span>({stormCode})</span>
              </span>
            </div>
          </div>

          {/* State Filter Selector Pill (Matches ForecastTopBar StormSelectorPill) */}
          <StateSelectorPill selectedState={selectedState} onSelectState={onSelectState} />

          {/* EOC Hotline Pill with GSAP circular hover physics */}
          <EocHotlinePill />
        </div>

      </div>
    </header>
  );
}
