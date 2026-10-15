"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  Truck, 
  Users, 
  Building2, 
  AlertTriangle, 
  FileCheck, 
  MapPin, 
  Clock,
  Send,
  Lock
} from "lucide-react";
import { DistrictVulnerability, EvacuationOrderData } from "./types";
import { DEFAULT_EVACUATION_ORDER } from "./alertsData";

import Noise from "@/components/ui/Noise";
import { Scanner } from "@/components/ui/Scanner";
import { GlareHover } from "@/components/ui/GlareHover";
import { gsap } from "gsap";

/* ─── Curfew Pill Button (Matches SC / ScientistProfilePill styling & GSAP roll effect in Crimson Red) ─── */
function CurfewPillButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    let isMounted = true;
    const layout = () => {
      if (!isMounted) return;
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

      tl.to(circle, { scale: 1.5, xPercent: -50, duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);

      if (label) {
        tl.to(label, { y: -(h + 8), duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
      }

      if (hover) {
        gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(hover, { y: 0, opacity: 1, duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
      }

      tlRef.current = tl;
    };

    layout();
    const timer = setTimeout(layout, 150);

    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [active]);

  const handleEnter = () => {
    tlRef.current?.tweenTo(tlRef.current.duration(), {
      duration: 0.3,
      ease: "power2.easeOut",
      overwrite: "auto",
    });
  };

  const handleLeave = () => {
    tlRef.current?.tweenTo(0, {
      duration: 0.25,
      ease: "power2.easeOut",
      overwrite: "auto",
    });
  };

  if (!active) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="scientist-pill-muted relative z-10 shrink-0 cursor-pointer"
        title="Toggle Coastal Travel Curfew"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
        <span>OPTIONAL</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      ref={pillRef}
      onClick={onClick}
      className="scientist-pill-red relative z-10 shrink-0 cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Toggle Coastal Travel Curfew"
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-85" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#EF4444] shadow-[0_0_8px_#EF4444]" />
          </span>
          <span>CURFEW ACTIVE</span>
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#050B14] shrink-0" />
          <span>CURFEW ACTIVE</span>
        </span>
      </span>
    </button>
  );
}

/* ─── Cancel Pill Button (Matches styling & GSAP roll effect in slate/neutral) ─── */
function CancelPillButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    let isMounted = true;
    const layout = () => {
      if (!isMounted) return;
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

      tl.to(circle, { scale: 1.5, xPercent: -50, duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);

      if (label) {
        tl.to(label, { y: -(h + 8), duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
      }

      if (hover) {
        gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(hover, { y: 0, opacity: 1, duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
      }

      tlRef.current = tl;
    };

    layout();
    const timer = setTimeout(layout, 150);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const handleEnter = () => {
    tlRef.current?.tweenTo(tlRef.current.duration(), {
      duration: 0.3,
      ease: "power2.easeOut",
      overwrite: "auto",
    });
  };

  const handleLeave = () => {
    tlRef.current?.tweenTo(0, {
      duration: 0.25,
      ease: "power2.easeOut",
      overwrite: "auto",
    });
  };

  return (
    <button
      type="button"
      ref={pillRef}
      onClick={onClick}
      className="scientist-pill-slate relative z-10 shrink-0 cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Cancel Order"
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          <span>Cancel</span>
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <span>Cancel</span>
        </span>
      </span>
    </button>
  );
}

/* ─── Sign & Issue Order Pill Button (Matches styling & GSAP roll effect in crimson red) ─── */
function SignOrderPillButton({
  onClick,
  isSubmitting,
  isSuccess,
}: {
  onClick: () => void;
  isSubmitting: boolean;
  isSuccess: boolean;
}) {
  const pillRef = useRef<HTMLButtonElement | null>(null);
  const circleRef = useRef<HTMLSpanElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    let isMounted = true;
    const layout = () => {
      if (!isMounted) return;
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

      tl.to(circle, { scale: 1.5, xPercent: -50, duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);

      if (label) {
        tl.to(label, { y: -(h + 8), duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
      }

      if (hover) {
        gsap.set(hover, { y: Math.ceil(h + 100), opacity: 0 });
        tl.to(hover, { y: 0, opacity: 1, duration: 1.6, ease: "power2.easeOut", overwrite: "auto" }, 0);
      }

      tlRef.current = tl;
    };

    layout();
    const timer = setTimeout(layout, 150);
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [isSubmitting, isSuccess]);

  const handleEnter = () => {
    if (isSubmitting || isSuccess) return;
    tlRef.current?.tweenTo(tlRef.current.duration(), {
      duration: 0.3,
      ease: "power2.easeOut",
      overwrite: "auto",
    });
  };

  const handleLeave = () => {
    if (isSubmitting || isSuccess) return;
    tlRef.current?.tweenTo(0, {
      duration: 0.25,
      ease: "power2.easeOut",
      overwrite: "auto",
    });
  };

  return (
    <button
      type="button"
      ref={pillRef}
      onClick={onClick}
      disabled={isSubmitting || isSuccess}
      className={`scientist-pill-red relative z-10 shrink-0 cursor-pointer shadow-[0_0_24px_rgba(239,68,68,0.35)] ${
        isSuccess ? "!border-emerald-500 !bg-emerald-950/50 !text-emerald-400 !shadow-[0_0_24px_rgba(16,185,129,0.4)]" : ""
      }`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Sign & Issue Mandatory Evacuation Order"
    >
      <span 
        className="hover-circle" 
        aria-hidden="true" 
        ref={circleRef} 
        style={isSuccess ? { background: "#10B981" } : undefined}
      />
      <span className="label-stack">
        <span className="pill-label">
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ORDER DISPATCHED TO STATE POLICE & SDRF</span>
            </>
          ) : isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin shrink-0" />
              <span>SIGNING WITH NDMA PKI TOKEN...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-[#FF453A] shrink-0" />
              <span>SIGN & ISSUE MANDATORY EVACUATION ORDER</span>
            </>
          )}
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          {isSuccess ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-[#050B14] shrink-0" />
              <span>ORDER DISPATCHED TO STATE POLICE & SDRF</span>
            </>
          ) : isSubmitting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-[#050B14] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>SIGNING WITH NDMA PKI TOKEN...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-[#050B14] shrink-0" />
              <span>SIGN & ISSUE MANDATORY EVACUATION ORDER</span>
            </>
          )}
        </span>
      </span>
    </button>
  );
}

interface EvacuationOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  district: DistrictVulnerability | null;
}

export function EvacuationOrderModal({
  isOpen,
  onClose,
  district,
}: EvacuationOrderModalProps) {
  const [curfewActive, setCurfewActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !district) return null;

  // Synthesize order details based on selected district
  const orderData: EvacuationOrderData = {
    ...DEFAULT_EVACUATION_ORDER,
    districtId: district.id,
    districtName: district.name,
    stateName: district.state,
    priorityScore: district.evacuationPriority,
    totalPopulationToEvacuate: district.populationAtRisk,
    designatedSheltersCount: district.sheltersTotal,
  };

  const handleIssueOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl max-h-[calc(100vh-2.5rem)] flex flex-col my-auto rounded-2xl bg-transparent border border-red-500/50 shadow-[0_20px_60px_rgba(213,0,0,0.5)] overflow-hidden text-xs text-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal background layer (Emergency Crimson Red) */}
        <div className="absolute inset-0 bg-[#160608] pointer-events-none rounded-2xl overflow-hidden">
          <Noise patternSize={250} patternScaleX={1} patternScaleY={1} patternRefreshInterval={3} patternAlpha={10} />
        </div>

        {/* Modal Top Ribbon */}
        <div className="relative z-10 shrink-0 p-3.5 sm:p-4 bg-gradient-to-r from-red-950 via-[#180507] to-red-950 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(213,0,0,0.5)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-red-400 font-extrabold uppercase tracking-wider">
                GOVERNMENT OF {district.state.toUpperCase()} • EMERGENCY DISASTER POWERS ACT
              </div>
              <h2 className="text-sm sm:text-base font-bold text-[#EF4444] font-orbitron [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                Mandatory Evacuation & Convoy Dispatch Order
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative z-10 flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Target District Header Banner (Cutout Aperture revealing App Background) */}
          <div className="relative p-3.5 rounded-xl border border-red-500/50 shadow-none flex flex-wrap items-center justify-between gap-3 overflow-hidden">
            {/* The Live App Background (Scanner WebGL Atmospheric Background) visible through this cutout */}
            <div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden bg-[#050B14]">
              <Scanner
                color1="#0094ff"
                color2="#00eaff"
                color3="#ff6d07"
                speed={0.5}
                sweepSpeed={0.5}
                sweepWidth={2}
                sweepFalloff={6}
                scale={1.5}
                frequency={2}
                ripple={0.25}
                bandDensity={11}
                lineSharpness={4}
                glow={0}
                scanDirection="vertical"
                colorSpread={1}
                brightness={1.0}
                contrast={1.5}
                softness={3}
                vignette={0.7}
                scanline={true}
                grain={false}
                grainIntensity={0}
                opacity={0.9}
                className="w-full h-full"
              />
            </div>

            <div className="relative z-10">
              <div className="text-[10px] font-mono text-slate-300 uppercase tracking-wider font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                Target Jurisdiction:
              </div>
              <div className="text-base sm:text-lg font-bold text-white font-rajdhani tracking-wide [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                {district.name} District ({district.state})
              </div>
              <div className="text-[11px] font-mono text-red-400 font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                Priority: 🔴 {district.evacuationPriority} (Shoreline Exposure: {district.distanceToCoastKm} km)
              </div>
            </div>

            <div className="relative z-10 text-right font-mono text-xs">
              <div className="text-slate-300 text-[10px] [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] font-semibold">
                Order Reference ID:
              </div>
              <div className="text-[#00F2FE] font-bold text-sm [text-shadow:0_0_8px_rgba(0,242,254,0.6)]">
                {orderData.orderId}
              </div>
              <div className="text-slate-300 text-[10px] [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                Issued at: {orderData.timestampIst}
              </div>
            </div>
          </div>

          {/* Evacuation Zones Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-chakra font-bold text-[#EF4444] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
              <span>Evacuation Zones & Targeted Civilian Density</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40">
                <span className="text-red-400 font-bold block text-[11px]">ZONE A (0 - 2 km)</span>
                <span className="text-white text-xs block font-bold mt-1">100% Mandatory Evac</span>
                <span className="text-slate-400 text-[10px] block">Beachfront hamlets & thatch huts</span>
                <span className="text-red-300 text-[10px] block mt-1">Est. Pop: 185,000</span>
              </div>

              <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-500/40">
                <span className="text-orange-400 font-bold block text-[11px]">ZONE B (2 - 5 km)</span>
                <span className="text-white text-xs block font-bold mt-1">High Priority Move</span>
                <span className="text-slate-400 text-[10px] block">Low-lying agrarian tracts</span>
                <span className="text-orange-300 text-[10px] block mt-1">Est. Pop: 160,000</span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30">
                <span className="text-amber-400 font-bold block text-[11px]">ZONE C (5 - 10 km)</span>
                <span className="text-white text-xs block font-bold mt-1">Inland Buffer Standby</span>
                <span className="text-slate-400 text-[10px] block">Reinforced masonry structures</span>
                <span className="text-amber-300 text-[10px] block mt-1">Est. Pop: 83,000</span>
              </div>
            </div>
          </div>

          {/* Deployed Emergency Resources (Cutout Aperture revealing App Background) */}
          <div className="relative p-3.5 rounded-xl border border-red-500/50 shadow-none space-y-2.5 overflow-hidden">
            {/* The Live App Background (Scanner WebGL Atmospheric Background) visible through this cutout */}
            <div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden bg-[#050B14]">
              <Scanner
                color1="#0094ff"
                color2="#00eaff"
                color3="#ff6d07"
                speed={0.5}
                sweepSpeed={0.5}
                sweepWidth={2}
                sweepFalloff={6}
                scale={1.5}
                frequency={2}
                ripple={0.25}
                bandDensity={11}
                lineSharpness={4}
                glow={0}
                scanDirection="vertical"
                colorSpread={1}
                brightness={1.0}
                contrast={1.5}
                softness={3}
                vignette={0.7}
                scanline={true}
                grain={false}
                grainIntensity={0}
                opacity={0.9}
                className="w-full h-full"
              />
            </div>

            <div className="relative z-10 text-xs font-chakra font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              <Truck className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
              <span>Allocated Response Convoys & Medical Triage</span>
            </div>

            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              {/* NDRF Battalions - Emergency Crimson / Red */}
              <div className="p-2 rounded-lg bg-red-950/40 backdrop-blur-sm border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                <div className="text-sm font-bold text-red-400 [text-shadow:0_0_8px_rgba(239,68,68,0.6),0_2px_4px_rgba(0,0,0,0.95)]">
                  {orderData.ndrfBattalionsDeployed}
                </div>
                <div className="text-[10px] text-red-200/90 font-medium">NDRF Battalions</div>
              </div>

              {/* ODRAF / SDRF Units - Tactical Orange / Amber */}
              <div className="p-2 rounded-lg bg-orange-950/40 backdrop-blur-sm border border-orange-500/50 shadow-[0_0_12px_rgba(249,115,22,0.2)]">
                <div className="text-sm font-bold text-orange-400 [text-shadow:0_0_8px_rgba(249,115,22,0.6),0_2px_4px_rgba(0,0,0,0.95)]">
                  {orderData.odrafTeamsDeployed}
                </div>
                <div className="text-[10px] text-orange-200/90 font-medium">ODRAF / SDRF Units</div>
              </div>

              {/* State Transport Buses - Electric Cyan / Logistics Blue */}
              <div className="p-2 rounded-lg bg-cyan-950/40 backdrop-blur-sm border border-[#00F2FE]/50 shadow-[0_0_12px_rgba(0,242,254,0.2)]">
                <div className="text-sm font-bold text-[#00F2FE] [text-shadow:0_0_8px_rgba(0,242,254,0.6),0_2px_4px_rgba(0,0,0,0.95)]">
                  {orderData.transportBusesAssigned}
                </div>
                <div className="text-[10px] text-cyan-200/90 font-medium">State Transport Buses</div>
              </div>

              {/* Mobile Triage Beds - Medical Emerald / Mint */}
              <div className="p-2 rounded-lg bg-emerald-950/40 backdrop-blur-sm border border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                <div className="text-sm font-bold text-emerald-400 [text-shadow:0_0_8px_rgba(16,185,129,0.6),0_2px_4px_rgba(0,0,0,0.95)]">
                  {orderData.medicalTriageTeams}
                </div>
                <div className="text-[10px] text-emerald-200/90 font-medium">Mobile Triage Beds</div>
              </div>
            </div>
          </div>

          {/* Curfew / Restriction Declaration (Cutout Aperture revealing App Background) */}
          <div className="relative p-3.5 rounded-xl border border-red-500/50 shadow-none flex items-center justify-between gap-3 overflow-hidden">
            {/* The Live App Background (Scanner WebGL Atmospheric Background) visible through this cutout */}
            <div className="absolute inset-0 pointer-events-none -z-0 overflow-hidden bg-[#050B14]">
              <Scanner
                color1="#0094ff"
                color2="#00eaff"
                color3="#ff6d07"
                speed={0.5}
                sweepSpeed={0.5}
                sweepWidth={2}
                sweepFalloff={6}
                scale={1.5}
                frequency={2}
                ripple={0.25}
                bandDensity={11}
                lineSharpness={4}
                glow={0}
                scanDirection="vertical"
                colorSpread={1}
                brightness={1.0}
                contrast={1.5}
                softness={3}
                vignette={0.7}
                scanline={true}
                grain={false}
                grainIntensity={0}
                opacity={0.9}
                className="w-full h-full"
              />
            </div>

            <div className="relative z-10">
              <div className="font-bold text-[#00F2FE] font-rajdhani text-sm sm:text-base [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                Enforce Section 144 / Coastal Travel Curfew
              </div>
              <div className="text-[10px] text-slate-300 font-mono mt-0.5 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                Prohibits non-authorized private vehicles on NH-316 & coastal escape roads after 14:00 IST
              </div>
            </div>

            <CurfewPillButton
              active={curfewActive}
              onClick={() => setCurfewActive(!curfewActive)}
            />
          </div>

          {/* Assembly Centers List */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider block font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              Designated Convoy Assembly Terminals:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
              {orderData.assemblyPoints.map((pt, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-200 [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatory Authorization */}
          <GlareHover
            width="100%"
            height="auto"
            background="rgba(69, 10, 10, 0.3)"
            borderRadius="0.5rem"
            borderColor="rgba(239, 68, 68, 0.3)"
            glareColor="#ffffff"
            glareOpacity={0.4}
            glareAngle={-30}
            glareSize={250}
            transitionDuration={1000}
            playOnce={false}
            className="w-full shadow-[0_2px_12px_rgba(0,0,0,0.5),0_0_12px_rgba(239,68,68,0.1)]"
          >
            <div className="w-full p-2.5 flex items-center justify-between text-xs font-mono relative z-10">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-red-400" />
                <div>
                  <span className="text-slate-400 text-[10px] block">Authorized Signatory:</span>
                  <span className="text-white font-bold">{orderData.authorizedOfficer}</span>
                </div>
              </div>
              <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
                Cryptographically Verified
              </span>
            </div>
          </GlareHover>

        </div>

        {/* Modal Actions */}
        <div className="relative z-10 shrink-0 p-3 sm:p-4 bg-[#140507] border-t border-red-500/30 flex items-center justify-between gap-3">
          <CancelPillButton onClick={onClose} />

          <SignOrderPillButton
            onClick={handleIssueOrder}
            isSubmitting={isSubmitting}
            isSuccess={isSuccess}
          />
        </div>

      </div>
    </div>
  );
}
