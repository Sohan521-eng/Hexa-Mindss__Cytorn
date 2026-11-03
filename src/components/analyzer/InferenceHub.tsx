"use client";

import React, { useState } from "react";
import { 
  Cpu, 
  Play, 
  Zap, 
  CheckCircle2, 
  Activity, 
  Server, 
  Sparkles,
  RefreshCw
} from "lucide-react";
import Noise from "@/components/ui/Noise";

export type ModelCheckpoint = "convnext-vit" | "efficientnet-b0" | "resnet50" | "ensemble";

interface InferenceHubProps {
  selectedModel: ModelCheckpoint;
  onModelChange: (model: ModelCheckpoint) => void;
  onRunInference: () => void;
  isRunning: boolean;
  progress: number; // 0 - 100
  latencyMs: number;
}

export function InferenceHub({
  selectedModel,
  onModelChange,
  onRunInference,
  isRunning,
  progress,
  latencyMs,
}: InferenceHubProps) {
  const models: { id: ModelCheckpoint; name: string; tag: string; desc: string }[] = [
    {
      id: "efficientnet-b0",
      name: "EfficientNet-B0 Dual-Head (92.4% Accuracy)",
      tag: "SIH Production",
      desc: "Multi-task 4-channel model (IR, WV, VIS, PMW) with 92.4% pattern accuracy and 6.8 kt MAE",
    },
    {
      id: "convnext-vit",
      name: "Hybrid ConvNeXt-ViT (Primary)",
      tag: "SOTA Dual-Branch",
      desc: "Local ConvNeXt eyewall gradient + ViT global rainband attention",
    },
    {
      id: "resnet50",
      name: "ResNet-50 Dvorak Baseline",
      tag: "Operational",
      desc: "Standard 2D convolutional baseline trained on 20-year INSAT archive",
    },
    {
      id: "ensemble",
      name: "Deep-Cyclone Multi-Spectral Ensemble",
      tag: "High Reliability",
      desc: "Stacked fusion of 3 backbone models across TIR-1, TIR-2, and WV",
    },
  ];

  const currentModel = models.find((m) => m.id === selectedModel) || models[0];

  return (
    <div className="relative overflow-hidden bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] rounded-xl p-4 shadow-[0_0_15px_rgba(0,242,254,0.1),0_4px_24px_rgba(0,0,0,0.6)]">
      {/* Background Tactile Film-Grain Noise */}
      <Noise
        patternSize={250}
        patternScaleX={1.2}
        patternScaleY={1.2}
        patternRefreshInterval={2}
        patternAlpha={15}
      />

      <div className="relative z-10 space-y-3.5">
        {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1E3252]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#00F2FE]/15 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE]">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="font-rajdhani text-xs font-bold text-white uppercase tracking-wider">
            Model Checkpoint & GPU Inference Hub
          </span>
        </div>
        <span className="text-[10px] font-mono text-[#10E7A2] flex items-center gap-1 bg-[#10E7A2]/10 px-1.5 py-0.5 rounded border border-[#10E7A2]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10E7A2] animate-pulse" />
          NVIDIA L4 Ready
        </span>
      </div>

      {/* Model Selector Dropdown */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono uppercase text-[#8E9EB5]">
          Active Architecture Checkpoint:
        </label>
        <div className="relative">
          <select
            value={selectedModel}
            onChange={(e) => onModelChange(e.target.value as ModelCheckpoint)}
            disabled={isRunning}
            className="w-full bg-[#050B14] border border-[#1E3252] focus:border-[#00F2FE] rounded-lg px-3 py-2 text-xs font-mono text-white outline-none cursor-pointer pr-8"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id} className="bg-[#0F1B2F] text-white">
                {m.name} [{m.tag}]
              </option>
            ))}
          </select>
        </div>
        <p className="text-[10px] font-mono text-[#8E9EB5] italic">
          {currentModel.desc}
        </p>
      </div>

      {/* Inference CTA Execution Button */}
      <div>
        <button
          onClick={onRunInference}
          disabled={isRunning}
          className={`w-full py-2.5 px-4 rounded-xl font-rajdhani font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-98 ${
            isRunning
              ? "bg-[#0E3D59] text-slate-300 border border-[#00F2FE]/30 cursor-wait"
              : "bg-gradient-to-r from-[#00F2FE] to-[#00A3FF] hover:from-[#00D2FF] hover:to-[#0088FF] text-[#050B14] font-extrabold shadow-[0_0_20px_rgba(0,242,254,0.35)]"
          }`}
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-[#00F2FE]" />
              <span>Executing GPU Tensor Inference ({progress}%)...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              <span>Run AI Pattern Analysis</span>
            </>
          )}
        </button>

        {/* Progress Bar (during active inference) */}
        {isRunning && (
          <div className="mt-2 space-y-1">
            <div className="w-full h-1.5 bg-[#050B14] rounded-full overflow-hidden border border-[#1E3252]">
              <div 
                className="h-full bg-gradient-to-r from-[#00F2FE] to-[#10E7A2] transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-[#8E9EB5]">
              <span>
                {progress < 30 ? "Tensor Normalization" : progress < 75 ? "ConvNeXt-ViT Fusion" : "Generating Heatmaps"}
              </span>
              <span className="text-[#00F2FE]">{progress}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Latency & GPU Benchmark Stats */}
      <div className="p-2.5 rounded-lg bg-[#050B14]/80 border border-[#1E3252] text-[10px] font-mono space-y-1">
        <div className="flex justify-between text-slate-300">
          <span className="text-[#8E9EB5]">Inference Latency:</span>
          <span className="text-[#10E7A2] font-bold">{latencyMs}ms (TensorRT FP16)</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span className="text-[#8E9EB5]">VRAM Allocation:</span>
          <span className="text-white">1.24 GB / 24 GB (NVIDIA L4)</span>
        </div>
        <div className="flex justify-between text-slate-300">
          <span className="text-[#8E9EB5]">Input Tensor:</span>
          <span className="text-[#00F2FE]">1 × 5 × 512 × 512 (Multi-Spectral)</span>
        </div>
      </div>
      </div>
    </div>
  );
}
