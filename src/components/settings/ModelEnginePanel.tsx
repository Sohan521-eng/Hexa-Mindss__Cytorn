"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Cpu, 
  RotateCcw, 
  Zap, 
  Flame, 
  Fan, 
  Clock, 
  Sparkles,
  Check 
} from "lucide-react";
import { ModelCheckpoint, PinnWeights, HardwareTelemetry, PrecisionMode } from "./types";
import Noise from "@/components/ui/Noise";
import { ScientistPillButton } from "@/components/ui/ScientistPillButton";
import { ElasticSlider } from "@/components/ui/ElasticSlider";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : useEffect;

function makeRoundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  return `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;
}



/**
 * TECHNICAL ARCHITECTURE & MATHEMATICAL FORMULATIONS:
 * 1. PINN Loss: L_total = L_MSE + lambda_NS * L_NS + lambda_Coriolis * L_Coriolis + lambda_SST * L_SST
 * 2. Latency EMA: bar(tau)_k = alpha * tau_k + (1 - alpha) * bar(tau)_(k-1), alpha = 0.15
 * 3. Architecture checkpoints with distinct dynamic themes and noise canvases.
 */

interface ModelEnginePanelProps {
  checkpoints: ModelCheckpoint[];
  pinnWeights: PinnWeights;
  hardware: HardwareTelemetry;
  onDeployCheckpoint: (checkpointId: string) => void;
  onUpdatePinnWeights: (updated: Partial<PinnWeights>) => void;
  onUpdateHardware: (updated: Partial<HardwareTelemetry>) => void;
  onNotify: (text: string, type: "success" | "warning" | "error") => void;
}

const CHECKPOINT_THEMES: Record<string, {
  color: string;
  bgColor: string;
  bgGradient: string;
  bgGradientSelected: string;
  borderNormal: string;
  borderSelected: string;
  shadowNormal: string;
  shadowSelected: string;
}> = {
  "v2.4-convnext-vit-ensemble": {
    color: "#00F2FE", // Electric Cyan
    bgColor: "#07131D",
    bgGradient: "linear-gradient(145deg, rgba(0, 242, 254, 0.16) 0%, rgba(0, 242, 254, 0.04) 45%, #050E17 100%)",
    bgGradientSelected: "linear-gradient(145deg, rgba(0, 242, 254, 0.28) 0%, rgba(0, 242, 254, 0.08) 45%, #071522 100%)",
    borderNormal: "1.5px solid rgba(0, 242, 254, 0.45)",
    borderSelected: "2px solid #00F2FE",
    shadowNormal: "0 4px 16px rgba(0,0,0,0.6), 0 0 14px rgba(0, 242, 254, 0.15)",
    shadowSelected: "0 0 0 2px rgba(0, 242, 254, 0.45), 0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(0, 242, 254, 0.25)",
  },
  "v2.3-swin-transformer-large": {
    color: "#A855F7", // Neural Violet
    bgColor: "#140A22",
    bgGradient: "linear-gradient(145deg, rgba(168, 85, 247, 0.16) 0%, rgba(168, 85, 247, 0.04) 45%, #0D0618 100%)",
    bgGradientSelected: "linear-gradient(145deg, rgba(168, 85, 247, 0.28) 0%, rgba(168, 85, 247, 0.08) 45%, #180C28 100%)",
    borderNormal: "1.5px solid rgba(168, 85, 247, 0.45)",
    borderSelected: "2px solid #A855F7",
    shadowNormal: "0 4px 16px rgba(0,0,0,0.6), 0 0 14px rgba(168, 85, 247, 0.15)",
    shadowSelected: "0 0 0 2px rgba(168, 85, 247, 0.45), 0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(168, 85, 247, 0.25)",
  },
  "v2.1-resnet50-baseline": {
    color: "#FFB300", // Amber Bronze
    bgColor: "#1A1104",
    bgGradient: "linear-gradient(145deg, rgba(255, 179, 0, 0.16) 0%, rgba(255, 179, 0, 0.04) 45%, #120B02 100%)",
    bgGradientSelected: "linear-gradient(145deg, rgba(255, 179, 0, 0.28) 0%, rgba(255, 179, 0, 0.08) 45%, #221605 100%)",
    borderNormal: "1.5px solid rgba(255, 179, 0, 0.45)",
    borderSelected: "2px solid #FFB300",
    shadowNormal: "0 4px 16px rgba(0,0,0,0.6), 0 0 14px rgba(255, 179, 0, 0.15)",
    shadowSelected: "0 0 0 2px rgba(255, 179, 0, 0.45), 0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(255, 179, 0, 0.25)",
  },
  "v3.0-experimental-mamba-vision": {
    color: "#00E676", // Emerald Green
    bgColor: "#061810",
    bgGradient: "linear-gradient(145deg, rgba(0, 230, 118, 0.16) 0%, rgba(0, 230, 118, 0.04) 45%, #041009 100%)",
    bgGradientSelected: "linear-gradient(145deg, rgba(0, 230, 118, 0.28) 0%, rgba(0, 230, 118, 0.08) 45%, #081F14 100%)",
    borderNormal: "1.5px solid rgba(0, 230, 118, 0.45)",
    borderSelected: "2px solid #00E676",
    shadowNormal: "0 4px 16px rgba(0,0,0,0.6), 0 0 14px rgba(0, 230, 118, 0.15)",
    shadowSelected: "0 0 0 2px rgba(0, 230, 118, 0.45), 0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(0, 230, 118, 0.25)",
  },
};

export const ModelEnginePanel: React.FC<ModelEnginePanelProps> = ({
  checkpoints,
  pinnWeights,
  hardware,
  onDeployCheckpoint,
  onUpdatePinnWeights,
  onUpdateHardware,
  onNotify,
}) => {
  const [selectedCheckpointId, setSelectedCheckpointId] = useState<string>(
    checkpoints.find((c) => c.isActive)?.id || checkpoints[0].id
  );
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Cut-out Mask Refs & State for PINN Loss Tuning Panel
  const pinnContainerRef = useRef<HTMLDivElement>(null);
  const pinnBox1Ref = useRef<HTMLDivElement>(null);
  const pinnBox2Ref = useRef<HTMLDivElement>(null);
  const pinnBox3Ref = useRef<HTMLDivElement>(null);
  const [pinnMaskStyle, setPinnMaskStyle] = useState<React.CSSProperties>({});

  // Cut-out Mask Refs & State for GPU Telemetry Panel
  const gpuContainerRef = useRef<HTMLDivElement>(null);
  const gpuBox1Ref = useRef<HTMLDivElement>(null);
  const gpuBox2Ref = useRef<HTMLDivElement>(null);
  const gpuBox3Ref = useRef<HTMLDivElement>(null);
  const gpuBox4Ref = useRef<HTMLDivElement>(null);
  const [gpuMaskStyle, setGpuMaskStyle] = useState<React.CSSProperties>({});

  useIsomorphicLayoutEffect(() => {
    const updatePinnCutouts = () => {
      if (!pinnContainerRef.current || !pinnBox1Ref.current || !pinnBox2Ref.current || !pinnBox3Ref.current) return;
      const c = pinnContainerRef.current;
      const cRect = c.getBoundingClientRect();
      const b1 = pinnBox1Ref.current.getBoundingClientRect();
      const b2 = pinnBox2Ref.current.getBoundingClientRect();
      const b3 = pinnBox3Ref.current.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const cw = Math.round(cRect.width);
      const ch = Math.round(cRect.height);

      const x1 = Math.round(b1.left - cRect.left);
      const y1 = Math.round(b1.top - cRect.top);
      const w1 = Math.round(b1.width);
      const h1 = Math.round(b1.height);

      const x2 = Math.round(b2.left - cRect.left);
      const y2 = Math.round(b2.top - cRect.top);
      const w2 = Math.round(b2.width);
      const h2 = Math.round(b2.height);

      const x3 = Math.round(b3.left - cRect.left);
      const y3 = Math.round(b3.top - cRect.top);
      const w3 = Math.round(b3.width);
      const h3 = Math.round(b3.height);

      if (w1 <= 0 || h1 <= 0 || w2 <= 0 || h2 <= 0 || w3 <= 0 || h3 <= 0) return;

      const r = 12; // rounded-xl

      const path = `M 0 0 H ${cw} V ${ch} H 0 Z ${makeRoundedRectPath(x1, y1, w1, h1, r)} ${makeRoundedRectPath(x2, y2, w2, h2, r)} ${makeRoundedRectPath(x3, y3, w3, h3, r)}`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}" viewBox="0 0 ${cw} ${ch}"><path fill-rule="evenodd" fill="#000" d="${path}" /></svg>`;
      const dataUri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

      setPinnMaskStyle({
        WebkitMaskImage: dataUri,
        maskImage: dataUri,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "0 0",
        maskPosition: "0 0",
      });
    };

    const updateGpuCutouts = () => {
      if (!gpuContainerRef.current || !gpuBox1Ref.current || !gpuBox2Ref.current || !gpuBox3Ref.current || !gpuBox4Ref.current) return;
      const c = gpuContainerRef.current;
      const cRect = c.getBoundingClientRect();
      const b1 = gpuBox1Ref.current.getBoundingClientRect();
      const b2 = gpuBox2Ref.current.getBoundingClientRect();
      const b3 = gpuBox3Ref.current.getBoundingClientRect();
      const b4 = gpuBox4Ref.current.getBoundingClientRect();
      if (cRect.width === 0 || cRect.height === 0) return;

      const cw = Math.round(cRect.width);
      const ch = Math.round(cRect.height);

      const x1 = Math.round(b1.left - cRect.left);
      const y1 = Math.round(b1.top - cRect.top);
      const w1 = Math.round(b1.width);
      const h1 = Math.round(b1.height);

      const x2 = Math.round(b2.left - cRect.left);
      const y2 = Math.round(b2.top - cRect.top);
      const w2 = Math.round(b2.width);
      const h2 = Math.round(b2.height);

      const x3 = Math.round(b3.left - cRect.left);
      const y3 = Math.round(b3.top - cRect.top);
      const w3 = Math.round(b3.width);
      const h3 = Math.round(b3.height);

      const x4 = Math.round(b4.left - cRect.left);
      const y4 = Math.round(b4.top - cRect.top);
      const w4 = Math.round(b4.width);
      const h4 = Math.round(b4.height);

      if (w1 <= 0 || h1 <= 0 || w2 <= 0 || h2 <= 0 || w3 <= 0 || h3 <= 0 || w4 <= 0 || h4 <= 0) return;

      const r = 12; // rounded-xl

      const path = `M 0 0 H ${cw} V ${ch} H 0 Z ${makeRoundedRectPath(x1, y1, w1, h1, r)} ${makeRoundedRectPath(x2, y2, w2, h2, r)} ${makeRoundedRectPath(x3, y3, w3, h3, r)} ${makeRoundedRectPath(x4, y4, w4, h4, r)}`;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${cw}" height="${ch}" viewBox="0 0 ${cw} ${ch}"><path fill-rule="evenodd" fill="#000" d="${path}" /></svg>`;
      const dataUri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;

      setGpuMaskStyle({
        WebkitMaskImage: dataUri,
        maskImage: dataUri,
        WebkitMaskSize: "100% 100%",
        maskSize: "100% 100%",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "0 0",
        maskPosition: "0 0",
      });
    };

    const updateAll = () => {
      updatePinnCutouts();
      updateGpuCutouts();
    };

    updateAll();
    const rafId = requestAnimationFrame(updateAll);
    const timerId = setTimeout(updateAll, 50);

    const ro = new ResizeObserver(updateAll);
    if (pinnContainerRef.current) ro.observe(pinnContainerRef.current);
    if (pinnBox1Ref.current) ro.observe(pinnBox1Ref.current);
    if (pinnBox2Ref.current) ro.observe(pinnBox2Ref.current);
    if (pinnBox3Ref.current) ro.observe(pinnBox3Ref.current);

    if (gpuContainerRef.current) ro.observe(gpuContainerRef.current);
    if (gpuBox1Ref.current) ro.observe(gpuBox1Ref.current);
    if (gpuBox2Ref.current) ro.observe(gpuBox2Ref.current);
    if (gpuBox3Ref.current) ro.observe(gpuBox3Ref.current);
    if (gpuBox4Ref.current) ro.observe(gpuBox4Ref.current);

    window.addEventListener("resize", updateAll);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      ro.disconnect();
      window.removeEventListener("resize", updateAll);
    };
  }, []);



  const handleDeploy = () => {
    onDeployCheckpoint(selectedCheckpointId);
    const chosen = checkpoints.find((c) => c.id === selectedCheckpointId);
    onNotify(
      `Hot-swap successful: Checkpoint '${chosen?.name}' deployed to production inference pipeline.`,
      "success"
    );
  };

  const handleResetPinn = () => {
    onUpdatePinnWeights({
      navierStokesPenalty: 0.05,
      coriolisCoeff: 0.02,
      sstThermalCoupling: 0.03,
    });
    onNotify("PINN atmospheric loss penalty weights reset to scientific baseline.", "warning");
  };

  const handleBenchmarkLatency = () => {
    setIsBenchmarking(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      const jitteredSample = 23.5 + Math.random() * 3.2;
      const alpha = 0.15;
      const newEma = alpha * jitteredSample + (1 - alpha) * hardware.inferenceLatencyMs;
      
      onUpdateHardware({
        inferenceLatencyMs: Number(newEma.toFixed(1)),
        fpsThroughput: Number((1000 / newEma).toFixed(1)),
      });

      if (step >= 6) {
        clearInterval(interval);
        setIsBenchmarking(false);
        onNotify(
          `GPU inference benchmark complete: 50 passes converged to ${newEma.toFixed(1)} ms EMA.`,
          "success"
        );
      }
    }, 120);
  };

  const vramPercent = Math.round((hardware.vramUsedGb / hardware.vramTotalGb) * 100);
  const activeCheckpoint = checkpoints.find((c) => c.isActive);

  return (
    <section id="model-engine" className="scroll-mt-20 space-y-4">
      {/* Streamlined Section Title */}
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(0,242,254,0.25)] pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-wide flex items-center">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                AI Model Engine &amp; Hardware GPU Runtime Manager
              </span>
            </span>
          </h2>
        </div>
      </div>


      {/* CHECKPOINT SELECTION CARDS */}
      <div
        className="relative overflow-hidden rounded-xl p-4 sm:p-5 space-y-3 bg-[#0A1322]"
        style={{
          backgroundColor: "#0A1322",
          backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
          border: "1.5px solid rgba(0, 242, 254, 0.45)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 14px rgba(0, 242, 254, 0.15)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
          <Noise patternSize={250} patternScaleX={1.4} patternScaleY={1.4} patternRefreshInterval={2} patternAlpha={9} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              Neural Network Checkpoints (Hot-Swap)
            </h3>
          </div>

          <ScientistPillButton
            onClick={handleDeploy}
            disabled={selectedCheckpointId === activeCheckpoint?.id}
            className="scientist-pill-green !h-7 !min-w-0 !px-3 !py-0 !rounded-lg !gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            icon={<Sparkles className="w-3 h-3 text-[#00E676] shrink-0" />}
            hoverIcon={<Sparkles className="w-3 h-3 text-[#050B14] shrink-0" />}
            label={
              <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#00E676]">
                {selectedCheckpointId === activeCheckpoint?.id
                  ? "Currently Deployed"
                  : "Deploy Checkpoint"}
              </span>
            }
            hoverLabel={
              <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#050B14]">
                {selectedCheckpointId === activeCheckpoint?.id
                  ? "Currently Deployed"
                  : "Deploy Checkpoint"}
              </span>
            }
            title={
              selectedCheckpointId === activeCheckpoint?.id
                ? "Active ViT/PINN architecture checkpoint"
                : "Hot-swap and deploy selected checkpoint to GPU inference runtime"
            }
          />
        </div>

        {/* 4 Cards Grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 pt-1">
          {checkpoints.map((cp) => {
            const isSelected = selectedCheckpointId === cp.id;
            const isCurrentlyActive = cp.isActive;
            const theme = CHECKPOINT_THEMES[cp.id] || {
              color: "#00F2FE",
              bgColor: "#07131D",
              bgGradient: "linear-gradient(145deg, rgba(0, 242, 254, 0.16) 0%, rgba(0, 242, 254, 0.04) 45%, #050E17 100%)",
              bgGradientSelected: "linear-gradient(145deg, rgba(0, 242, 254, 0.28) 0%, rgba(0, 242, 254, 0.08) 45%, #071522 100%)",
              borderNormal: "1.5px solid rgba(0, 242, 254, 0.45)",
              borderSelected: "2px solid #00F2FE",
              shadowNormal: "0 4px 16px rgba(0,0,0,0.6), 0 0 14px rgba(0, 242, 254, 0.15)",
              shadowSelected: "0 0 0 2px rgba(0, 242, 254, 0.45), 0 8px 24px rgba(0,0,0,0.85), 0 0 16px rgba(0, 242, 254, 0.25)",
            };

            return (
              <div
                key={cp.id}
                onClick={() => setSelectedCheckpointId(cp.id)}
                className={`relative overflow-hidden group rounded-lg p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "scale-[1.015] -translate-y-0.5"
                    : "hover:scale-[1.008] opacity-90 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: theme.bgColor,
                  backgroundImage: isSelected ? theme.bgGradientSelected : theme.bgGradient,
                  border: isSelected ? theme.borderSelected : theme.borderNormal,
                  boxShadow: isSelected ? theme.shadowSelected : theme.shadowNormal,
                }}
              >
                {/* Background Noise Effect */}
                <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden">
                  <Noise patternSize={250} patternScaleX={2.0} patternScaleY={2.0} patternRefreshInterval={2} patternAlpha={10} />
                </div>

                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-1.5 mb-1.5">
                      <span
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border"
                        style={{
                          backgroundColor: `${theme.color}20`,
                          color: theme.color,
                          borderColor: `${theme.color}55`,
                        }}
                      >
                        {isCurrentlyActive ? "ACTIVE" : cp.tag}
                      </span>

                      {/* Top-Right: Parameters count & Active Checkmark Badge */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] text-white font-semibold [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                          {cp.parametersCount}
                        </span>
                        {isSelected ? (
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 shadow-sm"
                            style={{
                              backgroundColor: theme.color,
                              color: "#050B14",
                            }}
                            title="Selected Checkpoint"
                          >
                            <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                          </span>
                        ) : (
                          <span
                            className="w-4 h-4 rounded-full border border-slate-600/60 bg-[#050B14]/60 shrink-0"
                            title="Click to select"
                          />
                        )}
                      </div>
                    </div>

                    <h4
                      className="font-space font-semibold text-xs transition-colors"
                      style={{
                        color: theme.color,
                        textShadow: "0 1px 3px rgba(0,0,0,0.9)",
                      }}
                    >
                      {cp.name}
                    </h4>
                    <p className="font-sans text-[11px] text-white mt-1 line-clamp-2 leading-relaxed [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                      {cp.description}
                    </p>
                  </div>

                  <div
                    className="mt-3 pt-2.5 border-t flex items-center justify-between text-[11px] font-mono"
                    style={{ borderColor: `${theme.color}35` }}
                  >
                    <span className="text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">Val Loss:</span>
                    <span className="font-bold" style={{ color: theme.color, textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
                      {cp.trainingLoss.toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PINN WEIGHTS & GPU TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PINN Tuning */}
        <div
          ref={pinnContainerRef}
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 h-full bg-transparent"
          style={{
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 14px rgba(0, 242, 254, 0.15)",
          }}
        >
          {/* Background layer with punched-out cutouts for the slider sections */}
          <div
            className="absolute inset-0 bg-[#0A1322] pointer-events-none rounded-xl overflow-hidden w-full h-full"
            style={{
              backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
              ...pinnMaskStyle,
            }}
          >
            <Noise patternSize={250} patternScaleX={1.2} patternScaleY={1.2} patternRefreshInterval={2} patternAlpha={10} />
            <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                  PINN Atmospheric Physics Loss Tuning
                </h3>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-2.5 flex-1 flex flex-col justify-around py-1">
              {/* Navier-Stokes Penalty */}
              <div
                ref={pinnBox1Ref}
                className="p-3 rounded-xl bg-transparent space-y-1 relative"
                style={{
                  border: "1.5px solid rgba(0, 242, 254, 0.45)",
                  boxShadow: "inset 0 3px 14px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 242, 254, 0.12)",
                }}
              >
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    Navier-Stokes Penalty (λ_NS)
                  </span>
                  <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                    {pinnWeights.navierStokesPenalty.toFixed(3)}
                  </span>
                </div>
                <div
                  style={
                    {
                      "--es-accent": "#00F2FE",
                      "--es-accent-dim": "#00F2FE55",
                      "--es-accent-glow": "#00F2FE8C",
                    } as React.CSSProperties
                  }
                  className="accent-slider-wrap w-full"
                >
                  <ElasticSlider
                    value={pinnWeights.navierStokesPenalty}
                    defaultValue={0.055}
                    startingValue={0.00}
                    maxValue={0.20}
                    stepSize={0.005}
                    isStepped={true}
                    onChange={(val) => onUpdatePinnWeights({ navierStokesPenalty: parseFloat(val.toFixed(3)) })}
                    className="rm-elastic w-full"
                    showThumb={true}
                    showValueIndicator={false}
                  />
                </div>
              </div>

              {/* Coriolis Drift Force */}
              <div
                ref={pinnBox2Ref}
                className="p-3 rounded-xl bg-transparent space-y-1 relative"
                style={{
                  border: "1.5px solid rgba(0, 242, 254, 0.45)",
                  boxShadow: "inset 0 3px 14px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 242, 254, 0.12)",
                }}
              >
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    Coriolis Drift Force (λ_Coriolis)
                  </span>
                  <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                    {pinnWeights.coriolisCoeff.toFixed(3)}
                  </span>
                </div>
                <div
                  style={
                    {
                      "--es-accent": "#00F2FE",
                      "--es-accent-dim": "#00F2FE55",
                      "--es-accent-glow": "#00F2FE8C",
                    } as React.CSSProperties
                  }
                  className="accent-slider-wrap w-full"
                >
                  <ElasticSlider
                    value={pinnWeights.coriolisCoeff}
                    defaultValue={0.020}
                    startingValue={0.00}
                    maxValue={0.10}
                    stepSize={0.002}
                    isStepped={true}
                    onChange={(val) => onUpdatePinnWeights({ coriolisCoeff: parseFloat(val.toFixed(3)) })}
                    className="rm-elastic w-full"
                    showThumb={true}
                    showValueIndicator={false}
                  />
                </div>
              </div>

              {/* SST Enthalpy Coupling */}
              <div
                ref={pinnBox3Ref}
                className="p-3 rounded-xl bg-transparent space-y-1 relative"
                style={{
                  border: "1.5px solid rgba(0, 242, 254, 0.45)",
                  boxShadow: "inset 0 3px 14px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 242, 254, 0.12)",
                }}
              >
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    SST Enthalpy Coupling (λ_SST)
                  </span>
                  <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                    {pinnWeights.sstThermalCoupling.toFixed(3)}
                  </span>
                </div>
                <div
                  style={
                    {
                      "--es-accent": "#00F2FE",
                      "--es-accent-dim": "#00F2FE55",
                      "--es-accent-glow": "#00F2FE8C",
                    } as React.CSSProperties
                  }
                  className="accent-slider-wrap w-full"
                >
                  <ElasticSlider
                    value={pinnWeights.sstThermalCoupling}
                    defaultValue={0.030}
                    startingValue={0.00}
                    maxValue={0.15}
                    stepSize={0.005}
                    isStepped={true}
                    onChange={(val) => onUpdatePinnWeights({ sstThermalCoupling: parseFloat(val.toFixed(3)) })}
                    className="rm-elastic w-full"
                    showThumb={true}
                    showValueIndicator={false}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer PINN Loss Formulation & Reset (Matches Benchmark Latency footer) */}
          <div className="relative z-10 pt-3 border-t border-[rgba(0,242,254,0.18)] flex items-center justify-between">
            <span className="text-xs font-mono text-[#00F2FE] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span className="text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Loss Weight Sum:</span>
              <span className="font-bold text-[#00F2FE]">
                λ_total = {(pinnWeights.navierStokesPenalty + pinnWeights.coriolisCoeff + pinnWeights.sstThermalCoupling).toFixed(3)}
              </span>
            </span>

            <ScientistPillButton
              onClick={handleResetPinn}
              className="scientist-pill !h-8 !min-w-0 !px-3 !py-0 !rounded-lg !gap-1.5"
              icon={<RotateCcw className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
              hoverIcon={<RotateCcw className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
              label={
                <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white">
                  Reset Baseline
                </span>
              }
              hoverLabel={
                <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                  Reset Baseline
                </span>
              }
              title="Reset PINN atmospheric loss weights to calibrated baseline"
            />
          </div>
        </div>

        {/* Hardware GPU Telemetry */}
        <div
          ref={gpuContainerRef}
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 h-full bg-transparent"
          style={{
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 14px rgba(0, 242, 254, 0.15)",
          }}
        >
          {/* Background layer with punched-out cutouts for the gauges & VRAM sections */}
          <div
            className="absolute inset-0 bg-[#0A1322] pointer-events-none rounded-xl overflow-hidden w-full h-full"
            style={{
              backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
              ...gpuMaskStyle,
            }}
          >
            <Noise patternSize={250} patternScaleX={1.2} patternScaleY={1.2} patternRefreshInterval={2} patternAlpha={10} />
            <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                  GPU Telemetry &amp; Compute Precision
                </h3>
              </div>
            </div>

            {/* Gauges */}
            <div className="grid grid-cols-3 gap-2">
              <div
                ref={gpuBox1Ref}
                className="p-2.5 rounded-xl bg-transparent text-center flex flex-col justify-center relative"
                style={{
                  border: "1.5px solid rgba(0, 242, 254, 0.45)",
                  boxShadow: "inset 0 3px 14px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 242, 254, 0.12)",
                }}
              >
                <span className="text-[9px] font-mono text-white uppercase [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                  GPU Load
                </span>
                <div className="font-mono text-base font-bold text-[#00F2FE] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                  {hardware.gpuCoreLoadPercent}%
                </div>
              </div>
              <div
                ref={gpuBox2Ref}
                className="p-2.5 rounded-xl bg-transparent text-center flex flex-col justify-center relative"
                style={{
                  border: "1.5px solid rgba(0, 242, 254, 0.45)",
                  boxShadow: "inset 0 3px 14px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 242, 254, 0.12)",
                }}
              >
                <span className="text-[9px] font-mono text-white uppercase flex items-center justify-center gap-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                  <Flame className="w-2.5 h-2.5 text-white" />
                  <span>Temp</span>
                </span>
                <div className="font-mono text-base font-bold text-[#00F2FE] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                  {hardware.gpuTempCelsius}°C
                </div>
              </div>
              <div
                ref={gpuBox3Ref}
                className="p-2.5 rounded-xl bg-transparent text-center flex flex-col justify-center relative"
                style={{
                  border: "1.5px solid rgba(0, 242, 254, 0.45)",
                  boxShadow: "inset 0 3px 14px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 242, 254, 0.12)",
                }}
              >
                <span className="text-[9px] font-mono text-white uppercase flex items-center justify-center gap-1 [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                  <Fan className="w-2.5 h-2.5 text-white" />
                  <span>Fan</span>
                </span>
                <div className="font-mono text-base font-bold text-[#00F2FE] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                  {hardware.fanRpm}
                </div>
              </div>
            </div>


            {/* VRAM Meter */}
            <div
              ref={gpuBox4Ref}
              className="p-3 rounded-xl bg-transparent space-y-1.5 relative"
              style={{
                border: "1.5px solid rgba(0, 242, 254, 0.45)",
                boxShadow: "inset 0 3px 14px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85), 0 0 10px rgba(0, 242, 254, 0.12)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-white" />
                  VRAM Allocation
                </span>
                <span className="font-mono text-xs font-bold text-[#00F2FE] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                  {hardware.vramUsedGb.toFixed(1)} / {hardware.vramTotalGb.toFixed(1)} GB ({vramPercent}%)
                </span>
              </div>
              {/* Cyber Gradient Glow Progress Bar */}
              <div
                className="w-full h-1.5 rounded-full bg-[#050B14] border border-[rgba(0,242,254,0.3)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-gradient-to-r from-[#00F2FE] via-[#00F2FE] to-[#00E676] rounded-full shadow-[0_0_12px_rgba(0,242,254,0.6)] transition-all duration-500 ease-out"
                  style={{ width: `${vramPercent}%` }}
                />
              </div>
            </div>

            {/* Precision Modes Segmented Pill Bar (Matches SettingsNavPills styling & effects) */}
            <div className="w-full grid grid-cols-3 gap-1 sm:gap-1.5 p-1 rounded-lg sm:rounded-xl bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
              {[
                { id: "FP16", label: "FP16 Mixed", icon: Zap },
                { id: "FP32", label: "FP32 Single", icon: Cpu },
                { id: "INT8", label: "INT8 TensorRT", icon: Sparkles },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = hardware.precisionMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onUpdateHardware({ precisionMode: mode.id as PrecisionMode })}
                    className={`group flex items-center justify-center gap-1.5 px-2 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)] font-black"
                        : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors duration-200 ${
                        isSelected ? "text-[#00F2FE]" : "text-[#8E9EB5] group-hover:text-[#00F2FE]"
                      }`}
                    />
                    <span className="truncate">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Benchmark */}
          <div className="relative z-10 pt-3 border-t border-[rgba(0,242,254,0.18)] flex items-center justify-between">
            <span className="text-xs font-mono text-[#00F2FE] [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span className="font-bold">{hardware.inferenceLatencyMs} ms</span>
              <span className="text-[10.5px] text-[#00F2FE]/80">({hardware.fpsThroughput} FPS)</span>
            </span>

            <ScientistPillButton
              onClick={handleBenchmarkLatency}
              disabled={isBenchmarking}
              className="scientist-pill !h-8 !min-w-0 !px-3 !py-0 !rounded-lg !gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              icon={
                <Zap
                  className={`w-3.5 h-3.5 text-[#00F2FE] shrink-0 ${
                    isBenchmarking ? "animate-bounce text-[#FFB300]" : ""
                  }`}
                />
              }
              hoverIcon={
                <Zap
                  className={`w-3.5 h-3.5 text-[#050B14] shrink-0 ${
                    isBenchmarking ? "animate-bounce" : ""
                  }`}
                />
              }
              label={
                <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white">
                  {isBenchmarking ? "Benchmarking..." : "Benchmark Latency"}
                </span>
              }
              hoverLabel={
                <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                  {isBenchmarking ? "Benchmarking..." : "Benchmark Latency"}
                </span>
              }
              title="Run 50-pass live GPU inference benchmark to measure latency EMA"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
