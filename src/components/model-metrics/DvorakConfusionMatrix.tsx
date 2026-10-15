"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Sparkles,
  BarChart2,
  X
} from "lucide-react";
import { DvorakClassId, ConfusionMatrixCell } from "./types";
import { DVORAK_CLASSES, CONFUSION_MATRIX_CELLS } from "./benchmarkData";
import { Noise } from "@/components/ui/Noise";

/* ─── Dismiss Pill Button (Matches SC / ScientistProfilePill styling & GSAP roll effect in slate/neutral) ─── */
function DismissPillButton({ onClick }: { onClick: () => void }) {
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
      type="button"
      ref={pillRef}
      onClick={onClick}
      className="scientist-pill-slate relative z-10 shrink-0 cursor-pointer"
      style={{ height: "30px", minWidth: "auto", padding: "0 12px", fontSize: "11px" }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      title="Dismiss inspection details"
    >
      <span className="hover-circle" aria-hidden="true" ref={circleRef} />
      <span className="label-stack">
        <span className="pill-label">
          <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span>Dismiss</span>
        </span>
        <span className="pill-label-hover" aria-hidden="true">
          <X className="w-3.5 h-3.5 text-white shrink-0" />
          <span>Dismiss</span>
        </span>
      </span>
    </button>
  );
}

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

function makeRoundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}

type MatrixTabMode = "f1" | "prec-rec" | "raw-counts";

