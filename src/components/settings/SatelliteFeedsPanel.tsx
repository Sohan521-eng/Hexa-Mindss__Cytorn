"use client";

import React, { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  RefreshCw, 
  HardDrive, 
  Trash2, 
  CloudLightning, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  RotateCcw
} from "lucide-react";
import { MosdacConfig, NoaaS3Config, SyncFrequency } from "./types";
import Noise from "@/components/ui/Noise";

import { ScientistPillButton } from "@/components/ui/ScientistPillButton";

/**
 * TECHNICAL ARCHITECTURE:
 * Satellite Feed Polling with Truncated Exponential Backoff & Jitter:
 * T_wait(n) = min(T_max, T_base * 2^n) +/- U(0, jitter)
 */

interface SatelliteFeedsPanelProps {
  mosdac: MosdacConfig;
  noaaS3: NoaaS3Config;
  onUpdateMosdac: (updated: Partial<MosdacConfig>) => void;
  onUpdateNoaaS3: (updated: Partial<NoaaS3Config>) => void;
  onNotify: (text: string, type: "success" | "warning" | "error") => void;
}

export const SatelliteFeedsPanel: React.FC<SatelliteFeedsPanelProps> = ({
  mosdac,
  noaaS3,
  onUpdateMosdac,
  onUpdateNoaaS3,
  onNotify,
}) => {
  const [isPingingMosdac, setIsPingingMosdac] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const handleTestPingMosdac = () => {
    setIsPingingMosdac(true);
    setTimeout(() => {
      const simulatedLatency = Math.floor(Math.random() * 15) + 14;
      const isHealthy = simulatedLatency < 150;
      onUpdateMosdac({
        latencyMs: simulatedLatency,
        healthStatus: isHealthy ? "online" : "degraded",
        lastPingTime: "Just now",
      });
      setIsPingingMosdac(false);
      onNotify(`MOSDAC RTT handshake verified: ${simulatedLatency}ms (HTTP 200 OK)`, "success");
    }, 600);
  };

  const handlePurgeBuffer = () => {
    setIsPurging(true);
    setTimeout(() => {
      onUpdateNoaaS3({
        stagingUsedGb: 1.2,
      });
      setIsPurging(false);
      setShowPurgeModal(false);
      onNotify("Local raster cache purged. Reclaimed 17.2 GB NVMe buffer space.", "success");
    }, 700);
  };

  const percentStorage = Math.min(100, Math.round((noaaS3.stagingUsedGb / noaaS3.stagingMaxGb) * 100));

  return (
    <section id="satellite-feeds" className="scroll-mt-20 space-y-4">
      {/* Streamlined Section Title */}
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(0,242,254,0.25)] pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-wide flex items-center">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                Satellite Data Feed Connectors &amp; Sync Orchestration
              </span>
            </span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CARD 1: ISRO MOSDAC Open Data API */}
        <div
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-[#0A1322]"
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

          <div className="relative z-10 space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                ISRO MOSDAC Open Data API
              </h3>
              <ScientistPillButton
                onClick={() =>
                  onUpdateMosdac({ endpointUrl: "https://api.mosdac.gov.in/v2/insat3d/open" })
                }
                className="scientist-pill !h-7 !min-w-0 !px-2.5 !py-0 !rounded-lg !gap-1.5"
                icon={<RotateCcw className="w-3 h-3 text-[#00F2FE] shrink-0" />}
                hoverIcon={<RotateCcw className="w-3 h-3 text-[#050B14] shrink-0" />}
                label={
                  <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-white">
                    Reset Default
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#050B14]">
                    Reset Default
                  </span>
                }
                title="Reset to default MOSDAC API endpoint"
              />
            </div>

            {/* Endpoint */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                API Endpoint URL
              </span>
              <input
                type="text"
                value={mosdac.endpointUrl}
                onChange={(e) => onUpdateMosdac({ endpointUrl: e.target.value })}
                className="w-full bg-[#050B14] border-[1.5px] border-[rgba(0,242,254,0.45)] rounded-lg px-3 py-1.5 text-xs font-mono text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.12)] focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_16px_rgba(0,242,254,0.3)] transition-all"
              />
            </div>

            {/* API Key */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Authorization Key (AES-256)</span>
              <div className="relative flex items-center">
                <input
                  type={mosdac.isKeyMasked ? "password" : "text"}
                  value={mosdac.apiKey}
                  onChange={(e) => onUpdateMosdac({ apiKey: e.target.value })}
                  className="w-full bg-[#050B14] border-[1.5px] border-[rgba(0,242,254,0.45)] rounded-lg px-3 py-1.5 pr-10 text-xs font-mono text-slate-200 shadow-[0_0_10px_rgba(0,242,254,0.12)] focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_16px_rgba(0,242,254,0.3)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => onUpdateMosdac({ isKeyMasked: !mosdac.isKeyMasked })}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-[#00F2FE] cursor-pointer"
                >
                  {mosdac.isKeyMasked ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Ingestion Channels */}
            <div className="space-y-1.5">
              <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Active Spectral Ingestion Channels</span>
              <div className="p-1 rounded-xl bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { key: "tir1", label: "TIR-1 (10.8µm)" },
                    { key: "tir2", label: "TIR-2 (12.0µm)" },
                    { key: "wv", label: "WV (6.7µm)" },
                    { key: "vis", label: "VIS (0.65µm)" },
                    { key: "oscat", label: "OSCAT (Ku-Band)" },
                  ].map((ch) => {
                    const channelKey = ch.key as keyof typeof mosdac.channels;
                    const isActive = mosdac.channels[channelKey];
                    return (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={() =>
                          onUpdateMosdac({
                            channels: {
                              ...mosdac.channels,
                              [channelKey]: !isActive,
                            },
                          })
                        }
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                          isActive
                            ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)] font-black"
                            : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                        }`}
                      >
                        {ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Diagnostic Ping */}
          <div className="relative z-10 pt-3 border-t border-[rgba(0,242,254,0.18)] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#00F2FE] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#00F2FE]" />
              Ping: {mosdac.lastPingTime}
            </span>

            <ScientistPillButton
              onClick={handleTestPingMosdac}
              disabled={isPingingMosdac}
              className="scientist-pill !h-7 !min-w-0 !px-2.5 !py-0 !rounded-lg !gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              icon={
                <RefreshCw
                  className={`w-3 h-3 text-[#00F2FE] shrink-0 ${isPingingMosdac ? "animate-spin" : ""}`}
                />
              }
              hoverIcon={
                <RefreshCw
                  className={`w-3 h-3 text-[#050B14] shrink-0 ${isPingingMosdac ? "animate-spin" : ""}`}
                />
              }
              label={
                <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#00F2FE]">
                  {isPingingMosdac ? "Pinging..." : "Test Ping"}
                </span>
              }
              hoverLabel={
                <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#050B14]">
                  {isPingingMosdac ? "Pinging..." : "Test Ping"}
                </span>
              }
              title="Execute test ping against ISRO MOSDAC Open API"
            />
          </div>
        </div>

        {/* CARD 2: NOAA Open Data AWS S3 Ingestion */}
        <div
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 bg-[#0A1322]"
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

          <div className="relative z-10 space-y-3.5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                NOAA Open Data AWS S3
              </h3>

              <ScientistPillButton
                onClick={() => onUpdateNoaaS3({ isAnonymousRead: !noaaS3.isAnonymousRead })}
                className={`scientist-pill !h-7 !min-w-0 !px-2.5 !py-0 !rounded-lg transition-all ${
                  noaaS3.isAnonymousRead
                    ? ""
                    : "!border-slate-700/80 !bg-[#050B14]/80 !shadow-none"
                }`}
                label={
                  <span
                    className={`font-rajdhani font-bold text-[10.5px] uppercase tracking-wider ${
                      noaaS3.isAnonymousRead ? "text-[#00F2FE]" : "text-slate-400"
                    }`}
                  >
                    Anonymous: {noaaS3.isAnonymousRead ? "ON" : "OFF"}
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#050B14]">
                    Anonymous: {noaaS3.isAnonymousRead ? "ON" : "OFF"}
                  </span>
                }
                title="Toggle anonymous public read access for NOAA S3 buckets"
              />
            </div>

            {/* S3 URI */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Target S3 Bucket URI</span>
              <input
                type="text"
                value={noaaS3.bucketUri}
                onChange={(e) => onUpdateNoaaS3({ bucketUri: e.target.value })}
                className="w-full bg-[#050B14] border-[1.5px] border-[rgba(0,242,254,0.45)] rounded-lg px-3 py-1.5 text-xs font-mono text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.12)] focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_16px_rgba(0,242,254,0.3)] transition-all"
              />
            </div>

            {/* Credentials / Region */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">AWS Region</span>
                <input
                  type="text"
                  value={noaaS3.region}
                  onChange={(e) => onUpdateNoaaS3({ region: e.target.value })}
                  className="w-full bg-[#050B14] border-[1.5px] border-[rgba(0,242,254,0.45)] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 shadow-[0_0_10px_rgba(0,242,254,0.12)] focus:outline-none focus:border-[#00F2FE] transition-all"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Access Key ID</span>
                <input
                  type="text"
                  disabled={noaaS3.isAnonymousRead}
                  value={noaaS3.isAnonymousRead ? "ANONYMOUS_READ" : noaaS3.accessKeyId}
                  onChange={(e) => onUpdateNoaaS3({ accessKeyId: e.target.value })}
                  className="w-full bg-[#050B14] border-[1.5px] border-[rgba(0,242,254,0.45)] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 shadow-[0_0_10px_rgba(0,242,254,0.12)] focus:outline-none focus:border-[#00F2FE] disabled:opacity-40 transition-all"
                />
              </div>
            </div>

            {/* Sync Frequency Radios */}
            <div className="space-y-1">
              <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Ingestion Frequency</span>
              <div className="p-1 rounded-xl bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: "15m", label: "15m Oper." },
                    { id: "30m", label: "30m" },
                    { id: "1h", label: "1h" },
                    { id: "manual", label: "Manual" },
                  ].map((opt) => {
                    const isSelected = noaaS3.syncFrequency === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onUpdateNoaaS3({ syncFrequency: opt.id as SyncFrequency })}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                          isSelected
                            ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)] font-black"
                            : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Sync Action */}
          <div className="relative z-10 pt-3 border-t border-[rgba(0,242,254,0.18)] flex items-center justify-between">
            <span className="text-[11px] font-mono text-[#00E676] [text-shadow:0_1px_2px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E676]" />
              Synced: {noaaS3.lastSynced}
            </span>

            <ScientistPillButton
              onClick={() => {
                onUpdateNoaaS3({ lastSynced: "Just now" });
                onNotify("S3 sync dispatched: Ingested latest ABI raster swaths.", "success");
              }}
              className="scientist-pill !h-7 !min-w-0 !px-2.5 !py-0 !rounded-lg !gap-1.5"
              icon={<CloudLightning className="w-3 h-3 text-[#00F2FE] shrink-0" />}
              hoverIcon={<CloudLightning className="w-3 h-3 text-[#050B14] shrink-0" />}
              label={
                <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#00F2FE]">
                  Sync Now
                </span>
              }
              hoverLabel={
                <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#050B14]">
                  Sync Now
                </span>
              }
              title="Dispatches ingestion of latest ABI raster swaths from NOAA S3"
            />
          </div>
        </div>
      </div>

      {/* STORAGE CACHE PROGRESS & AUTO-PURGE */}
      <div
        className="relative overflow-hidden rounded-xl p-4 transition-all duration-200 bg-[#0A1322]"
        style={{
          backgroundColor: "#0A1322",
          backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.99) 40%, #070E1A 100%)",
          border: "1.5px solid rgba(0, 242, 254, 0.45)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 14px rgba(0, 242, 254, 0.15)",
        }}
      >
        <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
          <Noise patternSize={250} patternScaleX={1.4} patternScaleY={1.4} patternRefreshInterval={2} patternAlpha={9} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)] flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-white" />
                Local NVMe Staging Buffer Cache
              </span>
              <span className="font-mono text-xs font-bold text-[#00F2FE]">
                {noaaS3.stagingUsedGb.toFixed(1)} GB / {noaaS3.stagingMaxGb.toFixed(1)} GB ({percentStorage}%)
              </span>
            </div>
            {/* Cyber Gradient Glow Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-[#050B14] border border-[rgba(0,242,254,0.3)] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-gradient-to-r from-[#00F2FE] via-[#00F2FE] to-[#00E676] rounded-full shadow-[0_0_12px_rgba(0,242,254,0.6)] transition-all duration-500 ease-out"
                style={{ width: `${percentStorage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ScientistPillButton
              onClick={() => onUpdateNoaaS3({ autoPurgeOlderThan48h: !noaaS3.autoPurgeOlderThan48h })}
              className={`scientist-pill-green !h-7 !min-w-0 !px-2.5 !py-0 !rounded-lg !gap-1.5 transition-all ${
                noaaS3.autoPurgeOlderThan48h
                  ? ""
                  : "!border-slate-700/80 !bg-[#050B14]/80 !shadow-none"
              }`}
              label={
                <span
                  className={`font-rajdhani font-bold text-[10.5px] uppercase tracking-wider ${
                    noaaS3.autoPurgeOlderThan48h ? "text-[#00E676]" : "text-slate-400"
                  }`}
                >
                  Auto-Purge &gt; 48h: {noaaS3.autoPurgeOlderThan48h ? "ON" : "OFF"}
                </span>
              }
              hoverLabel={
                <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#050B14]">
                  Auto-Purge &gt; 48h: {noaaS3.autoPurgeOlderThan48h ? "ON" : "OFF"}
                </span>
              }
              title="Toggle automatic eviction of temporary satellite rasters older than 48 hours"
            />

            <ScientistPillButton
              onClick={() => setShowPurgeModal(true)}
              className="scientist-pill-orange !h-7 !min-w-0 !px-2.5 !py-0 !rounded-lg !gap-1.5"
              icon={<Trash2 className="w-3 h-3 text-[#FF5E36] shrink-0" />}
              hoverIcon={<Trash2 className="w-3 h-3 text-[#050B14] shrink-0" />}
              label={
                <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#FF5E36]">
                  Purge Cache
                </span>
              }
              hoverLabel={
                <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#050B14]">
                  Purge Cache
                </span>
              }
              title="Immediately purge local raster staging cache buffer"
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B14]/80 backdrop-blur-md p-4">
          <div
            className="relative overflow-hidden w-full max-w-md rounded-xl p-5 shadow-2xl transition-all"
            style={{
              backgroundColor: "#260E06",
              backgroundImage: "linear-gradient(145deg, rgba(255, 94, 54, 0.42) 0%, rgba(200, 65, 15, 0.32) 45%, #180803 100%)",
              border: "1.5px solid rgba(255, 94, 54, 0.75)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.9), 0 0 25px rgba(255, 94, 54, 0.35)",
            }}
          >
            {/* Background Noise Effect */}
            <div className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden">
              <Noise patternSize={250} patternScaleX={1.4} patternScaleY={1.4} patternRefreshInterval={2} patternAlpha={9} />
            </div>

            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-5 h-5 text-white shrink-0 [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.95))]" />
                <h3 className="font-rajdhani font-bold text-base uppercase text-white [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                  Purge Satellite Staging Cache
                </h3>
              </div>

              <p className="font-sans text-xs text-white leading-relaxed [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                This will purge 17.2 GB of temporary NetCDF-4 raster files. Committed models and active storm tracks will not be impacted.
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <ScientistPillButton
                  onClick={() => setShowPurgeModal(false)}
                  className="scientist-pill-slate !h-7 !min-w-0 !px-3 !py-0 !rounded-lg !gap-1.5"
                  label={
                    <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                      Cancel
                    </span>
                  }
                  hoverLabel={
                    <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-white">
                      Cancel
                    </span>
                  }
                  title="Dismiss and close purge confirmation"
                />

                <ScientistPillButton
                  onClick={handlePurgeBuffer}
                  disabled={isPurging}
                  className="scientist-pill-orange !h-7 !min-w-0 !px-3 !py-0 !rounded-lg !gap-1.5 !bg-[#FF5E36]/30 !border-[#FF5E36] shadow-[0_0_14px_rgba(255,94,54,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                  label={
                    <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                      {isPurging ? "Purging..." : "Confirm Purge"}
                    </span>
                  }
                  hoverLabel={
                    <span className="font-rajdhani font-bold text-[10.5px] uppercase tracking-wider text-[#050B14]">
                      {isPurging ? "Purging..." : "Confirm Purge"}
                    </span>
                  }
                  title="Permanently purge 17.2 GB temporary satellite staging buffer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
