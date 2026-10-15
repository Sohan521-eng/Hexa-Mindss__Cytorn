"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Satellite, 
  Radio, 
  FlaskConical, 
  Download, 
  ExternalLink, 
  Layers, 
  CheckCircle2,
  FileCode2,
  Settings
} from "lucide-react";
import { DATASET_PROVENANCE, DATASET_SPLITS, MODEL_CHECKPOINTS } from "./benchmarkData";
import { BenchmarkStormId, ModelCheckpointId } from "./types";
import { Noise } from "@/components/ui/Noise";
import { ShinyBadge } from "@/components/ui/ShinyBadge";
import { gsap } from "gsap";

interface DatasetDemographicsFooterProps {
  selectedStorm: BenchmarkStormId;
  selectedModel: ModelCheckpointId;
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

function makeRoundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}

/* ─── Download Metrics Pill Button (Matches SC styling & GSAP roll physics) ─── */
function DownloadMetricsPillButton({ onClick }: { onClick: () => void }) {
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
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
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
      ref={pillRef}
      type="button"
      onClick={onClick}
      className="metrics-download-pill"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Download Raw Verified Scientific Metrics (JSON)"
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          <FileCode2 className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
          <span>Download Raw Metrics (JSON)</span>
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <FileCode2 className="w-3.5 h-3.5 text-[#050B14] shrink-0" />
          <span>Download Raw Metrics (JSON)</span>
        </span>
      </span>
    </button>
  );
}

/* ─── PINNs Lab CTA Pill Link (Matches SC styling & GSAP roll physics) ─── */
function PinnsLabPillLink({ href }: { href: string }) {
  const pillRef = useRef<HTMLAnchorElement | null>(null);
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
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
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
      className="pinns-lab-pill"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Navigate to Physics-Informed Neural Network (PINNs) Lab"
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          <FlaskConical className="w-4 h-4 text-[#050B14] shrink-0" />
          <span>Test in PINNs Lab (Page 10)</span>
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <FlaskConical className="w-4 h-4 text-[#00F2FE] shrink-0" />
          <span>Test in PINNs Lab (Page 10)</span>
        </span>
      </span>
    </Link>
  );
}

/* ─── Inspect Weights Pill Link (Matches SC styling & GSAP roll physics) ─── */
function InspectWeightsPillLink({ href }: { href: string }) {
  const pillRef = useRef<HTMLAnchorElement | null>(null);
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
    const onResize = () => layout();
    window.addEventListener("resize", onResize);

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
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
      className="scientist-pill"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Inspect Model Weights & Hyperparameters"
      aria-label="Inspect Model Weights & Hyperparameters"
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          <Settings className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
          <span>Inspect Model Weights &amp; Hyperparameters</span>
          <ExternalLink className="w-3 h-3 text-[#00F2FE] shrink-0" />
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <Settings className="w-3.5 h-3.5 text-[#050B14] shrink-0" />
          <span>Inspect Model Weights &amp; Hyperparameters</span>
          <ExternalLink className="w-3 h-3 text-[#050B14] shrink-0" />
        </span>
      </span>
    </Link>
  );
}

