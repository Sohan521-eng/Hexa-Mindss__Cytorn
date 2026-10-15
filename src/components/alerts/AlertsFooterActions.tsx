"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { 
  Waves, 
  Bot, 
  ArrowUpRight,
  PhoneCall, 
  ShieldCheck, 
  Radio 
} from "lucide-react";
import Noise from "@/components/ui/Noise";
import { gsap } from "gsap";

/* ─── Digital Twin Pill Link (Cyan / Hydrodynamic Modeling) ─── */
function DigitalTwinPillLink({ href }: { href: string }) {
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
    window.addEventListener("resize", layout);

    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener("resize", layout);
      tlRef.current?.kill();
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
    <Link
      ref={pillRef}
      href={href}
      className="relative p-3.5 rounded-xl bg-[rgba(0,242,254,0.10)] border border-[rgba(0,242,254,0.65)] hover:border-[#00F2FE] shadow-[0_8px_24px_-2px_rgba(0,0,0,0.85),0_4px_12px_rgba(0,0,0,0.95),0_0_14px_rgba(0,242,254,0.2),inset_0_1px_0_rgba(224,252,255,0.4)] hover:shadow-[0_12px_32px_-2px_rgba(0,0,0,0.95),0_6px_18px_rgba(0,0,0,0.95),0_0_28px_rgba(0,242,254,0.85),inset_0_1px_0_rgba(255,255,255,0.6)] hover:scale-[1.02] backdrop-blur-[20px] transition-all duration-250 ease-out cursor-pointer overflow-hidden flex items-center justify-between group shrink-0 min-w-[240px]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Launch 3D Digital Twin"
    >
      <span
        ref={circleRef}
        aria-hidden="true"
        className="absolute left-1/2 bottom-0 rounded-full bg-[#00F2FE] z-[1] block pointer-events-none will-change-transform"
      />
      <div className="relative z-[2] w-full flex items-center justify-between">
        {/* Default resting label */}
        <div className="pill-label relative z-[2] w-full flex items-center justify-between gap-3 will-change-transform">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00F2FE]/15 border border-[#00F2FE]/30 flex items-center justify-center shrink-0">
              <Waves className="w-4 h-4 text-[#00F2FE]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono text-[#00F2FE] uppercase tracking-wider">
                Hydrodynamic Modeling
              </span>
              <span className="text-xs sm:text-sm font-rajdhani font-bold text-white tracking-wide">
                Launch 3D Digital Twin
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#00F2FE] shrink-0 ml-2" />
        </div>

        {/* Hover label (inverted dark on cyan circle) */}
        <div
          className="pill-label-hover absolute inset-0 z-[3] w-full flex items-center justify-between gap-3 will-change-[transform,opacity]"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#050B14]/15 border border-[#050B14]/30 flex items-center justify-center shrink-0">
              <Waves className="w-4 h-4 text-[#050B14]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono text-[#050B14]/90 uppercase tracking-wider">
                Hydrodynamic Modeling
              </span>
              <span className="text-xs sm:text-sm font-rajdhani font-bold text-[#050B14] tracking-wide">
                Launch 3D Digital Twin
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#050B14] shrink-0 ml-2" />
        </div>
      </div>
    </Link>
  );
}

