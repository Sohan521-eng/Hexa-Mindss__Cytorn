"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Layers, 
  Download, 
  Activity, 
  CloudLightning,
  ChevronDown
} from "lucide-react";
import { ModelCheckpointId, BenchmarkStormId } from "./types";
import { MODEL_CHECKPOINTS, BENCHMARK_STORMS } from "./benchmarkData";
import Noise from "@/components/ui/Noise";
import { useGsapPill, PillButton } from "@/components/forecast/ForecastTopBar";
import { ScientistPillButton } from "@/components/ui/ScientistPillButton";
import { generateValidationPdf } from "./exportValidationPdf";

/* ─── Framer Motion Variants matching ForecastTopBar & RadiometricStrip ─── */
const PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.92, y: -10, filter: "blur(6px)" },
  visible: {
    opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], staggerChildren: 0.04, delayChildren: 0.02 },
  },
  exit: {
    opacity: 0, scale: 0.94, y: -8, filter: "blur(4px)",
    transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -6, y: -2 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

/* ─── Model Checkpoint Selector Pill ─── */
function ModelSelectorPill({
  selectedModel,
  onSelectModel,
}: {
  selectedModel: ModelCheckpointId;
  onSelectModel: (id: ModelCheckpointId) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const currentModel = MODEL_CHECKPOINTS[selectedModel];
  const { btnRef, circleRef, handleEnter, handleLeave } = useGsapPill(selectedModel);

  useEffect(() => { setMounted(true); }, []);

  const updateDropPos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropWidth = 320;
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
        icon={<Layers style={{ width: 14, height: 14 }} />}
        label={
          <span className="flex items-center gap-2">
            <span>{currentModel.name}</span>
            <ChevronDown style={{ width: 12, height: 12, opacity: 0.7 }} />
          </span>
        }
        style={{
          height: "38px",
          borderRadius: "0.5rem",
        }}
      />
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={dropdownRef}
              key="model-selector-dropdown"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={PANEL_VARIANTS}
              style={{ position: "fixed", top: dropPos.top, left: dropPos.left, zIndex: 9999, transformOrigin: "top left" }}
              className="min-w-[320px] max-w-[360px] bg-[#0F1B2F]/95 backdrop-blur-xl border border-[rgba(0,242,254,0.45)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(0,242,254,0.18)] transform-gpu overflow-hidden"
            >
              <Noise patternSize={250} patternScaleX={2.5} patternScaleY={2.5} patternRefreshInterval={2} patternAlpha={10} />
              <div className="relative z-10 flex flex-col space-y-1">
                {Object.values(MODEL_CHECKPOINTS).map((model) => {
                  const active = model.id === selectedModel;
                  return (
                    <motion.button
                      key={model.id}
                      variants={ITEM_VARIANTS}
                      type="button"
                      onClick={() => { onSelectModel(model.id); setOpen(false); }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                        active
                          ? "bg-[rgba(0,242,254,0.14)] border-[rgba(0,242,254,0.5)] shadow-[0_0_12px_rgba(0,242,254,0.22)]"
                          : "bg-transparent border-transparent hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${active ? "bg-[#00F2FE]/20 text-[#00F2FE]" : "bg-white/5 text-[#8E9EB5]"}`}>
                          <Layers className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold font-rajdhani uppercase tracking-wider truncate ${active ? "text-[#00F2FE]" : "text-white"}`}>{model.name}</div>
                          <div className="text-[10px] text-[#8E9EB5] font-mono leading-tight truncate">{model.architecture}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                        active
                          ? "bg-[#10E7A2]/15 text-[#10E7A2] border-[#10E7A2]/40"
                          : "bg-white/5 text-[#8E9EB5] border-white/10"
                      }`}>
                        {model.badge}
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

/* ─── Benchmark Historical Storm Selector Pill ─── */
function BenchmarkStormSelectorPill({
  selectedStorm,
  onSelectStorm,
}: {
  selectedStorm: BenchmarkStormId;
  onSelectStorm: (id: BenchmarkStormId) => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const currentStorm = BENCHMARK_STORMS[selectedStorm];
  const { btnRef, circleRef, handleEnter, handleLeave } = useGsapPill(selectedStorm);

  useEffect(() => { setMounted(true); }, []);

  const updateDropPos = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const dropWidth = 300;
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
        icon={<CloudLightning style={{ width: 14, height: 14 }} />}
        label={
          <span className="flex items-center gap-2">
            <span>{currentStorm.name}</span>
            <ChevronDown style={{ width: 12, height: 12, opacity: 0.7 }} />
          </span>
        }
        style={{
          height: "38px",
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
              className="min-w-[300px] max-w-[340px] bg-[#0F1B2F]/95 backdrop-blur-xl border border-[rgba(0,242,254,0.45)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(0,242,254,0.18)] transform-gpu overflow-hidden"
            >
              <Noise patternSize={250} patternScaleX={2.5} patternScaleY={2.5} patternRefreshInterval={2} patternAlpha={10} />
              <div className="relative z-10 flex flex-col space-y-1">
                {Object.values(BENCHMARK_STORMS).map((storm) => {
                  const active = storm.id === selectedStorm;
                  return (
                    <motion.button
                      key={storm.id}
                      variants={ITEM_VARIANTS}
                      type="button"
                      onClick={() => { onSelectStorm(storm.id); setOpen(false); }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                        active
                          ? "bg-[rgba(0,242,254,0.14)] border-[rgba(0,242,254,0.5)] shadow-[0_0_12px_rgba(0,242,254,0.22)]"
                          : "bg-transparent border-transparent hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${active ? "bg-[#00F2FE]/20 text-[#00F2FE]" : "bg-white/5 text-[#8E9EB5]"}`}>
                          <CloudLightning className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold font-rajdhani uppercase tracking-wider truncate ${active ? "text-[#00F2FE]" : "text-white"}`}>{storm.name}</div>
                          <div className="text-[10px] text-[#8E9EB5] font-mono leading-tight truncate">{storm.basin} • {storm.year}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                        active
                          ? "bg-[#10E7A2]/15 text-[#10E7A2] border-[#10E7A2]/40"
                          : "bg-white/5 text-[#8E9EB5] border-white/10"
                      }`}>
                        {storm.category.includes("Super") ? "SUPER" : "HISTORIC"}
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

/* ─── Export Report Pill Button (Matches SC / ScientistProfilePill Styling & GSAP physics) ─── */
function ExportReportPillButton({ onClick }: { onClick: () => void }) {
  return (
    <ScientistPillButton
      onClick={onClick}
      icon={<Download className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
      hoverIcon={<Download className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
      label={<span className="text-white font-rajdhani font-bold text-xs uppercase tracking-wider">Export Report (PDF)</span>}
      hoverLabel={<span className="text-[#050B14] font-rajdhani font-bold text-xs uppercase tracking-wider">Export Report (PDF)</span>}
      title="Export Full Validation Whitepaper (PDF)"
    />
  );
}

interface MetricsTopBarProps {
  selectedModel: ModelCheckpointId;
  onSelectModel: (id: ModelCheckpointId) => void;
  selectedStorm: BenchmarkStormId;
  onSelectStorm: (id: BenchmarkStormId) => void;
  onOpenReportModal?: () => void;
  onExportPdf?: () => void;
}

export function MetricsTopBar({
  selectedModel,
  onSelectModel,
  selectedStorm,
  onSelectStorm,
  onOpenReportModal,
  onExportPdf,
}: MetricsTopBarProps) {
  const currentModel = MODEL_CHECKPOINTS[selectedModel];
  const currentStorm = BENCHMARK_STORMS[selectedStorm];

  const handleExport = () => {
    if (onExportPdf) {
      onExportPdf();
    } else {
      generateValidationPdf(currentModel, currentStorm);
    }
  };

  return (
    <header 
      id="metrics-summary-bar"
      className="relative z-20 w-full rounded-2xl overflow-hidden p-3.5 sm:p-4 transition-all duration-200 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.18)",
      }}
    >
      {/* Background layer with Noise film-grain & subtle ambient glow */}
      <div className="absolute inset-0 bg-[#0F1B2F]/95 backdrop-blur-md pointer-events-none rounded-2xl overflow-hidden">
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={12}
        />
        <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        
        {/* Title & Scientific Identity */}
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold font-orbitron tracking-wide text-[#00F2FE] uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              Model Performance &amp; Validation Archive
            </h1>
          </div>
        </div>

        {/* Tactical Selectors & Export CTA */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Model Checkpoint Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-[#00F2FE]" />
              Model Checkpoint
            </label>
            <ModelSelectorPill
              selectedModel={selectedModel}
              onSelectModel={onSelectModel}
            />
          </div>

          {/* Benchmark Storm Selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00E676] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-[#00E676]" />
              Benchmark Historical Storm
            </label>
            <BenchmarkStormSelectorPill
              selectedStorm={selectedStorm}
              onSelectStorm={onSelectStorm}
            />
          </div>

          {/* Export Report CTA */}
          <div className="flex flex-col justify-end self-end">
            <ExportReportPillButton onClick={handleExport} />
          </div>

        </div>

      </div>
    </header>
  );
}