export function DatasetDemographicsFooter({
  selectedStorm,
  selectedModel,
}: DatasetDemographicsFooterProps) {
  const currentModel = MODEL_CHECKPOINTS[selectedModel];

  const containerRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

  const updateCutouts = useCallback(() => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    const cw = Math.round(cRect.width);
    const ch = Math.round(cRect.height);

    const boxes = cardRefs.current
      .map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.left - cRect.left),
          y: Math.round(r.top - cRect.top),
          w: Math.round(r.width),
          h: Math.round(r.height),
          rx: 12, // rounded-xl
        };
      })
      .filter((b): b is { x: number; y: number; w: number; h: number; rx: number } => Boolean(b && b.w > 0 && b.h > 0));

    if (boxes.length === 0) {
      setMaskStyle({});
      return;
    }

    const boxPaths = boxes.map((b) => makeRoundedRectPath(b.x, b.y, b.w, b.h, b.rx)).join(" ");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}"><path fill-rule="evenodd" fill="#000" d="M 0 0 H ${cw} V ${ch} H 0 Z ${boxPaths}" /></svg>`;
    const dataUri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

    setMaskStyle({
      WebkitMaskImage: dataUri,
      maskImage: dataUri,
      WebkitMaskSize: "100% 100%",
      maskSize: "100% 100%",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    updateCutouts();
    const handleResize = () => updateCutouts();
    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(() => updateCutouts());
    if (containerRef.current) ro.observe(containerRef.current);
    cardRefs.current.forEach((el) => {
      if (el) ro.observe(el);
    });

    const raf = requestAnimationFrame(updateCutouts);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
  }, [updateCutouts]);

  // Handler for Raw Metrics JSON Download
  const handleDownloadJson = () => {
    const exportData = {
      cycloAiVersion: "2.4.0-SOTA",
      exportTimestampUtc: new Date().toISOString(),
      activeModel: currentModel,
      benchmarkStorm: selectedStorm,
      systemMetrics: {
        accuracy: currentModel.overallAccuracy,
        trackError24hKm: currentModel.trackError24h,
        trackError48hKm: currentModel.trackError48h,
        intensityMaeKts: currentModel.intensityMae,
        datasetFrames: currentModel.trainingCorpus,
        latencyMs: currentModel.latencyMs,
      },
      provenance: DATASET_PROVENANCE,
      splits: DATASET_SPLITS,
      formulationReferences: {
        mdeFormula: "MDE(t) = (1/N) * sum(D_geodesic((Lat_pred, Lon_pred), (Lat_obs, Lon_obs)))",
        intensityMaeFormula: "MAE_V = (1/N) * sum(|V_pred - V_obs|)",
        pinnLossConstraint: "L_physics = || Navier_Stokes_Residual || < 0.005",
      },
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `cyclo_ai_metrics_${selectedModel}_${selectedStorm}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <footer 
      id="dataset-demographics-card"
      ref={containerRef}
      className="relative rounded-2xl overflow-hidden p-3.5 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex flex-col gap-3.5 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.18)",
      }}
    >
      {/* Background layer with Noise, ambient glow, and dynamic cutout mask */}
      <div 
        className="absolute inset-0 bg-[#0F1B2F]/95 backdrop-blur-md pointer-events-none rounded-2xl overflow-hidden"
        style={maskStyle}
      >
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={12}
        />
        <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col gap-3.5 h-full">
      {/* 1. Header with Sensor Provenance */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2.5 border-b border-[rgba(0,242,254,0.14)]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black font-rajdhani uppercase tracking-wider flex items-center">
              <span className="heading-gradient-shadow-wrapper">
                <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                  Dataset Demographics &amp; Sensor Provenance
                </span>
              </span>
            </h3>
          </div>
          <p className="text-xs mt-0.5 font-mono" style={{ color: '#00F2FE', textShadow: '1px 2px 6px rgba(0,0,0,0.9)' }}>
            ISRO INSAT-3D/3DR, Oceansat Scatterometer, and NOAA/JMA multispectral sensor distribution.
          </p>
        </div>

        {/* Data Split Visualization Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span 
            className="text-[#00F2FE] text-[11px] font-bold"
            style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.95)" }}
          >
            Corpus Split:
          </span>
          <ShinyBadge
            className="shadow-[0_2px_10px_rgba(0,0,0,0.35),0_0_8px_rgba(0,242,254,0.15)] shrink-0"
            roundedClassName="rounded-md"
            innerClassName="px-2.5 py-0.5 flex items-center gap-1.5"
            speed={3}
            spread={80}
            borderColor="rgba(0, 242, 254, 0.45)"
            borderShineColor="#ffffff"
            surfaceColor="rgba(0, 242, 254, 0.15)"
            surfaceShineColor="rgba(255, 255, 255, 0.55)"
          >
            <span className="text-[#00F2FE] font-bold text-[11px] tracking-wide">70% Train</span>
            <span className="text-white/40 text-[10px]">/</span>
            <span className="text-amber-400 font-bold text-[11px] tracking-wide">15% Val</span>
            <span className="text-white/40 text-[10px]">/</span>
            <span className="text-[#00E676] font-bold text-[11px] tracking-wide">15% Test</span>
          </ShinyBadge>
        </div>
      </div>

      {/* 2. Sensor Provenance Cards (3 Columns) - Cutout Apertures */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {DATASET_PROVENANCE.map((prov, i) => (
          <div
            key={`prov-${i}`}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="p-3.5 rounded-xl bg-transparent transition-all flex flex-col justify-between relative group"
            style={{
              border: "1.5px solid rgba(0, 242, 254, 0.45)",
              boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.9), inset 0 0 16px rgba(0, 0, 0, 0.8), 0 2px 8px rgba(0, 0, 0, 0.7)",
              textShadow: "0 1px 3px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.85)",
            }}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span 
                  className="text-xs font-mono font-bold text-white flex items-center gap-1.5"
                  style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.85)" }}
                >
                  <Satellite className="w-3.5 h-3.5 text-[#00F2FE]" />
                  {prov.satellite}
                </span>
                <ShinyBadge
                  className="shadow-[0_2px_10px_rgba(0,0,0,0.35),0_0_8px_rgba(0,242,254,0.15)] shrink-0"
                  roundedClassName="rounded-md"
                  innerClassName="px-2 py-0.5 flex items-center"
                  speed={3}
                  spread={80}
                  borderColor="rgba(0, 242, 254, 0.45)"
                  borderShineColor="#ffffff"
                  surfaceColor="rgba(0, 242, 254, 0.15)"
                  surfaceShineColor="rgba(255, 255, 255, 0.55)"
                >
                  <span 
                    className="text-xs font-mono font-bold text-[#00F2FE] tracking-wide whitespace-nowrap"
                    style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.95)" }}
                  >
                    {prov.percentage}% ({prov.framesCount.toLocaleString()})
                  </span>
                </ShinyBadge>
              </div>
              <div 
                className="text-[11px] font-mono text-slate-400 mb-2 font-semibold"
                style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.95)" }}
              >
                Sensor: <span className="text-slate-200" style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.95)" }}>{prov.sensor}</span>
              </div>
              <p 
                className="text-[11px] font-sans text-slate-300 leading-relaxed"
                style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.85)" }}
              >
                {prov.purpose}
              </p>
            </div>

            <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-[rgba(0,242,254,0.14)]">
              {prov.channels.map((ch, idx) => (
                <span
                  key={`ch-${idx}`}
                  className="px-1.5 py-0.5 text-[9.5px] font-mono text-slate-300 bg-[#050B14]/80 rounded border border-slate-700/80 shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                  style={{ textShadow: "0 1px 2px rgba(0, 0, 0, 0.95)" }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 3. Downstream Pipeline Action Horizon */}
      <div className="pt-3 border-t border-[rgba(0,242,254,0.14)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Side: Inspect Weights Button (Matching SC pill styling & GSAP roll effect) */}
        <div className="flex items-center gap-3">
          <InspectWeightsPillLink href="/settings#model-engine" />
        </div>

        {/* Right Side: Downstream Action Buttons (Matching SC pill styling & GSAP roll effect) */}
        <div className="flex items-center gap-3 flex-wrap">
          <DownloadMetricsPillButton onClick={handleDownloadJson} />
          <PinnsLabPillLink href={`/physics-lab?benchmark=${selectedStorm}`} />
        </div>

      </div>
      </div>
    </footer>
  );
}
