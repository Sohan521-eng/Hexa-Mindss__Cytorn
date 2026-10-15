"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Smartphone, 
  Code, 
  BellRing, 
  Copy, 
  Check, 
  Volume2, 
  Lock, 
  Signal, 
  TowerControl 
} from "lucide-react";
import Noise from "@/components/ui/Noise";
import { CAP_XML_SAMPLE } from "./alertsData";
import { gsap } from "gsap";

interface CapBroadcastSimulatorProps {
  onOpen2FaModal: () => void;
  activeStormName?: string;
}

/* ─── Copy XML Pill Button (Slate Beveled Glass with GSAP roll interaction) ─── */
function CopyXmlPillButton({
  copied,
  onClick,
}: {
  copied: boolean;
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
    const timer = setTimeout(layout, 100);
    window.addEventListener("resize", layout);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("resize", layout);
      tlRef.current?.kill();
    };
  }, [copied]);

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
      style={{ height: "30px", minWidth: "auto", padding: "0 12px", fontSize: "11px" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title={copied ? "Copied to clipboard" : "Copy XML payload"}
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          )}
          <span>{copied ? "COPIED" : "COPY XML"}</span>
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-white shrink-0" />
          )}
          <span>{copied ? "COPIED" : "COPY XML"}</span>
        </span>
      </span>
    </button>
  );
}

