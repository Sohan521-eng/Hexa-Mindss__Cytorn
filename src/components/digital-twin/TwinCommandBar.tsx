"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ShieldAlert, 
  Compass, 
  SlidersHorizontal,
  Flame,
  Waves
} from "lucide-react";
import { StormContext, DistrictInfo, RbacRole } from "./types";
import { STORMS_REGISTRY, DISTRICTS_REGISTRY } from "./digitalTwinData";
import Noise from "@/components/ui/Noise";
import { useGsapPill, PillButton } from "@/components/forecast/ForecastTopBar";

/* ─── Framer Motion Variants matching ForecastTopBar & RadiometricStrip ─── */
const PANEL_VARIANTS = {
  hidden: {
    opacity: 0,
    scale: 0.90,
    y: -14,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      staggerChildren: 0.045,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -10,
    filter: "blur(6px)",
    transition: {
      duration: 0.25,
      ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
    },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -8, y: -2 },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

/* ─── 1. Cyber Storm Selector Pill Dropdown ─── */
function TwinStormSelectorPill({
  selectedStorm,
  onSelectStorm,
}: {
  selectedStorm: StormContext;
  onSelectStorm: (storm: StormContext) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const { btnRef, circleRef, handleEnter, handleLeave } = useGsapPill(selectedStorm.id);

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

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <PillButton
        btnRef={btnRef}
        circleRef={circleRef}
        handleEnter={handleEnter}
        handleLeave={handleLeave}
        open={open}
        onClick={() => { if (!open) updateDropPos(); setOpen((o) => !o); }}
        icon={<Flame style={{ width: 14, height: 14 }} />}
        label={
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] opacity-75 font-normal">STORM:</span>
            <span>{selectedStorm.name} ({selectedStorm.code})</span>
            <ChevronDown style={{ width: 12, height: 12, opacity: 0.7, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </span>
        }
        style={{
          height: "36px",
          padding: "0 12px",
          borderRadius: "0.5rem",
        }}
      />
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              key="storm-selector-dropdown"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={PANEL_VARIANTS}
              style={{ position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 9999, transformOrigin: "top left" }}
              className="min-w-[280px] bg-[#0F1B2F]/95 backdrop-blur-xl border border-[rgba(0,242,254,0.45)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(0,242,254,0.18)] transform-gpu overflow-hidden"
            >
              <Noise patternSize={250} patternScaleX={2.5} patternScaleY={2.5} patternRefreshInterval={2} patternAlpha={10} />
              <div className="relative z-10 flex flex-col space-y-1">
                {Object.values(STORMS_REGISTRY).map((storm) => {
                  const active = storm.id === selectedStorm.id;
                  return (
                    <motion.button
                      key={storm.id}
                      variants={ITEM_VARIANTS}
                      type="button"
                      onClick={() => { onSelectStorm(storm); setOpen(false); }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                        active
                          ? "bg-[rgba(0,242,254,0.14)] border-[rgba(0,242,254,0.5)] shadow-[0_0_12px_rgba(0,242,254,0.22)]"
                          : "bg-transparent border-transparent hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${active ? "bg-[#FF5E36]/20 text-[#FF5E36]" : "bg-white/5 text-[#8E9EB5]"}`}>
                          <Flame className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold font-rajdhani uppercase tracking-wider truncate ${active ? "text-[#00F2FE]" : "text-white"}`}>{storm.name} ({storm.code})</div>
                          <div className="text-[10px] text-[#8E9EB5] font-mono leading-tight truncate">{storm.basin}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                        active
                          ? "bg-[#FF5E36]/15 text-[#FF5E36] border-[#FF5E36]/40"
                          : "bg-white/5 text-[#8E9EB5] border-white/10"
                      }`}>
                        {storm.category.split(" ")[0]}
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

/* ─── 2. Cyber Coastal District Selector Pill Dropdown ─── */
function TwinDistrictSelectorPill({
  selectedDistrict,
  onSelectDistrict,
}: {
  selectedDistrict: DistrictInfo;
  onSelectDistrict: (district: DistrictInfo) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const { btnRef, circleRef, handleEnter, handleLeave } = useGsapPill(selectedDistrict.id);

  useEffect(() => { setMounted(true); }, []);

  const updateDropPos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropWidth = 260;
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

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <PillButton
        btnRef={btnRef}
        circleRef={circleRef}
        handleEnter={handleEnter}
        handleLeave={handleLeave}
        open={open}
        onClick={() => { if (!open) updateDropPos(); setOpen((o) => !o); }}
        icon={<Compass style={{ width: 14, height: 14 }} />}
        label={
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] opacity-75 font-normal">DISTRICT:</span>
            <span>{selectedDistrict.name}, {selectedDistrict.state}</span>
            <ChevronDown style={{ width: 12, height: 12, opacity: 0.7, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </span>
        }
        style={{
          height: "36px",
          padding: "0 12px",
          borderRadius: "0.5rem",
        }}
      />
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              key="district-selector-dropdown"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={PANEL_VARIANTS}
              style={{ position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 9999, transformOrigin: "top left" }}
              className="min-w-[260px] bg-[#0F1B2F]/95 backdrop-blur-xl border border-[rgba(0,242,254,0.45)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(0,242,254,0.18)] transform-gpu overflow-hidden"
            >
              <Noise patternSize={250} patternScaleX={2.5} patternScaleY={2.5} patternRefreshInterval={2} patternAlpha={10} />
              <div className="relative z-10 flex flex-col space-y-1">
                {Object.values(DISTRICTS_REGISTRY).map((district) => {
                  const active = district.id === selectedDistrict.id;
                  return (
                    <motion.button
                      key={district.id}
                      variants={ITEM_VARIANTS}
                      type="button"
                      onClick={() => { onSelectDistrict(district); setOpen(false); }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                        active
                          ? "bg-[rgba(0,242,254,0.14)] border-[rgba(0,242,254,0.5)] shadow-[0_0_12px_rgba(0,242,254,0.22)]"
                          : "bg-transparent border-transparent hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${active ? "bg-[#00F2FE]/20 text-[#00F2FE]" : "bg-white/5 text-[#8E9EB5]"}`}>
                          <Compass className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold font-rajdhani uppercase tracking-wider truncate ${active ? "text-[#00F2FE]" : "text-white"}`}>{district.name}</div>
                          <div className="text-[10px] text-[#8E9EB5] font-mono leading-tight truncate">{district.state} • {district.coastalLengthKm}km Coast</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                        active
                          ? "bg-amber-400/15 text-amber-300 border-amber-400/40"
                          : "bg-white/5 text-[#8E9EB5] border-white/10"
                      }`}>
                        RISK {district.riskScore}
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

/* ─── 3. Cyber Surge Threshold Selector Pill Dropdown ─── */
function TwinSurgeSelectorPill({
  surgeLevel,
  onSelectSurgeLevel,
}: {
  surgeLevel: number;
  onSelectSurgeLevel: (lvl: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const { btnRef, circleRef, handleEnter, handleLeave } = useGsapPill(surgeLevel);
  const surgePresets = [1.0, 1.5, 2.0, 3.2, 3.4, 4.2, 4.5, 5.0];

  useEffect(() => { setMounted(true); }, []);

  const updateDropPos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropWidth = 260;
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

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <PillButton
        btnRef={btnRef}
        circleRef={circleRef}
        handleEnter={handleEnter}
        handleLeave={handleLeave}
        open={open}
        onClick={() => { if (!open) updateDropPos(); setOpen((o) => !o); }}
        icon={<SlidersHorizontal style={{ width: 14, height: 14 }} />}
        label={
          <span className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] opacity-75 font-normal">SURGE:</span>
            <span>+{surgeLevel.toFixed(1)}m AAT {surgeLevel >= 4.0 ? "(Catastrophic)" : surgeLevel >= 3.0 ? "(Severe)" : ""}</span>
            <ChevronDown style={{ width: 12, height: 12, opacity: 0.7, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </span>
        }
        style={{
          height: "36px",
          padding: "0 12px",
          borderRadius: "0.5rem",
        }}
      />
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              key="surge-selector-dropdown"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={PANEL_VARIANTS}
              style={{ position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 9999, transformOrigin: "top left" }}
              className="min-w-[260px] bg-[#0F1B2F]/95 backdrop-blur-xl border border-[rgba(0,242,254,0.45)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(0,242,254,0.18)] transform-gpu overflow-hidden"
            >
              <Noise patternSize={250} patternScaleX={2.5} patternScaleY={2.5} patternRefreshInterval={2} patternAlpha={10} />
              <div className="relative z-10 flex flex-col space-y-1">
                {surgePresets.map((lvl) => {
                  const active = Math.abs(lvl - surgeLevel) < 0.05;
                  const tier = lvl >= 4.5 ? "TIER 4" : lvl >= 3.0 ? "TIER 3" : lvl >= 1.5 ? "TIER 2" : "TIER 1";
                  const tierColor = lvl >= 4.5 ? "#D946EF" : lvl >= 3.0 ? "#EF4444" : lvl >= 1.5 ? "#F59E0B" : "#00F2FE";
                  const desc = lvl >= 4.5 ? "Catastrophic Intrusion" : lvl >= 3.0 ? "Structural Failure" : lvl >= 1.5 ? "Roadway Submersion" : "Beachfront Wash-Over";
                  return (
                    <motion.button
                      key={lvl}
                      variants={ITEM_VARIANTS}
                      type="button"
                      onClick={() => { onSelectSurgeLevel(lvl); setOpen(false); }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                        active
                          ? "bg-[rgba(0,242,254,0.14)] border-[rgba(0,242,254,0.5)] shadow-[0_0_12px_rgba(0,242,254,0.22)]"
                          : "bg-transparent border-transparent hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${active ? "bg-[#10E7A2]/20 text-[#10E7A2]" : "bg-white/5 text-[#8E9EB5]"}`}>
                          <Waves className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold font-rajdhani uppercase tracking-wider truncate ${active ? "text-[#00F2FE]" : "text-white"}`}>+{lvl.toFixed(1)}m Surge</div>
                          <div className="text-[10px] text-[#8E9EB5] font-mono leading-tight truncate">{desc}</div>
                        </div>
                      </div>
                      <span 
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0"
                        style={{
                          backgroundColor: `${tierColor}1A`,
                          color: tierColor,
                          borderColor: `${tierColor}66`,
                        }}
                      >
                        {tier}
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

interface TwinCommandBarProps {
  selectedStorm: StormContext;
  onSelectStorm: (storm: StormContext) => void;
  selectedDistrict: DistrictInfo;
  onSelectDistrict: (district: DistrictInfo) => void;
  surgeLevel: number;
  onSelectSurgeLevel: (level: number) => void;
  rbacRole: RbacRole;
  onChangeRbacRole: (role: RbacRole) => void;
}

export function TwinCommandBar({
  selectedStorm,
  onSelectStorm,
  selectedDistrict,
  onSelectDistrict,
  surgeLevel,
  onSelectSurgeLevel,
  rbacRole,
  onChangeRbacRole,
}: TwinCommandBarProps) {
  return (
    <header 
      id="twin-command-bar"
      className="relative z-30 w-full rounded-2xl overflow-hidden px-3 sm:px-6 py-3 transition-all duration-200 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.45)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.15)",
      }}
    >
      {/* Background layer with Noise & subtle ambient cyan glow */}
      <div className="absolute inset-0 bg-[#0F1B2F]/85 backdrop-blur-xl pointer-events-none rounded-2xl overflow-hidden">
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={25}
        />
        <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left Section: Title & Subtitle */}
        <div className="flex flex-col justify-center">
          <h1 className="text-lg sm:text-xl md:text-2xl font-black font-rajdhani uppercase tracking-wider flex items-center leading-tight">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                DIGITAL TWIN
              </span>
            </span>
          </h1>
          <p 
            className="text-[10px] sm:text-xs font-rajdhani font-medium text-[#00F2FE] hidden md:block mt-0.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] tracking-wide"
          >
            Hyper-Local Coastal Inundation &amp; Sub-Street Hydrodynamic Simulation
          </p>
        </div>

        {/* Center: Operational Selectors (Storm, District, Surge) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* 1. Storm Context Selector Pill */}
          <TwinStormSelectorPill
            selectedStorm={selectedStorm}
            onSelectStorm={onSelectStorm}
          />

          {/* 2. Coastal District Selector Pill */}
          <TwinDistrictSelectorPill
            selectedDistrict={selectedDistrict}
            onSelectDistrict={onSelectDistrict}
          />

          {/* 3. Surge Threshold Selector Pill */}
          <TwinSurgeSelectorPill
            surgeLevel={surgeLevel}
            onSelectSurgeLevel={onSelectSurgeLevel}
          />

        </div>

        {/* Right Section: RBAC Badge & Pulsing Warning Indicator */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* RBAC Role Selector Badge */}
          <div className="flex items-center rounded-lg bg-[#050B14]/80 p-0.5 border border-[#1E3A5F]">
            <button
              onClick={() => onChangeRbacRole("scientist")}
              className={`px-2 py-1 rounded text-[10px] font-rajdhani font-bold transition-all ${
                rbacRole === "scientist"
                  ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/50 shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Scientist Access: 10m High-Resolution DEM Mesh"
            >
              10m MESH
            </button>
            <button
              onClick={() => onChangeRbacRole("eoc")}
              className={`px-2 py-1 rounded text-[10px] font-rajdhani font-bold transition-all ${
                rbacRole === "eoc"
                  ? "bg-[#10E7A2]/20 text-[#10E7A2] border border-[#10E7A2]/50 shadow-[0_0_8px_rgba(16,231,162,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Disaster EOC: District Evacuation Matrix"
            >
              EOC MATRIX
            </button>
            <button
              onClick={() => onChangeRbacRole("public")}
              className={`px-2 py-1 rounded text-[10px] font-rajdhani font-bold transition-all ${
                rbacRole === "public"
                  ? "bg-[#FF5E36]/20 text-[#FF5E36] border border-[#FF5E36]/50 shadow-[0_0_8px_rgba(255,94,54,0.3)]"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Public Access: 1km Zonal Flood View"
            >
              ZONAL
            </button>
          </div>

          {/* Pulsing IMD Stage 3 Warning Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#FF5E36]/15 border border-[#FF5E36]/40 text-[#FF5E36] shadow-[0_0_15px_rgba(255,94,54,0.25)] animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-chakra font-bold tracking-wider uppercase">
                STAGE 3 WARNING
              </span>
              <span className="text-[9px] font-jetbrains font-bold text-amber-300">
                ETA T-{selectedStorm.landfallEtaHours}H
              </span>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
