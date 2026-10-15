"use client";

import React from "react";
import { Cpu, HardDrive, BellRing } from "lucide-react";
import { SystemSettingsState } from "./types";
import Noise from "@/components/ui/Noise";

interface SettingsSummaryRowProps {
  state: SystemSettingsState;
}

export function SettingsSummaryRow({ state }: SettingsSummaryRowProps) {
  const activeCheckpoint = state.checkpoints.find((c) => c.isActive) || state.checkpoints[0];
  const activeWebhooksCount = state.webhooks.filter((w) => w.status === "connected").length;
  const vramPercent = Math.round((state.hardware.vramUsedGb / state.hardware.vramTotalGb) * 100);

  const cards = [
    {
      id: "ingestion",
      title: "Orbital Data Connectors",
      subtitle: "ISRO SAC MOSDAC & NOAA S3",
      value: "2 Ingestion Feeds",
      unit: `${state.mosdac.latencyMs}ms RTT`,
      icon: null,
      accentColor: "#00F2FE", // Electric Cyan
      glowRgba: "rgba(0, 242, 254, 0.35)",
      solidBgGradient: "linear-gradient(145deg, #0C2B3C 0%, #081E2C 45%, #050D18 100%)",
      benchmarkText: "Health: 🟢 Online (100% Ingestion)",
      progressPercent: 100,
    },
    {
      id: "engine",
      title: "Active Neural Checkpoint",
      subtitle: activeCheckpoint.backboneArchitecture.split("+")[0].trim(),
      value: activeCheckpoint.name.split("-")[0] + "-" + activeCheckpoint.name.split("-")[1],
      unit: activeCheckpoint.parametersCount,
      icon: Cpu,
      accentColor: "#00E676", // Emerald Green
      glowRgba: "rgba(0, 230, 118, 0.35)",
      solidBgGradient: "linear-gradient(145deg, #092B1B 0%, #071F14 45%, #050D18 100%)",
      benchmarkText: `Precision: ${state.hardware.precisionMode} Mixed`,
      progressPercent: 92,
    },
    {
      id: "compute",
      title: "Hardware GPU Telemetry",
      subtitle: `${state.hardware.gpuTempCelsius}°C • ${state.hardware.fanRpm} RPM`,
      value: `${state.hardware.vramUsedGb.toFixed(1)} / ${state.hardware.vramTotalGb.toFixed(1)} GB`,
      unit: `(${vramPercent}%)`,
      icon: HardDrive,
      accentColor: "#818CF8", // Indigo
      glowRgba: "rgba(129, 140, 248, 0.35)",
      solidBgGradient: "linear-gradient(145deg, #181C3D 0%, #11142C 45%, #050D18 100%)",
      benchmarkText: `Latency: ${state.hardware.inferenceLatencyMs} ms / frame`,
      progressPercent: vramPercent,
    },
    {
      id: "webhooks",
      title: "Disaster Emergency Relays",
      subtitle: "Odisha, WB, AP & TN Disasters",
      value: `${activeWebhooksCount} SDMAs`,
      unit: "Connected",
      icon: BellRing,
      accentColor: "#FFB300", // Amber
      glowRgba: "rgba(255, 179, 0, 0.35)",
      solidBgGradient: "linear-gradient(145deg, #2D2008 0%, #1F1605 45%, #050D18 100%)",
      benchmarkText: "Standard: CAP-XML v1.2 & JSON v1.0",
      progressPercent: (activeWebhooksCount / 4) * 100,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="relative overflow-hidden rounded-xl p-3.5 transition-all duration-200 bg-[#050D18]"
            style={{
              backgroundColor: "#050D18",
              backgroundImage: card.solidBgGradient,
              border: `1.5px solid ${card.accentColor}75`,
              boxShadow: `0 4px 20px rgba(0, 0, 0, 0.7), 0 0 16px ${card.accentColor}22, inset 0 1px 0 ${card.accentColor}35`,
            }}
          >
            {/* Background Noise Layer */}
            <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
              <Noise
                patternSize={250}
                patternScaleX={1.4}
                patternScaleY={1.4}
                patternRefreshInterval={2}
                patternAlpha={9}
              />
            </div>

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                {/* Title & Icon */}
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <span
                    className="text-[11px] font-bold font-rajdhani tracking-wider uppercase truncate [text-shadow:0_1px_2px_#000000,0_2px_4px_rgba(0,0,0,0.95)]"
                    style={{ color: card.accentColor }}
                  >
                    {card.title}
                  </span>
                  {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: card.accentColor }} />}
                </div>

                {/* Main Telemetry Value & Unit */}
                <div className="flex items-baseline gap-1.5 my-0.5">
                  <span
                    className="text-lg sm:text-xl font-bold font-jetbrains [font-feature-settings:'tnum'_on] tracking-tight [text-shadow:0_1px_2px_#000000,0_2px_4px_rgba(0,0,0,0.95)]"
                    style={{ color: card.accentColor }}
                  >
                    {card.value}
                  </span>
                  <span className="text-[10px] font-jetbrains text-white [text-shadow:0_1px_2px_#000000,0_2px_4px_rgba(0,0,0,0.95)] truncate">
                    {card.unit}
                  </span>
                </div>

                {/* Subtitle (White with dark drop shadow) */}
                <div className="text-[10px] font-jetbrains text-white [text-shadow:0_1px_2px_#000000,0_2px_4px_rgba(0,0,0,0.95)] mt-0.5 truncate">
                  {card.subtitle}
                </div>
              </div>

              <div className="mt-2.5">
                {/* Mini Progress Bar */}
                <div className="w-full bg-[#050B14]/80 rounded-full h-1 overflow-hidden mb-1.5 border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${card.progressPercent}%`,
                      backgroundColor: card.accentColor,
                      boxShadow: `0 0 6px ${card.glowRgba}`,
                    }}
                  />
                </div>

                {/* Benchmark Text (White with dark drop shadow) */}
                <div className="text-[10px] font-jetbrains text-white [text-shadow:0_1px_2px_#000000,0_2px_4px_rgba(0,0,0,0.95)]">
                  <span className="truncate">{card.benchmarkText}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