export function DvorakConfusionMatrix() {
  const [activeTab, setActiveTab] = useState<MatrixTabMode>("f1");
  const [selectedCell, setSelectedCell] = useState<ConfusionMatrixCell | null>(null);

  const containerRef = useRef<HTMLElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const inspectionCardRef = useRef<HTMLDivElement | null>(null);

  const [maskStyle, setMaskStyle] = useState<React.CSSProperties>({});

  const updateCutouts = useCallback(() => {
    if (!containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    const cw = Math.round(cRect.width);
    const ch = Math.round(cRect.height);

    const targets = selectedCell
      ? (inspectionCardRef.current ? [{ el: inspectionCardRef.current, rx: 12 }] : [])
      : cardRefs.current
          .map((el) => (el ? { el, rx: 8 } : null))
          .filter(Boolean) as { el: HTMLDivElement; rx: number }[];

    const boxes = targets
      .map(({ el, rx }) => {
        const r = el.getBoundingClientRect();
        return {
          x: Math.round(r.left - cRect.left),
          y: Math.round(r.top - cRect.top),
          w: Math.round(r.width),
          h: Math.round(r.height),
          rx,
        };
      })
      .filter((c) => c.w > 0 && c.h > 0);

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
  }, [selectedCell]);

  useIsomorphicLayoutEffect(() => {
    updateCutouts();
    const handleResize = () => updateCutouts();
    window.addEventListener("resize", handleResize);

    const ro = new ResizeObserver(() => updateCutouts());
    if (containerRef.current) ro.observe(containerRef.current);
    if (inspectionCardRef.current) ro.observe(inspectionCardRef.current);
    cardRefs.current.forEach((el) => {
      if (el) ro.observe(el);
    });

    const raf = requestAnimationFrame(updateCutouts);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", handleResize);
      ro.disconnect();
    };
  }, [updateCutouts, selectedCell, activeTab]);

  const classKeys: DvorakClassId[] = [
    "curved-band",
    "eye",
    "cdo",
    "shear",
    "embedded-center",
  ];

  // Helper to look up cell data
  const getCell = (actual: DvorakClassId, predicted: DvorakClassId): ConfusionMatrixCell => {
    return (
      CONFUSION_MATRIX_CELLS.find(
        (c) => c.actual === actual && c.predicted === predicted
      ) || {
        actual,
        predicted,
        count: 0,
        percentage: 0,
        isDiagonal: actual === predicted,
      }
    );
  };

  // Cell Background Tint based on percentage and diagonal status
  const getCellBgColor = (cell: ConfusionMatrixCell) => {
    if (cell.isDiagonal) {
      // True Positives (93% - 97%)
      if (cell.percentage >= 96) return "bg-gradient-to-br from-[#00E676]/30 to-[#00F2FE]/25 border-[#00E676]/60 text-[#00E676]";
      if (cell.percentage >= 94) return "bg-gradient-to-br from-[#00F2FE]/25 to-[#10E7A2]/20 border-[#00F2FE]/50 text-[#00F2FE]";
      return "bg-[#00F2FE]/15 border-[#00F2FE]/40 text-[#00F2FE]";
    } else {
      // Off-diagonal Errors
      if (cell.percentage >= 3.0) return "bg-[#FF5E36]/20 border-[#FF5E36]/40 text-[#FF5E36]";
      if (cell.percentage >= 1.5) return "bg-[#FFB300]/15 border-[#FFB300]/30 text-[#FFB300]";
      return "bg-[#091424]/60 border-slate-800 text-slate-400";
    }
  };

  return (
    <section 
      ref={containerRef}
      id="confusion-matrix-view"
      className="relative rounded-2xl overflow-hidden p-3.5 sm:p-4 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.7)] bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.18)",
      }}
    >
      {/* Background layer with Noise & ambient glow matching other sections with cutout mask */}
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

      <div className="relative z-10 flex flex-col justify-between h-full">
      {/* 1. Header & Metric Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[rgba(0,242,254,0.14)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black font-rajdhani uppercase tracking-wider flex items-center">
              <span className="heading-gradient-shadow-wrapper">
                <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                  Dvorak Multi-Class Confusion Matrix
                </span>
              </span>
            </h2>
          </div>
          <p className="text-xs mt-0.5 font-mono" style={{ color: '#00F2FE', textShadow: '1px 2px 6px rgba(0,0,0,0.9)' }}>
            Evaluates morphological classifications against verified ground-truth best-track logs.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] shrink-0">
          <button
            onClick={() => setActiveTab("f1")}
            className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "f1"
                ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
            }`}
          >
            F1-Scores
          </button>
          <button
            onClick={() => setActiveTab("prec-rec")}
            className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "prec-rec"
                ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
            }`}
          >
            Precision / Recall
          </button>
          <button
            onClick={() => setActiveTab("raw-counts")}
            className={`px-3 py-1.5 text-[11px] font-mono font-bold rounded-md transition-all cursor-pointer ${
              activeTab === "raw-counts"
                ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
            }`}
          >
            Sample Counts
          </button>
        </div>
      </div>

      {/* 2. Interactive Matrix Grid Table */}
      <div className="my-3 overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr>
              <th className="p-2 text-left text-[11px] font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                True \ Pred
              </th>
              {classKeys.map((k) => (
                <th 
                  key={`th-${k}`} 
                  className="p-2 text-[11px] font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]"
                >
                  <span className="block truncate max-w-[85px] mx-auto" title={DVORAK_CLASSES[k].name}>
                    {DVORAK_CLASSES[k].code}
                  </span>
                </th>
              ))}
              <th className="p-2 text-[11px] font-mono font-bold text-white uppercase tracking-wider border-b border-slate-800 [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                {activeTab === "f1" ? "F1" : activeTab === "prec-rec" ? "Rec %" : "Total"}
              </th>
            </tr>
          </thead>
          <tbody>
            {classKeys.map((actualKey) => {
              const actualMeta = DVORAK_CLASSES[actualKey];
              return (
                <tr key={`row-${actualKey}`} className="hover:bg-slate-800/30 transition-colors">
                  {/* Row Label (True Class) */}
                  <td className="p-2 text-left text-xs font-mono font-bold text-slate-300 border-r border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-2 h-2 rounded-full shrink-0" 
                        style={{ backgroundColor: actualMeta.color }} 
                      />
                      <span className="truncate max-w-[130px]" title={actualMeta.name}>
                        {actualMeta.name}
                      </span>
                    </div>
                  </td>

                  {/* 5 Column Cells */}
                  {classKeys.map((predKey) => {
                    const cell = getCell(actualKey, predKey);
                    const isSelected = 
                      selectedCell?.actual === cell.actual && 
                      selectedCell?.predicted === cell.predicted;

                    return (
                      <td 
                        key={`cell-${actualKey}-${predKey}`} 
                        className="p-1"
                      >
                        <button
                          onClick={() => setSelectedCell(cell)}
                          className={`w-full py-1.5 px-1 rounded-xl border text-[11px] sm:text-xs font-jetbrains font-bold transition-all cursor-pointer relative group ${
                            getCellBgColor(cell)
                          } ${isSelected ? "ring-2 ring-white scale-105 shadow-lg" : "hover:scale-[1.03]"}`}
                        >
                          {activeTab === "raw-counts" ? (
                            <span className="text-[10px] sm:text-[11px] block">{cell.count.toLocaleString()}</span>
                          ) : (
                            <span className="block">{cell.percentage.toFixed(1)}%</span>
                          )}

                          {cell.isDiagonal && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00E676] opacity-75" />
                          )}
                        </button>
                      </td>
                    );
                  })}

                  {/* Row Summary Metric */}
                  <td className="p-2 text-xs font-jetbrains font-black text-[#00E676] bg-[#050B14]/40 border-l border-slate-800/80">
                    {activeTab === "f1" ? (
                      actualMeta.f1Score.toFixed(3)
                    ) : activeTab === "prec-rec" ? (
                      `${actualMeta.recall.toFixed(1)}%`
                    ) : (
                      actualMeta.sampleCount.toLocaleString()
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. Per-Class Detail Pill / Inspection Card */}
      {selectedCell ? (
        <div 
          ref={inspectionCardRef}
          className="p-3 rounded-xl bg-transparent text-xs font-mono text-slate-300 flex items-start justify-between gap-3 shadow-md relative"
          style={{
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85)",
          }}
        >
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#00F2FE] shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-bold flex items-center gap-2">
                <span>Actual: <b className="text-[#00E676]">{DVORAK_CLASSES[selectedCell.actual].name}</b></span>
                <span>→</span>
                <span>Predicted: <b className="text-[#00F2FE]">{DVORAK_CLASSES[selectedCell.predicted].name}</b></span>
              </div>
              <p 
                className="text-[11px] text-white mt-0.5"
                style={{ textShadow: "0 1px 3px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.85)" }}
              >
                {selectedCell.count.toLocaleString()} Frames ({selectedCell.percentage.toFixed(1)}% of row) • {selectedCell.notes || (selectedCell.isDiagonal ? "High-confidence true positive classification." : "Minor off-diagonal morphology confusion under high wind shear.")}
              </p>
            </div>
          </div>

          <DismissPillButton onClick={() => setSelectedCell(null)} />
        </div>
      ) : (
        /* Summary Table Bar */
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-[rgba(0,242,254,0.14)] text-[11px] font-mono">
          {classKeys.map((k, idx) => {
            const m = DVORAK_CLASSES[k];
            return (
              <div 
                key={`stat-${k}`} 
                ref={(el) => { cardRefs.current[idx] = el; }}
                className="p-2.5 rounded-lg bg-transparent flex flex-col justify-between transition-all"
                style={{
                  border: "1.5px solid rgba(0, 242, 254, 0.45)",
                  boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.9), inset 0 0 12px rgba(0, 0, 0, 0.75), 0 0 8px rgba(0, 242, 254, 0.12)",
                }}
              >
                <div className="text-slate-300 font-sans text-[11px] font-medium truncate [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                  {m.name}
                </div>
                <div className="flex items-center justify-between mt-1.5 font-mono text-[11px]">
                  <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                    F1: {m.f1Score.toFixed(3)}
                  </span>
                  <span className="text-slate-400 text-[10px] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    P: {m.precision.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      </div>
    </section>
  );
}
