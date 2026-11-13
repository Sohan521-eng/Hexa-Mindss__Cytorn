"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Wind, Gauge, Droplets, Thermometer, CloudRain, Compass } from "lucide-react";
import Noise from "@/components/ui/Noise";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

const DEFAULT_PARAMETERS = [
  {
    id: "wind",
    label: "Max Wind Speed",
    value: "185 km/h",
    change: "+15 km/h in 3h",
    icon: Wind,
    color: "text-[var(--color-ai-cyan)]",
  },
  {
    id: "pressure",
    label: "Central Pressure",
    value: "942 hPa",
    change: "-8 hPa rapid drop",
    icon: Gauge,
    color: "text-[var(--color-solar-coral)]",
  },
  {
    id: "sst",
    label: "Sea Surface Temp",
    value: "30.4 °C",
    change: "Above threshold (28°C)",
    icon: Thermometer,
    color: "text-[var(--alert-stage-2-alert)]",
  },
  {
    id: "shear",
    label: "Vertical Wind Shear",
    value: "8.5 kts",
    change: "Favorable (<10 kts)",
    icon: Compass,
    color: "text-[var(--alert-stage-1-watch)]",
  },
  {
    id: "humidity",
    label: "Relative Humidity",
    value: "86%",
    change: "Mid-troposphere saturated",
    icon: Droplets,
    color: "text-[var(--ir-cloud-low)]",
  },
  {
    id: "rainfall",
    label: "Estimated Rainfall",
    value: "220 mm/24h",
    change: "Extreme core band",
    icon: CloudRain,
    color: "text-[var(--ir-cloud-deep)]",
  },
];

export function RealTimeParameters() {
  const [parameters, setParameters] = useState(DEFAULT_PARAMETERS);

  useEffect(() => {
    let isMounted = true;
    const fetchParams = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/telemetry`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data?.parameters && Array.isArray(data.parameters)) {
            setParameters((prev) =>
              prev.map((item) => {
                const liveItem = data.parameters.find(
                  (p: { id?: string; label?: string }) => p.id === item.id || p.label === item.label
                );
                return liveItem
                  ? {
                      ...item,
                      value: liveItem.value || item.value,
                      change: liveItem.change || item.change,
                    }
                  : item;
              })
            );
          }
        }
      } catch {
        // High fidelity baseline retained
      }
    };
    fetchParams();
    const interval = setInterval(fetchParams, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {parameters.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.label}
            variant="glass"
            className="relative overflow-hidden p-3 bg-[#0F1B2F]/90 border border-[rgba(0,242,254,0.4)] shadow-[0_0_15px_rgba(0,242,254,0.1)] cursor-default"
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
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold font-rajdhani tracking-wider uppercase text-[var(--text-muted)]">
                  {item.label}
                </span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="text-base font-bold font-jetbrains [font-feature-settings:'tnum'_on] text-white tracking-tight">
                {item.value}
              </div>
              <div className="text-[10px] font-jetbrains text-[var(--text-muted)] mt-1 truncate">
                {item.change}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
