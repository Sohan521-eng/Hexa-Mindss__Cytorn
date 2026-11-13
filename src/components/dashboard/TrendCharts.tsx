"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Activity, TrendingUp, AlertTriangle } from "lucide-react";
import Noise from "@/components/ui/Noise";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";

interface TrendDataPoint {
  time: string;
  wind: number;
  pressure: number;
  isForecast?: boolean;
}

const DEFAULT_METEOROLOGICAL_DATA: TrendDataPoint[] = [
  { time: "-24h", wind: 45, pressure: 996, isForecast: false },
  { time: "-18h", wind: 55, pressure: 990, isForecast: false },
  { time: "-12h", wind: 72, pressure: 982, isForecast: false },
  { time: "-6h", wind: 90, pressure: 970, isForecast: false },
  { time: "Now", wind: 100, pressure: 942, isForecast: false },
  { time: "+6h", wind: 108, pressure: 936, isForecast: true },
  { time: "+12h", wind: 115, pressure: 930, isForecast: true },
  { time: "+18h", wind: 110, pressure: 938, isForecast: true },
  { time: "+24h", wind: 85, pressure: 960, isForecast: true },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: TrendDataPoint;
  }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  const windVal = payload.find((p) => p.dataKey === "wind")?.value;
  const presVal = payload.find((p) => p.dataKey === "pressure")?.value;

  return (
    <div className="bg-[#050B14]/95 backdrop-blur-md border border-[#00F2FE]/50 rounded-lg p-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-xs font-rajdhani">
      <div className="flex items-center justify-between gap-3 mb-1.5 border-b border-[#1E3252] pb-1">
        <span className="font-bold text-white tracking-wider flex items-center gap-1">
          {label === "Now" ? "OBSERVATION: NOW" : `TIMESTEP: ${label}`}
        </span>
        <span
          className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
            dataPoint?.isForecast
              ? "bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30"
              : "bg-[#10E7A2]/15 text-[#10E7A2] border border-[#10E7A2]/30"
          }`}
        >
          {dataPoint?.isForecast ? "AI Forecast" : "Satellite Obs"}
        </span>
      </div>
      <div className="space-y-1 font-jetbrains text-[11px]">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#8E9EB5] flex items-center gap-1.5 font-rajdhani">
            <span className="w-2 h-2 rounded-full bg-[#00F2FE]" /> Sustained Wind:
          </span>
          <span className="font-bold text-[#00F2FE]">{windVal} kts</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[#8E9EB5] flex items-center gap-1.5 font-rajdhani">
            <span className="w-2 h-2 rounded-full bg-[#FF5E36]" /> Central Pressure:
          </span>
          <span className="font-bold text-[#FF5E36]">{presVal} hPa</span>
        </div>
      </div>
    </div>
  );
}

export function TrendCharts() {
  const [trendData, setTrendData] = useState<TrendDataPoint[]>(DEFAULT_METEOROLOGICAL_DATA);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let isMounted = true;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

    const fetchTrends = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard/telemetry`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && Array.isArray(json.trends) && json.trends.length > 0) {
            setTrendData(json.trends);
          }
        }
      } catch (err) {
        console.warn("[TrendCharts] Real-time trend fetch error, fallback active:", err);
      }
    };

    fetchTrends();
    const interval = setInterval(fetchTrends, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const peakWind = trendData.length > 0 ? Math.max(...trendData.map((d) => d.wind)) : 115;
  const minPressure = trendData.length > 0 ? Math.min(...trendData.map((d) => d.pressure)) : 930;

  return (
    <Card 
      variant="glass" 
      className="relative overflow-hidden p-4 flex flex-col h-full min-h-[280px] bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_0_15px_rgba(0,242,254,0.1)]"
    >
      {/* React Bits Noise Background Overlay */}
      <Noise
        patternSize={250}
        patternScaleX={1.2}
        patternScaleY={1.2}
        patternRefreshInterval={2}
        patternAlpha={9}
      />

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00F2FE]" />
            <h3
              className="text-sm font-semibold font-rajdhani uppercase tracking-wider text-[#00F2FE]"
              style={{ textShadow: "1px 2px 6px rgba(0,0,0,0.95)" }}
            >
              Meteorological Trends & Rapid Intensification
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs font-rajdhani font-semibold">
            <span className="flex items-center gap-1 text-[#00F2FE]">
              <span className="w-2 h-2 rounded-full bg-[#00F2FE] shadow-[0_0_6px_rgba(0,242,254,0.8)]" /> Wind (kts)
            </span>
            <span className="flex items-center gap-1 text-[#FF5E36]">
              <span className="w-2 h-2 rounded-full bg-[#FF5E36] shadow-[0_0_6px_rgba(255,94,54,0.8)]" /> Pressure (hPa)
            </span>
          </div>
        </div>

        {/* Chart Canvas Area */}
        <div className="flex-1 w-full min-h-[175px] max-h-[200px] mt-1 relative">
          {!mounted ? (
            <div className="w-full h-full flex items-center justify-center text-xs font-rajdhani text-[#8E9EB5]">
              Loading temporal trajectory curve...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  {/* Cyan Wind Speed Gradient */}
                  <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00F2FE" stopOpacity={0.0} />
                  </linearGradient>

                  {/* Coral Pressure Gradient */}
                  <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5E36" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#FF5E36" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#1E3252"
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.6}
                />

                <XAxis
                  dataKey="time"
                  stroke="#8E9EB5"
                  tick={{ fill: "#8E9EB5", fontSize: 10, fontFamily: "var(--font-rajdhani), sans-serif" }}
                  tickLine={{ stroke: "#1E3252" }}
                  axisLine={{ stroke: "#1E3252" }}
                />

                {/* Left Axis: Wind (kts) */}
                <YAxis
                  yAxisId="wind"
                  domain={[30, 160]}
                  stroke="#00F2FE"
                  tick={{ fill: "#00F2FE", fontSize: 9, fontFamily: "var(--font-jetbrains), monospace" }}
                  tickLine={false}
                  axisLine={false}
                  tickCount={5}
                />

                {/* Right Axis: Central Pressure (hPa) */}
                <YAxis
                  yAxisId="pressure"
                  orientation="right"
                  domain={[920, 1010]}
                  stroke="#FF5E36"
                  tick={{ fill: "#FF5E36", fontSize: 9, fontFamily: "var(--font-jetbrains), monospace" }}
                  tickLine={false}
                  axisLine={false}
                  tickCount={5}
                />

                <Tooltip content={<CustomChartTooltip />} />

                {/* Observation / Forecast Threshold Reference Line */}
                <ReferenceLine
                  x="Now"
                  stroke="#00F2FE"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  label={{
                    value: "NOW",
                    position: "top",
                    fill: "#00F2FE",
                    fontSize: 9,
                    fontFamily: "var(--font-rajdhani)",
                    fontWeight: "bold",
                  }}
                />

                {/* Wind Curve (Primary Forecast Vector) */}
                <Area
                  yAxisId="wind"
                  type="monotone"
                  dataKey="wind"
                  stroke="#00F2FE"
                  strokeWidth={2.2}
                  fill="url(#windGradient)"
                  dot={{ r: 2.5, fill: "#00F2FE", stroke: "#050B14", strokeWidth: 1.5 }}
                  activeDot={{ r: 4.5, fill: "#00F2FE", stroke: "#ffffff", strokeWidth: 2 }}
                />

                {/* Pressure Curve (Inverse Deepening Trend) */}
                <Area
                  yAxisId="pressure"
                  type="monotone"
                  dataKey="pressure"
                  stroke="#FF5E36"
                  strokeWidth={1.8}
                  fill="url(#pressureGradient)"
                  dot={{ r: 2, fill: "#FF5E36", stroke: "#050B14", strokeWidth: 1 }}
                  activeDot={{ r: 4, fill: "#FF5E36", stroke: "#ffffff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Micro-Telemetry Footer Bar */}
        <div className="mt-2.5 pt-2 border-t border-[#1E3252] flex items-center justify-between text-[11px] font-rajdhani text-[#8E9EB5]">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Peak Projected: <strong className="text-white font-jetbrains [font-feature-settings:'tnum'_on]">{peakWind} kts</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5E36]" />
            <span>Min Pressure: <strong className="text-white font-jetbrains [font-feature-settings:'tnum'_on]">{minPressure} hPa</strong></span>
          </div>
          <div className="flex items-center gap-1 text-[#FF5E36] font-semibold">
            <AlertTriangle className="w-3 h-3" />
            <span>RI (+45 kts/24h)</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