/* ─── Autonomous Grid Pill Link (Emerald / Reconnaissance Swarms) ─── */
function AutonomousGridPillLink({ href }: { href: string }) {
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
    window.addEventListener("resize", layout);

    return () => {
      active = false;
      clearTimeout(timer);
      window.removeEventListener("resize", layout);
      tlRef.current?.kill();
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
    <Link
      ref={pillRef}
      href={href}
      className="relative p-3.5 rounded-xl bg-[rgba(16,231,162,0.10)] border border-[rgba(16,231,162,0.65)] hover:border-[#10E7A2] shadow-[0_8px_24px_-2px_rgba(0,0,0,0.85),0_4px_12px_rgba(0,0,0,0.95),0_0_14px_rgba(16,231,162,0.2),inset_0_1px_0_rgba(180,255,225,0.4)] hover:shadow-[0_12px_32px_-2px_rgba(0,0,0,0.95),0_6px_18px_rgba(0,0,0,0.95),0_0_28px_rgba(16,231,162,0.85),inset_0_1px_0_rgba(255,255,255,0.6)] hover:scale-[1.02] backdrop-blur-[20px] transition-all duration-250 ease-out cursor-pointer overflow-hidden flex items-center justify-between group shrink-0 min-w-[240px]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Deploy Autonomous Grid"
    >
      <span
        ref={circleRef}
        aria-hidden="true"
        className="absolute left-1/2 bottom-0 rounded-full bg-[#10E7A2] z-[1] block pointer-events-none will-change-transform"
      />
      <div className="relative z-[2] w-full flex items-center justify-between">
        {/* Default resting label */}
        <div className="pill-label relative z-[2] w-full flex items-center justify-between gap-3 will-change-transform">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#10E7A2]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono text-[#10E7A2] uppercase tracking-wider">
                Reconnaissance Swarms
              </span>
              <span className="text-xs sm:text-sm font-rajdhani font-bold text-white tracking-wide">
                Deploy Autonomous Grid
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#10E7A2] shrink-0 ml-2" />
        </div>

        {/* Hover label (inverted dark on emerald circle) */}
        <div
          className="pill-label-hover absolute inset-0 z-[3] w-full flex items-center justify-between gap-3 will-change-[transform,opacity]"
          aria-hidden="true"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#050B14]/15 border border-[#050B14]/30 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-[#050B14]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono text-[#050B14]/90 uppercase tracking-wider">
                Reconnaissance Swarms
              </span>
              <span className="text-xs sm:text-sm font-rajdhani font-bold text-[#050B14] tracking-wide">
                Deploy Autonomous Grid
              </span>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-[#050B14] shrink-0 ml-2" />
        </div>
      </div>
    </Link>
  );
}

interface AlertsFooterActionsProps {
  stormParam?: string;
  selectedDistrictName?: string;
}

export function AlertsFooterActions({
  stormParam = "mocha",
  selectedDistrictName = "Puri",
}: AlertsFooterActionsProps) {
  return (
    <footer 
      className="relative overflow-hidden rounded-xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] p-4 sm:p-5"
      style={{
        background: "#0F1B2F",
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.15)",
      }}
    >
      {/* Noise Film Grain Overlay — matches other pages */}
      <Noise patternSize={250} patternScaleX={1.2} patternScaleY={1.2} patternRefreshInterval={2} patternAlpha={10} />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        
        {/* Left: Operational Response Deployment Context */}
        <div className="space-y-1.5 max-w-xl">

          <h3 className="text-base sm:text-lg font-extrabold tracking-wide flex items-center gap-2">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                Seamless Multi-Agency Decision Handoff
              </span>
            </span>
          </h3>

          <p className="text-xs text-[#00F2FE] font-medium font-sans mt-0.5 leading-relaxed [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            Deploy validated surge boundaries for <strong className="text-[#EF4444] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">{selectedDistrictName} sector</strong> into high-fidelity 3D flood simulations and autonomous emergency response drone swarms.
          </p>
        </div>

        {/* Right: Downstream Action CTAs */}
        <div className="flex flex-wrap items-center gap-3">
          <DigitalTwinPillLink
            href={`/digital-twin?storm=${stormParam.toLowerCase()}&district=${selectedDistrictName.toLowerCase()}`}
          />
          <AutonomousGridPillLink
            href={`/autonomous-grid?status=evac&district=${selectedDistrictName.toLowerCase()}`}
          />
        </div>

      </div>

      {/* Emergency Hotlines Strip */}
      <div className="relative z-10 mt-4 pt-3 border-t border-[rgba(0,242,254,0.12)] flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400">
        
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-1.5 text-red-400 font-semibold animate-pulse-zoom [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_10px_rgba(239,68,68,0.45)] drop-shadow-[0_0_6px_rgba(239,68,68,0.35)] cursor-default select-none">
            <PhoneCall className="w-3.5 h-3.5 shrink-0" />
            <span>NDMA Hotline: 1078</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-semibold animate-pulse-zoom [animation-delay:350ms] [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_10px_rgba(245,158,11,0.45)] drop-shadow-[0_0_6px_rgba(245,158,11,0.35)] cursor-default select-none">
            <Radio className="w-3.5 h-3.5 shrink-0" />
            <span>State EOC: 1070</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold animate-pulse-zoom [animation-delay:700ms] [text-shadow:0_2px_4px_rgba(0,0,0,0.95),0_0_10px_rgba(16,185,129,0.45)] drop-shadow-[0_0_6px_rgba(16,185,129,0.35)] cursor-default select-none">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>Emergency Services: 112</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
