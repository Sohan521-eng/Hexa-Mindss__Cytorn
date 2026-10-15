"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import Noise from "@/components/ui/Noise";
import { 
  Target, 
  Compass, 
  Navigation, 
  Wind, 
  Database 
} from "lucide-react";
import { ModelCheckpointInfo } from "./types";

interface ScorecardsRowProps {
  model: ModelCheckpointInfo;
}

export function ScorecardsRow({ model }: ScorecardsRowProps) {
  const cards = [
    {
      id: "accuracy",
      title: "Overall Pattern Accuracy",
      subtitle: "5 Dvorak Morphological Classes",
      value: `${model.overallAccuracy.toFixed(1)}%`,
      unit: "Top-1 Precision/Recall",
      icon: Target,
      accentColor: "#00F2FE", // Electric Cyan
      glowRgba: "rgba(0, 242, 254, 0.35)",
      benchmarkText: "Target: > 92.0%",
      delta: "+7.8% vs ResNet-50",
      progressPercent: model.overallAccuracy,
      isPositive: true,
    },
    {
      id: "track-24h",
      title: "24h Mean Track Forecast Error",
      subtitle: "Haversine Geodesic Distance Error",
      value: `${model.trackError24h.toFixed(1)}`,
      unit: "km (MDE)",
      icon: Compass,
      accentColor: "#00E676", // Emerald Green
      glowRgba: "rgba(0, 230, 118, 0.35)",
      benchmarkText: "IMD Target: < 65.0 km",
      delta: "25.8% Better than Target",
      progressPercent: Math.min(100, Math.max(10, (1 - model.trackError24h / 100) * 100)),
      isPositive: true,
    },
    {
      id: "track-48h",
      title: "48h Mean Track Forecast Error",
      subtitle: "Extended Trajectory Integration",
      value: `${model.trackError48h.toFixed(1)}`,
      unit: "km (MDE)",
      icon: Navigation,
      accentColor: "#818CF8", // Indigo Accent
      glowRgba: "rgba(129, 140, 248, 0.35)",
      benchmarkText: "IMD Target: < 120.0 km",
      delta: "21.2% Below IMD Threshold",
      progressPercent: Math.min(100, Math.max(10, (1 - model.trackError48h / 180) * 100)),
      isPositive: true,
    },
    {
      id: "intensity-mae",
      title: "Intensity Mean Absolute Error",
      subtitle: "V_max Wind Speed Convergence",
      value: `${model.intensityMae.toFixed(1)}`,
      unit: `kts (${model.intensityMaeKmh.toFixed(1)} km/h)`,
      icon: Wind,
      accentColor: "#FFB300", // Amber
      glowRgba: "rgba(255, 179, 0, 0.35)",
      benchmarkText: "Intl Target: < 8.5 kts",
      delta: "-1.1 kts vs Benchmark",
      progressPercent: Math.min(100, Math.max(10, (1 - model.intensityMae / 15) * 100)),
      isPositive: true,
    },
    {
      id: "corpus-size",
      title: "Total Training Corpus",
      subtitle: "1982 - 2024 Multi-Spectral Frames",
      value: model.trainingCorpus.toLocaleString(),
      unit: "Curated Satellite Frames",
      icon: Database,
      accentColor: "#10E7A2", // Mint
      glowRgba: "rgba(16, 231, 162, 0.35)",
      benchmarkText: "INSAT-3D / Oceansat / GOES",
      delta: "100% Best-Track Aligned",
      progressPercent: 100,
      isPositive: true,
    },
  ];

  return (
    <section 
      aria-label="Global Performance Scorecards"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full"
    >
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={card.id}
            variant="glass"
            className="relative overflow-hidden p-3 cursor-default"
            style={{
              background: `linear-gradient(145deg, ${card.accentColor}28 0%, ${card.accentColor}12 45%, rgba(15, 27, 47, 0.95) 100%)`,
              border: `1.5px solid ${card.accentColor}75`,
              boxShadow: `0 4px 20px rgba(0, 0, 0, 0.5), 0 0 16px ${card.accentColor}22, inset 0 1px 0 ${card.accentColor}35`,
            }}
          >
            {/* React Bits Noise Background Overlay */}
            <Noise
              patternSize={250}
              patternScaleX={2.5}
              patternScaleY={2.5}
              patternRefreshInterval={2}
              patternAlpha={10}
            />

            {/* Foreground Content */}
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                {/* Header: Title & Direct Colored Icon */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span 
                    className="text-[11px] font-bold font-rajdhani tracking-wider uppercase truncate [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]"
                    style={{ color: card.accentColor }}
                  >
                    {card.title}
                  </span>
                  <IconComponent className="w-4 h-4 shrink-0" style={{ color: card.accentColor }} />
                </div>

                {/* Main Telemetry Value & Unit */}
                <div className="flex items-baseline gap-1.5 my-0.5">
                  <span 
                    className="text-xl sm:text-2xl font-bold font-jetbrains [font-feature-settings:'tnum'_on] tracking-tight"
                    style={{ color: card.accentColor }}
                  >
                    {card.value}
                  </span>
                  <span className="text-[10px] font-jetbrains text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] truncate">
                    {card.unit}
                  </span>
                </div>

                {/* Subtitle / Context */}
                <div className="text-[10px] font-jetbrains text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)] mt-0.5 truncate">
                  {card.subtitle}
                </div>
              </div>

              <div className="mt-2">
                {/* Progress Mini Bar */}
                <div className="w-full bg-[#050B14]/80 rounded-full h-1 overflow-hidden mb-1.5 border border-slate-800/80">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${card.progressPercent}%`, 
                      backgroundColor: card.accentColor,
                      boxShadow: `0 0 6px ${card.glowRgba}` 
                    }}
                  />
                </div>

                {/* Footer Benchmark Comparison */}
                <div className="text-[10px] font-jetbrains text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                  <span className="truncate">{card.benchmarkText}</span>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
}
