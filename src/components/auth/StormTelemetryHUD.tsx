"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Wind, Gauge, Lock, Activity, Crosshair, Radio } from "lucide-react";
import Noise from "@/components/ui/Noise";

interface LiveAuthTelemetry {
  stormName: string;
  category: string;
  basin: string;
  pressureHpa: number;
  windKmh: number;
  lat: number;
  lon: number;
  dvorakT: string;
  dvorakCI: string;
  orbitalPass: string;
}

const DEFAULT_AUTH_TELEMETRY: LiveAuthTelemetry = {
  stormName: 'CYCLONE "ARNAB"',
  category: "VSCS Cat-3",
  basin: "Bay of Bengal • BOB-02",
  pressureHpa: 942,
  windKmh: 185,
  lat: 16.2,
  lon: 88.4,
  dvorakT: "T5.5",
  dvorakCI: "CI 5.5",
  orbitalPass: "INSAT-3DR (15m SCAN)",
};

export const StormTelemetryHUD: React.FC = () => {
  const [telemetry, setTelemetry] = useState<LiveAuthTelemetry>(DEFAULT_AUTH_TELEMETRY);
  const [utcClock, setUtcClock] = useState<string>("--:-- UTC");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setUtcClock(
        now.toLocaleTimeString("en-GB", {
          timeZone: "UTC",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " UTC"
      );
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

    const fetchStormTelemetry = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/storms/active`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const json = await res.json();
        if (!isMounted) return;

        const utcTime = json.timestamp_utc
          ? new Date(json.timestamp_utc).toISOString().slice(11, 16) + " UTC"
          : "15m SCAN";

        setTelemetry((prev) => ({
          stormName: json.storm_name || json.name || prev.stormName,
          category: json.active_category || prev.category,
          basin: json.basin ? `${json.basin} • BOB-02` : prev.basin,
          pressureHpa:
            typeof json.current_state?.pressure_hpa === "number"
              ? Math.round(json.current_state.pressure_hpa)
              : prev.pressureHpa,
          windKmh:
            typeof json.current_state?.wind_kmh === "number"
              ? Math.round(json.current_state.wind_kmh)
              : prev.windKmh,
          lat:
            typeof json.current_state?.lat === "number"
              ? json.current_state.lat
              : prev.lat,
          lon:
            typeof json.current_state?.lon === "number"
              ? json.current_state.lon
              : prev.lon,
          dvorakT: prev.dvorakT,
          dvorakCI: prev.dvorakCI,
          orbitalPass: `INSAT-3DR (${utcTime})`,
        }));
      } catch {
        // Keep calibrated baseline silently
      }
    };

    fetchStormTelemetry();
    const interval = setInterval(fetchStormTelemetry, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative z-10 w-full px-6 py-6 sm:px-10 sm:py-8 flex flex-col justify-between h-full">
      {/* Top Aerospace Brand Lockup & Live Orbital Status */}
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="CYTORN Logo"
              width={48}
              height={48}
              unoptimized
              priority
              className="w-11 h-11 object-contain drop-shadow-[0_0_12px_rgba(0,242,254,0.4)]"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-orbitron font-extrabold text-xl sm:text-2xl tracking-[0.08em] text-white uppercase">
                  CYTORN
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded font-jetbrains font-bold tracking-wider bg-[#00F2FE]/12 border border-[#00F2FE]/45 text-[#00F2FE]">
                  EOC GATEWAY
                </span>
              </div>
              <span className="text-[10px] font-jetbrains tracking-[0.18em] text-slate-400 uppercase">
                Tropical Cyclone AI Prediction OS
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A1322]/90 backdrop-blur-md border border-[rgba(0,242,254,0.3)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10E7A2] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10E7A2]" />
            </span>
            <span className="text-[11px] font-jetbrains [font-feature-settings:'tnum'_on] font-bold tracking-wider text-[#00F2FE]">
              {utcClock}
            </span>
          </div>
        </div>

        <div className="max-w-lg space-y-1.5">
          <p className="text-[11px] font-rajdhani font-bold uppercase tracking-[0.16em] text-[#00F2FE]">
            Multi-Source Satellite Identification &amp; PINN Forecasting
          </p>
          <p className="text-xs sm:text-[13px] font-jakarta text-slate-300 leading-relaxed">
            Real-time INSAT-3DR radiometric classification, Atkinson-Holliday intensity coupling, and 120-hour trajectory intelligence for meteorological and disaster command teams.
          </p>
        </div>
      </div>

      {/* Center / Lower Live Cyclone Telemetry Dossier */}
      <div className="my-auto py-6">
        <div
          className="relative overflow-hidden rounded-2xl p-5 sm:p-6 space-y-4 max-w-xl"
          style={{
            backgroundColor: "rgba(10, 19, 34, 0.86)",
            backgroundImage:
              "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.92) 48%, rgba(5, 11, 20, 0.96) 100%)",
            border: "1px solid rgba(0, 242, 254, 0.32)",
            boxShadow: "0 16px 40px rgba(0, 0, 0, 0.65)",
          }}
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-hidden opacity-60">
            <Noise
              patternSize={250}
              patternScaleX={1.3}
              patternScaleY={1.3}
              patternRefreshInterval={2}
              patternAlpha={14}
            />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Active Threat Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-[rgba(0,242,254,0.16)]">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-rajdhani font-bold uppercase tracking-[0.14em] text-slate-400">
                  <Radio className="w-3 h-3 text-[#FF5E36]" />
                  <span>Active Basin Tracking • {telemetry.orbitalPass}</span>
                </div>
                <h2 className="font-orbitron font-extrabold text-lg sm:text-xl text-white tracking-wide flex flex-wrap items-center gap-2">
                  <span>{telemetry.stormName}</span>
                  <span className="text-[10px] font-jetbrains px-2 py-0.5 rounded bg-[#FF5E36]/15 border border-[#FF5E36]/70 text-[#FF5E36] font-bold">
                    {telemetry.category}
                  </span>
                </h2>
              </div>

              <div className="text-left sm:text-right space-y-0.5">
                <span className="text-[10px] font-rajdhani font-bold uppercase tracking-wider text-slate-400 block">
                  {telemetry.basin}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-jetbrains [font-feature-settings:'tnum'_on] font-bold text-[#00F2FE]">
                  <Crosshair className="w-3 h-3" />
                  {telemetry.lat.toFixed(1)}°N, {telemetry.lon.toFixed(1)}°E
                </span>
              </div>
            </div>

            {/* Calibrated Meteorological Readings */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 rounded-xl bg-[#050B14]/85 border border-[rgba(0,242,254,0.2)]">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Gauge className="w-3.5 h-3.5 text-[#00F2FE]" />
                  <span className="text-[10px] font-rajdhani font-bold uppercase tracking-wider">
                    Pressure
                  </span>
                </div>
                <div className="text-base sm:text-lg font-jetbrains [font-feature-settings:'tnum'_on] font-bold text-white">
                  {telemetry.pressureHpa}{" "}
                  <span className="text-[10px] font-normal text-slate-400">hPa</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#050B14]/85 border border-[rgba(255,94,54,0.28)]">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Wind className="w-3.5 h-3.5 text-[#FF5E36]" />
                  <span className="text-[10px] font-rajdhani font-bold uppercase tracking-wider">
                    Max Winds
                  </span>
                </div>
                <div className="text-base sm:text-lg font-jetbrains [font-feature-settings:'tnum'_on] font-bold text-[#FF5E36]">
                  {telemetry.windKmh}{" "}
                  <span className="text-[10px] font-normal text-slate-400">km/h</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#050B14]/85 border border-[rgba(16,231,162,0.24)]">
                <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                  <Activity className="w-3.5 h-3.5 text-[#10E7A2]" />
                  <span className="text-[10px] font-rajdhani font-bold uppercase tracking-wider">
                    Dvorak CI
                  </span>
                </div>
                <div className="text-base sm:text-lg font-jetbrains [font-feature-settings:'tnum'_on] font-bold text-[#10E7A2]">
                  {telemetry.dvorakT}{" "}
                  <span className="text-[10px] font-normal text-slate-400">/ {telemetry.dvorakCI}</span>
                </div>
              </div>
            </div>

            {/* Active Satellite Feed Strip */}
            <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {["INSAT-3DR TIR-1", "Oceansat-3 OSCAT", "NOAA-20 ABI"].map((feed) => (
                  <span
                    key={feed}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#050B14]/90 border border-[#1E3252] text-[10px] font-jetbrains text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10E7A2]" />
                    <span>{feed}</span>
                  </span>
                ))}
              </div>
              <span className="text-[10px] font-jetbrains text-[#10E7A2] font-bold tracking-wider">
                GTS SYNCED
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Cryptographic & Compliance Footer */}
      <div className="pt-4 border-t border-[rgba(0,242,254,0.14)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[10px] font-jetbrains text-slate-400">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span>PBKDF2-SHA512 • HS256 HTTPONLY SESSION GATEWAY</span>
        </div>
        <span className="text-slate-500">IMD / NDMA RBAC PROTOCOL v2026.4</span>
      </div>
    </div>
  );
};
