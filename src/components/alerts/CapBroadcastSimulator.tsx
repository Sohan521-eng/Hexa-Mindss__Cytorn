"use client";

import React, { useState } from "react";
import { 
  Radio, 
  Smartphone, 
  Code, 
  ShieldCheck, 
  BellRing, 
  Send, 
  Copy, 
  Check, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Lock, 
  CheckCircle2,
  ExternalLink,
  Flame
} from "lucide-react";
import { CapXmlPayload } from "./types";
import { CAP_XML_SAMPLE } from "./alertsData";

interface CapBroadcastSimulatorProps {
  onOpen2FaModal: () => void;
  activeStormName?: string;
}

export function CapBroadcastSimulator({
  onOpen2FaModal,
  activeStormName = "Cyclone MOCHA",
}: CapBroadcastSimulatorProps) {
  const [activeTab, setActiveTab] = useState<"sms" | "xml">("sms");
  const [xmlCopied, setXmlCopied] = useState(false);
  const [isSimulatingSiren, setIsSimulatingSiren] = useState(false);
  const [simulationAlertVisible, setSimulationAlertVisible] = useState(false);

  // Formatted XML string from ITU-T X.1303 schema
  const capXmlString = `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>${CAP_XML_SAMPLE.identifier}</identifier>
  <sender>${CAP_XML_SAMPLE.sender}</sender>
  <sent>${CAP_XML_SAMPLE.sentIso}</sent>
  <status>${CAP_XML_SAMPLE.status}</status>
  <msgType>${CAP_XML_SAMPLE.msgType}</msgType>
  <scope>${CAP_XML_SAMPLE.scope}</scope>
  <info>
    <category>${CAP_XML_SAMPLE.category}</category>
    <event>${CAP_XML_SAMPLE.event}</event>
    <urgency>${CAP_XML_SAMPLE.urgency}</urgency>
    <severity>${CAP_XML_SAMPLE.severity}</severity>
    <certainty>${CAP_XML_SAMPLE.certainty}</certainty>
    <headline>${CAP_XML_SAMPLE.headline}</headline>
    <description>${CAP_XML_SAMPLE.description}</description>
    <instruction>${CAP_XML_SAMPLE.instruction}</instruction>
    <area>
      <areaDesc>${CAP_XML_SAMPLE.areaDesc}</areaDesc>
      <circle>${CAP_XML_SAMPLE.circleCoordinates}</circle>
    </area>
    <contact>${CAP_XML_SAMPLE.contact}</contact>
    <web>${CAP_XML_SAMPLE.web}</web>
  </info>
</alert>`;

  const handleCopyXml = () => {
    navigator.clipboard.writeText(capXmlString).then(() => {
      setXmlCopied(true);
      setTimeout(() => setXmlCopied(false), 2500);
    }).catch(() => {});
  };

  // Synthetic Emergency Alert Warble Chime using Web Audio API
  const handleSimulateAlertAudio = () => {
    setSimulationAlertVisible(true);
    setIsSimulatingSiren(true);

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      // Alternate frequencies 853Hz & 960Hz (Standard Emergency Alert System EAS frequencies)
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(853, now);
      osc.frequency.setValueAtTime(960, now + 0.25);
      osc.frequency.setValueAtTime(853, now + 0.5);
      osc.frequency.setValueAtTime(960, now + 0.75);
      osc.frequency.setValueAtTime(853, now + 1.0);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.3);

      setTimeout(() => {
        setIsSimulatingSiren(false);
      }, 1500);
    } catch {
      setIsSimulatingSiren(false);
    }
  };

  return (
    <div 
      id="cap-broadcast-simulator"
      className="flex flex-col h-full rounded-xl border border-[rgba(0,242,254,0.2)] bg-[#0F1B2F]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Header Bar */}
      <div className="p-3 sm:p-4 bg-[#0A1220]/95 border-b border-[rgba(0,242,254,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <h3 className="text-sm sm:text-base font-bold text-white font-orbitron tracking-wide">
              Emergency Broadcast Simulator (CAP)
            </h3>
            <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/40 font-semibold">
              ROLE GUARDED
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            ITU-T X.1303 CAP-XML Payload • Geo-Fenced National Cell Broadcast Mesh
          </p>
        </div>

        {/* Auth Role Guard Status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#050B14] border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Officer #4812 (SDMA Verified)</span>
        </div>
      </div>

      {/* Switcher Tabs: SMS / Mobile Preview vs CAP-XML */}
      <div className="px-3 py-2 bg-[#08101E] border-b border-[rgba(0,242,254,0.1)] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab("sms")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === "sms"
                ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Cell Broadcast SMS Preview</span>
          </button>

          <button
            onClick={() => setActiveTab("xml")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-semibold transition-all cursor-pointer ${
              activeTab === "xml"
                ? "bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>ITU-T X.1303 XML Payload</span>
          </button>
        </div>

        {activeTab === "xml" && (
          <button
            onClick={handleCopyXml}
            className="flex items-center gap-1 text-[11px] font-mono text-slate-300 hover:text-white px-2 py-0.5 rounded bg-[#050B14] border border-[#1E3252] cursor-pointer"
          >
            {xmlCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{xmlCopied ? "Copied" : "Copy XML"}</span>
          </button>
        )}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto max-h-[380px] lg:max-h-[460px] bg-[#070D18]">
        {activeTab === "sms" ? (
          /* Mobile Phone Broadcast Mockup */
          <div className="flex flex-col items-center justify-center py-2 space-y-4">
            
            {/* Citizen Mobile Device Frame */}
            <div className="w-full max-w-[340px] rounded-2xl bg-[#0F172A] border-2 border-slate-700/80 p-3.5 shadow-[0_15px_45px_rgba(0,0,0,0.8)] relative">
              {/* Speaker Notch */}
              <div className="w-16 h-1 rounded-full bg-slate-700 mx-auto mb-3" />

              {/* Status Header */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-800 pb-2 mb-3">
                <span>BSNL / Airtel / Jio (Emergency Mesh)</span>
                <span>LTE • 100%</span>
              </div>

              {/* Emergency Alert Message Card */}
              <div className="rounded-xl bg-red-950/80 border-2 border-red-500/80 p-3.5 space-y-2.5 text-left shadow-[0_0_20px_rgba(213,0,0,0.3)]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center shrink-0 animate-pulse">
                    <BellRing className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-extrabold uppercase text-red-400 tracking-wider">
                      GOVT OF INDIA • EMERGENCY ALERT: SEVERE
                    </div>
                    <div className="text-xs font-bold text-white font-rajdhani">
                      NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#050B14]/80 border border-red-900/60 font-mono text-[11px] text-slate-100 leading-relaxed">
                  <strong className="text-red-400 block mb-1">
                    [URGENT EVACUATION MANDATE: {activeStormName.toUpperCase()}]
                  </strong>
                  Super Cyclone approaching Puri & Paradip Coast. Severe gale winds 210 km/h and +3.4m sea surge expected within 24 hours.
                  <span className="block mt-1 text-yellow-300 font-semibold">
                    Evacuate to nearest Multipurpose Cyclone Shelter immediately.
                  </span>
                  <span className="block mt-1 text-slate-400 text-[10px]">
                    Emergency helpline: Dial 1078 or 112. Do not venture outdoors.
                  </span>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 pt-1">
                  <span>Target: Puri, Jagatsinghpur, Kendrapara</span>
                  <span>Alert ID: CWD-2026-04</span>
                </div>
              </div>

              {/* Mobile Phone Dismiss Note */}
              <div className="mt-3 text-center text-[10px] font-mono text-slate-500">
                Pushed to 1,480,000 devices via Cell Broadcast Service (CBS)
              </div>
            </div>

            {/* Test Simulation Feedback Toast */}
            {simulationAlertVisible && (
              <div className="w-full max-w-[340px] p-2.5 rounded-lg bg-red-900/40 border border-red-500/50 flex items-center justify-between gap-2 text-xs font-mono text-red-200 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-red-400 animate-bounce" />
                  <span>853/960 Hz Alert Chime Triggered</span>
                </div>
                <button
                  onClick={() => setSimulationAlertVisible(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

          </div>
        ) : (
          /* ITU-T X.1303 CAP-XML Payload Preview */
          <div className="relative">
            <pre className="p-3.5 rounded-lg bg-[#050B14] border border-[#1E3252] text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed scrollbar-none">
              <code>{capXmlString}</code>
            </pre>
            <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                <span>OASIS CAP v1.2 / ITU-T X.1303 Validated</span>
              </span>
              <span>Payload Size: 1.4 KB</span>
            </div>
          </div>
        )}
      </div>

      {/* Dual Dispatch Action Controls */}
      <div className="p-3 bg-[#0A1220] border-t border-[rgba(0,242,254,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
        
        {/* Simulate CAP Alert Button */}
        <button
          onClick={handleSimulateAlertAudio}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-[#050B14] hover:bg-amber-950/40 border border-[#FF9100]/60 hover:border-[#FF9100] text-[#FF9100] text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(255,145,0,0.2)] cursor-pointer"
          title="Play synthetic 853/960 Hz alert chime and display cell notification simulation"
        >
          <Volume2 className={`w-4 h-4 ${isSimulatingSiren ? "animate-spin" : ""}`} />
          <span>Simulate CAP Alert</span>
        </button>

        {/* Flashing Red Send Cell Broadcast Button (2FA Gate) */}
        <button
          onClick={onOpen2FaModal}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D50000] via-[#EF4444] to-[#D50000] hover:from-red-600 hover:to-red-700 text-white text-xs font-mono font-extrabold tracking-wider transition-all shadow-[0_0_20px_rgba(213,0,0,0.5)] border border-red-400 cursor-pointer animate-pulse"
          title="Open secure 2FA confirmation gate to dispatch real-time emergency cell broadcast"
        >
          <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
          <span>SEND CELL BROADCAST (2FA)</span>
          <Lock className="w-3.5 h-3.5 text-white/80" />
        </button>

      </div>
    </div>
  );
}