/* ─── Test Siren Pill Button (Amber / Warning Audio Chime) ─── */
function TestSirenPillButton({
  onClick,
  isSimulating,
}: {
  onClick: () => void;
  isSimulating: boolean;
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
    const timer = setTimeout(layout, 100);
    window.addEventListener("resize", layout);

    return () => {
      isMounted = false;
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
    <button
      type="button"
      ref={pillRef}
      onClick={onClick}
      className="scientist-pill-amber w-full sm:w-auto relative z-10 shrink-0 cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Play synthetic 853/960 Hz EAS alert chime"
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          <Volume2 className="w-4 h-4 text-[#FF9100] shrink-0" />
          <span>TEST EAS ALERT SIREN</span>
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <Volume2 className="w-4 h-4 text-[#050B14] shrink-0" />
          <span>TEST EAS ALERT SIREN</span>
        </span>
      </span>
    </button>
  );
}

/* ─── Send Cell Broadcast Pill Button (Crimson Red / 2FA Gate) ─── */
function SendBroadcastPillButton({
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
    const timer = setTimeout(layout, 100);
    window.addEventListener("resize", layout);

    return () => {
      isMounted = false;
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
    <button
      type="button"
      ref={pillRef}
      onClick={onClick}
      className="scientist-pill-red w-full sm:w-auto relative z-10 shrink-0 cursor-pointer shadow-[0_0_24px_rgba(239,68,68,0.35)]"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Open secure 2FA confirmation gate to dispatch real-time emergency cell broadcast"
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          <span className="!text-white font-extrabold tracking-wider">SEND CELL BROADCAST (2FA)</span>
          <Lock className="w-3.5 h-3.5 text-white/80 shrink-0" />
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <span className="text-[#050B14] font-extrabold tracking-wider">SEND CELL BROADCAST (2FA)</span>
          <Lock className="w-3.5 h-3.5 text-[#050B14] shrink-0" />
        </span>
      </span>
    </button>
  );
}

export function CapBroadcastSimulator({
  onOpen2FaModal,
  activeStormName = "Cyclone MOCHA",
}: CapBroadcastSimulatorProps) {
  const [activeTab, setActiveTab] = useState<"sms" | "xml">("sms");
  const [xmlCopied, setXmlCopied] = useState(false);
  const [isSimulatingSiren, setIsSimulatingSiren] = useState(false);
  const [simulationAlertVisible, setSimulationAlertVisible] = useState(false);

  // Formatted XML string from ITU-T X.1303 schema
  const capXmlString = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${CAP_XML_SAMPLE.identifier}</identifier>
  <sender>${CAP_XML_SAMPLE.sender}</sender>
  <sent>${CAP_XML_SAMPLE.sentIso}</sent>
  <status>${CAP_XML_SAMPLE.status}</status>
  <msgType>${CAP_XML_SAMPLE.msgType}</msgType>
  <scope>${CAP_XML_SAMPLE.scope}</scope>
  <info>
    <category>${CAP_XML_SAMPLE.category}</category>
    <event>${CAP_XML_SAMPLE.event}</event>
    <urgency>${CAP_XML_SAMPLE.urgency}</urgency>
    <severity>${CAP_XML_SAMPLE.severity}</severity>
    <certainty>${CAP_XML_SAMPLE.certainty}</certainty>
    <headline>${CAP_XML_SAMPLE.headline}</headline>
    <description>${CAP_XML_SAMPLE.description}</description>
    <instruction>${CAP_XML_SAMPLE.instruction}</instruction>
    <area>
      <areaDesc>${CAP_XML_SAMPLE.areaDesc}</areaDesc>
      <circle>${CAP_XML_SAMPLE.circleCoordinates}</circle>
    </area>
    <contact>${CAP_XML_SAMPLE.contact}</contact>
    <web>${CAP_XML_SAMPLE.web}</web>
  </info>
</alert>`;

  const handleCopyXml = () => {
    navigator.clipboard.writeText(capXmlString).then(() => {
      setXmlCopied(true);
      setTimeout(() => setXmlCopied(false), 2500);
    }).catch(() => {});
  };

  // Synthetic Emergency Alert Warble Chime using Web Audio API
  const handleSimulateAlertAudio = () => {
    setSimulationAlertVisible(true);
    setIsSimulatingSiren(true);

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      // Alternate frequencies 853Hz & 960Hz (Standard EAS frequencies)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(853, now);
      osc.frequency.setValueAtTime(960, now + 0.25);
      osc.frequency.setValueAtTime(853, now + 0.5);
      osc.frequency.setValueAtTime(960, now + 0.75);
      osc.frequency.setValueAtTime(853, now + 1.0);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);

      setTimeout(() => {
        setIsSimulatingSiren(false);
      }, 1500);
    } catch {
      setIsSimulatingSiren(false);
    }
  };

  return (
    <div 
      id="cap-broadcast-simulator"
      className="relative flex flex-col h-full rounded-xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden"
      style={{
        background: "#0F1B2F",
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.15)",
      }}
    >
      {/* Noise Film Grain Texture — softened and refined */}
      <Noise patternSize={250} patternScaleX={1} patternScaleY={1} patternRefreshInterval={2} patternAlpha={8} />

      {/* Header Bar */}
      <div className="relative z-10 p-4 pb-2 shrink-0">
        <h3 className="text-base sm:text-lg font-extrabold tracking-wide flex items-center gap-2">
          <span className="heading-gradient-shadow-wrapper">
            <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
              Emergency Cell Broadcast Gateway (CAP v1.2)
            </span>
          </span>
        </h3>
        <p className="text-xs text-[#00F2FE] font-medium font-sans mt-0.5 [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
          ITU-T X.1303 Common Alerting Protocol • Geo-fenced telecom cell broadcast service (CBS)
        </p>
      </div>

      {/* Switcher Tabs: SMS / Mobile Preview vs CAP-XML */}
      <div className="relative z-10 px-4 pb-2.5 flex items-center justify-between gap-2 shrink-0">
        <div 
          className="relative z-10 isolate flex items-center gap-1 p-1 rounded-lg border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.8)] shrink-0"
          style={{ backgroundColor: "#0A1424" }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("sms")}
            className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === "sms"
                ? "border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                : "border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
            }`}
            style={{
              backgroundColor: activeTab === "sms" ? "#0E2438" : "#050B14",
            }}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Cell Broadcast Dispatch Preview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("xml")}
            className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
              activeTab === "xml"
                ? "border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                : "border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
            }`}
            style={{
              backgroundColor: activeTab === "xml" ? "#0E2438" : "#050B14",
            }}
          >
            <Code className="w-3.5 h-3.5" />
            <span>ITU-T X.1303 XML Payload</span>
          </button>
        </div>

        {activeTab === "xml" && (
          <CopyXmlPillButton copied={xmlCopied} onClick={handleCopyXml} />
        )}
      </div>

      {/* Main Tab Content */}
      <div className="relative z-10 flex-1 min-h-0 px-4 py-2 overflow-y-auto flex flex-col">
        {activeTab === "sms" ? (
          /* High-Impact Cell Broadcast Operations Console */
          <div className="flex flex-col items-center justify-center my-auto py-2 space-y-4 w-full">
            
            {/* National Emergency Alert Box */}
            <div className="w-full max-w-[440px] rounded-2xl bg-[#0A1220]/95 border-2 border-red-500/80 p-4 shadow-[0_15px_45px_rgba(213,0,0,0.25)] space-y-3">
              
              {/* Carrier Mesh Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Signal className="w-3 h-3" />
                  BSNL • Airtel • Jio • Vi (National Mesh)
                </span>
                <span className="text-emerald-400 font-bold">100% Cell Coverage</span>
              </div>

              {/* Alert Content Card */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-600 flex items-center justify-center shrink-0 animate-pulse shadow-md">
                    <BellRing className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-extrabold uppercase text-red-400 tracking-wider">
                      GOVT OF INDIA • EMERGENCY ALERT: SEVERE
                    </div>
                    <div className="text-xs font-bold text-white font-rajdhani">
                      NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#050B14] border border-red-900/60 font-mono text-xs text-slate-100 leading-relaxed space-y-1.5">
                  <div className="text-red-400 font-bold">
                    [MANDATORY EVACUATION: {activeStormName.toUpperCase()}]
                  </div>
                  <div>
                    Extremely Severe Cyclonic Storm approaching Puri & Paradip coast. Winds 210 km/h and +3.4m storm surge within 24 hours.
                  </div>
                  <div className="text-amber-300 font-bold pt-1">
                    Evacuate to nearest Multipurpose Cyclone Shelter immediately.
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1">
                    Emergency Toll-Free: 1078 or 112. Stay indoors away from windows.
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                  <span>Target: Coastal Belt (0-5 km)</span>
                  <span className="text-slate-500">ID: CWD-2026-04</span>
                </div>
              </div>

              {/* Geo-fenced population reach */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-[#00F2FE]">
                  <TowerControl className="w-3.5 h-3.5" />
                  CBS Geo-Fence Ready
                </span>
                <span className="text-white font-bold">
                  1,480,000 Devices in Zone
                </span>
              </div>
            </div>

            {/* Test Audio Chime Toast */}
            {simulationAlertVisible && (
              <div className="w-full max-w-[440px] p-2.5 rounded-xl bg-red-950/60 border border-red-500/50 flex items-center justify-between gap-2 text-xs font-mono text-red-200 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-red-400 shrink-0" />
                  <span>853/960 Hz Emergency EAS Siren Sounding</span>
                </div>
                <button
                  onClick={() => setSimulationAlertVisible(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

          </div>
        ) : (
          /* ITU-T X.1303 CAP-XML Payload Preview */
          <div className="relative my-auto">
            <pre className="p-3.5 rounded-xl bg-[#050B14] border-2 border-[#00F2FE]/70 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed scrollbar-none shadow-none">
              <code>{capXmlString}</code>
            </pre>
          </div>
        )}
      </div>

      {/* Dual Dispatch Action Controls */}
      <div className="relative z-10 p-4 pt-2 pb-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        {/* Simulate CAP Alert Siren Button */}
        <TestSirenPillButton
          onClick={handleSimulateAlertAudio}
          isSimulating={isSimulatingSiren}
        />

        {/* Flashing Send Cell Broadcast Button (2FA Gate) */}
        <SendBroadcastPillButton
          onClick={onOpen2FaModal}
        />
      </div>
    </div>
  );
}
