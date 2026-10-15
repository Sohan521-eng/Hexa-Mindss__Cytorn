"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BellRing, 
  Send, 
  RefreshCw, 
  Mail, 
  MessageSquare, 
  Check, 
  CheckCircle2,
  RotateCcw,
  Eye,
  EyeOff,
  ChevronDown,
  FileCode,
  Code2,
  X,
  ShieldCheck
} from "lucide-react";
import { WebhookEndpoint, WebhookPayloadStandard } from "./types";
import Noise from "@/components/ui/Noise";

import { ScientistPillButton } from "@/components/ui/ScientistPillButton";

/**
 * TECHNICAL ARCHITECTURE:
 * Signature = HMAC-SHA256(Payload JSON, K_secret)
 * Passed via HTTP Headers: X-Cyclo-Signature & X-Cyclo-Timestamp
 */

const PAYLOAD_OPTIONS: {
  id: WebhookPayloadStandard;
  name: string;
  description: string;
  badge: string;
  badgeActiveColor: string;
}[] = [
  {
    id: "cap-xml",
    name: "CAP-XML v1.2 (WMO)",
    description: "OASIS CAP v1.2 XML Alert Schema",
    badge: "WMO Standard",
    badgeActiveColor: "bg-[#10E7A2]/15 text-[#10E7A2] border-[#10E7A2]/40",
  },
  {
    id: "cyclo-json",
    name: "CYCLO-AI JSON v1.0",
    description: "Native JSON Schema & GeoJSON Coordinates",
    badge: "High Throughput",
    badgeActiveColor: "bg-[#00F2FE]/15 text-[#00F2FE] border-[#00F2FE]/40",
  },
];

const PANEL_VARIANTS = {
  hidden: { opacity: 0, scale: 0.94, y: -8, filter: "blur(6px)" },
  visible: {
    opacity: 1, scale: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as [number, number, number, number], staggerChildren: 0.04, delayChildren: 0.02 },
  },
  exit: {
    opacity: 0, scale: 0.95, y: -6, filter: "blur(4px)",
    transition: { duration: 0.18, ease: [0.25, 1, 0.5, 1] as [number, number, number, number] },
  },
};

const ITEM_VARIANTS = {
  hidden: { opacity: 0, x: -6, y: -2 },
  visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } },
};

interface WebhooksPanelProps {
  webhooks: WebhookEndpoint[];
  onUpdateWebhook: (id: string, updated: Partial<WebhookEndpoint>) => void;
  onNotify: (text: string, type: "success" | "warning" | "error") => void;
}

export const WebhooksPanel: React.FC<WebhooksPanelProps> = ({
  webhooks,
  onUpdateWebhook,
  onNotify,
}) => {
  const [activeTestWebhook, setActiveTestWebhook] = useState<WebhookEndpoint | null>(null);
  const [isSendingPing, setIsSendingPing] = useState(false);
  const [testResponse, setTestResponse] = useState<{
    status: number;
    latencyMs: number;
    signature: string;
    payloadSnippet: string;
  } | null>(null);

  const [showSmsModal, setShowSmsModal] = useState(false);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [maskedHmacMap, setMaskedHmacMap] = useState<Record<string, boolean>>({});

  const isHmacMasked = (id: string) => maskedHmacMap[id] !== false;
  const toggleHmacMask = (id: string) =>
    setMaskedHmacMap((prev) => ({ ...prev, [id]: !isHmacMasked(id) }));

  const [mounted, setMounted] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [dropPos, setDropPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 280 });
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!activeDropdownId) return;
    const updatePosition = () => {
      const trigger = document.getElementById(`payload-trigger-${activeDropdownId}`);
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        setDropPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 300) });
      }
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [activeDropdownId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        const isTrigger = (target as HTMLElement).closest?.(`[id^="payload-trigger-"]`);
        if (!isTrigger) {
          setActiveDropdownId(null);
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleRegenerateHmac = (id: string) => {
    const chars = "abcdef0123456789";
    let newSec = "cyclo_sec_";
    for (let i = 0; i < 16; i++) {
      newSec += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    onUpdateWebhook(id, { hmacSecret: newSec });
    onNotify("HMAC-SHA256 secret regenerated and rotated.", "success");
  };

  const handleSendTestPing = (wh: WebhookEndpoint) => {
    setActiveTestWebhook(wh);
    setIsSendingPing(true);
    setTestResponse(null);

    setTimeout(() => {
      const mockLatency = Math.floor(Math.random() * 20) + 25;
      const mockSignature = "sha256=4f8b9e6a8d7c1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f";
      const samplePayload = wh.payloadStandard === "cap-xml"
        ? `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>CYCLO-AI-TEST-2026-10-15-001</identifier>
  <sender>alerts@cyclo-ai.imd.gov.in</sender>
  <sent>2026-10-15T09:30:00Z</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <info>
    <category>Met</category>
    <event>Severe Cyclonic Storm (Amphan Simulation)</event>
    <headline>IMD Stage 3 Cyclone Warning: Bay of Bengal Landfall T-24h</headline>
  </info>
</alert>`
        : JSON.stringify(
            {
              event: "cyclone.stage3_warning",
              timestamp: new Date().toISOString(),
              agency: wh.agency,
              storm: {
                id: "BOB-02-2020",
                name: "AMPHAN (Simulation)",
                v_max_kts: 130,
                pressure_hpa: 926,
                projected_landfall: "Digha, West Bengal Coast",
              },
            },
            null,
            2
          );

      setTestResponse({
        status: 200,
        latencyMs: mockLatency,
        signature: mockSignature,
        payloadSnippet: samplePayload,
      });
      setIsSendingPing(false);
      onNotify(`Test ping dispatched to ${wh.name} (HTTP 200 OK - ${mockLatency}ms)`, "success");
    }, 650);
  };

  const handleTestSms = () => {
    setIsSendingSms(true);
    setTimeout(() => {
      setIsSendingSms(false);
      setShowSmsModal(false);
      onNotify("Emergency Cell Broadcast simulation dispatched to CDAC CAP SMS Gateway.", "success");
    }, 700);
  };

  return (
    <section id="webhooks" className="scroll-mt-20 space-y-4">
      {/* Streamlined Section Title */}
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(0,242,254,0.25)] pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-wide flex items-center">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                Disaster Webhook Integrations &amp; Telephony Relays
              </span>
            </span>
          </h2>
        </div>
      </div>

      {/* SDMA REGISTRY CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {webhooks.map((wh) => (
          <div
            key={wh.id}
            className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-[#0A1322] h-full"
            style={{
              backgroundColor: "#0A1322",
              backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
              border: "1.5px solid rgba(0, 242, 254, 0.45)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 14px rgba(0, 242, 254, 0.15)",
            }}
          >
            <div className="absolute inset-0 w-full h-full pointer-events-none rounded-xl overflow-hidden">
              <Noise patternSize={250} patternScaleX={1.4} patternScaleY={1.4} patternRefreshInterval={2} patternAlpha={9} />
            </div>

            <div className="relative z-10 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                    {wh.name}
                  </h3>
                  <p
                    className="text-[11px] font-sans text-white"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 2px #000000" }}
                  >
                    {wh.agency}
                  </p>
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-1">
                <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">Destination Webhook URL</span>
                <input
                  type="text"
                  value={wh.url}
                  onChange={(e) => onUpdateWebhook(wh.id, { url: e.target.value })}
                  className="w-full bg-[#050B14] border-[1.5px] border-[rgba(0,242,254,0.45)] rounded-lg px-3 py-1.5 text-xs font-mono text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.12)] focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_16px_rgba(0,242,254,0.3)] transition-all"
                />
              </div>

              {/* Triggers */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                  Operational Event Triggers
                </span>
                <div className="p-1 rounded-xl bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]">
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { key: "genesis", label: "Genesis (T >= 2.5)" },
                      { key: "rapidIntensification", label: "Rapid Intensification" },
                      { key: "stage3Warning", label: "Stage 3 Landfall T-24h" },
                      { key: "coastalInundation", label: "Surge > 2.0m" },
                    ].map((trig) => {
                      const trigKey = trig.key as keyof typeof wh.triggers;
                      const isChecked = wh.triggers[trigKey];
                      return (
                        <button
                          key={trig.key}
                          type="button"
                          onClick={() =>
                            onUpdateWebhook(wh.id, {
                              triggers: {
                                ...wh.triggers,
                                [trigKey]: !isChecked,
                              },
                            })
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                            isChecked
                              ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)] font-black"
                              : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                          }`}
                        >
                          {trig.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Payload Format & Secret */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-2">
                  <div className="flex items-center h-6 text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    <span>Payload Standard</span>
                  </div>
                  <button
                    id={`payload-trigger-${wh.id}`}
                    type="button"
                    onClick={(e) => {
                      if (activeDropdownId === wh.id) {
                        setActiveDropdownId(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setDropPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 300) });
                        setActiveDropdownId(wh.id);
                      }
                    }}
                    className={`w-full h-9 bg-[#050B14] border-[1.5px] rounded-lg px-3 py-1.5 text-xs font-mono flex items-center justify-between transition-all cursor-pointer ${
                      activeDropdownId === wh.id
                        ? "border-[#00F2FE] shadow-[0_0_16px_rgba(0,242,254,0.35)] text-[#00F2FE]"
                        : "border-[rgba(0,242,254,0.45)] text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.12)] hover:border-[#00F2FE]"
                    }`}
                  >
                    <span className="truncate flex items-center gap-2">
                      <FileCode className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                      <span>{PAYLOAD_OPTIONS.find((o) => o.id === wh.payloadStandard)?.name || wh.payloadStandard}</span>
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#00F2FE] shrink-0 transition-transform duration-200 ${
                        activeDropdownId === wh.id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center h-6 text-xs font-mono text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    <span>HMAC-SHA256</span>
                    <ScientistPillButton
                      onClick={() => handleRegenerateHmac(wh.id)}
                      className="scientist-pill !h-6 !min-w-0 !px-2.5 !py-0 !rounded-lg !gap-1"
                      icon={<RotateCcw className="w-2.5 h-2.5 text-[#00F2FE] shrink-0" />}
                      hoverIcon={<RotateCcw className="w-2.5 h-2.5 text-[#050B14] shrink-0" />}
                      label={
                        <span className="font-rajdhani font-bold text-[10px] uppercase tracking-wider text-white">
                          Rotate
                        </span>
                      }
                      hoverLabel={
                        <span className="font-rajdhani font-bold text-[10px] uppercase tracking-wider text-[#050B14]">
                          Rotate
                        </span>
                      }
                      title="Rotate HMAC secret key"
                    />
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={isHmacMasked(wh.id) ? "password" : "text"}
                      value={wh.hmacSecret}
                      readOnly
                      className="w-full h-9 bg-[#050B14] border-[1.5px] border-[rgba(0,242,254,0.45)] rounded-lg px-3 py-1.5 pr-10 text-xs font-mono text-slate-200 shadow-[0_0_10px_rgba(0,242,254,0.12)] focus:outline-none focus:border-[#00F2FE] focus:shadow-[0_0_16px_rgba(0,242,254,0.3)] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => toggleHmacMask(wh.id)}
                      className="absolute right-2.5 p-1 text-slate-400 hover:text-[#00F2FE] cursor-pointer"
                      title={isHmacMasked(wh.id) ? "Reveal HMAC secret" : "Hide HMAC secret"}
                    >
                      {isHmacMasked(wh.id) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 pt-1 flex items-center justify-end">
              <ScientistPillButton
                onClick={() => handleSendTestPing(wh)}
                disabled={isSendingPing && activeTestWebhook?.id === wh.id}
                className="scientist-pill !h-9 !px-3.5 !py-0 !rounded-xl !gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                icon={
                  isSendingPing && activeTestWebhook?.id === wh.id ? (
                    <RefreshCw className="w-3.5 h-3.5 text-[#00F2FE] animate-spin shrink-0" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                  )
                }
                hoverIcon={
                  isSendingPing && activeTestWebhook?.id === wh.id ? (
                    <RefreshCw className="w-3.5 h-3.5 text-[#050B14] animate-spin shrink-0" />
                  ) : (
                    <Send className="w-3.5 h-3.5 text-[#050B14] shrink-0" />
                  )
                }
                label={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    {isSendingPing && activeTestWebhook?.id === wh.id ? "Pinging..." : "Send Test Ping"}
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                    {isSendingPing && activeTestWebhook?.id === wh.id ? "Pinging..." : "Send Test Ping"}
                  </span>
                }
                title={`Send test webhook payload to ${wh.name}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* TELEPHONY RELAYS: CDAC SMS & SMTP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CDAC SMS */}
        <div
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-2.5 bg-[#0A1322]"
          style={{
            backgroundColor: "#0A1322",
            backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 14px rgba(0, 242, 254, 0.15)",
          }}
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none rounded-xl overflow-hidden">
            <Noise patternSize={250} patternScaleX={1.4} patternScaleY={1.4} patternRefreshInterval={2} patternAlpha={18} />
          </div>

          <div className="relative z-10 flex flex-col justify-between space-y-2.5 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00F2FE]" />
                <h3 className="font-rajdhani font-bold text-sm text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                  National CDAC CAP SMS Gateway
                </h3>
              </div>
            </div>
            <p
              className="text-xs font-sans text-white leading-relaxed"
              style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 2px #000000" }}
            >
              Emergency cell-broadcast mesh covering coastal populations across multi-lingual templates.
            </p>
            <div className="flex justify-end pt-1">
              <ScientistPillButton
                onClick={() => setShowSmsModal(true)}
                className="scientist-pill !h-9 !px-3.5 !py-0 !rounded-xl !gap-2"
                icon={<MessageSquare className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
                hoverIcon={<MessageSquare className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
                label={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    Simulate SMS Broadcast
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                    Simulate SMS Broadcast
                  </span>
                }
                title="Simulate SMS Broadcast"
              />
            </div>
          </div>
        </div>

        {/* SMTP */}
        <div
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-2.5 bg-[#0A1322]"
          style={{
            backgroundColor: "#0A1322",
            backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 14px rgba(0, 242, 254, 0.15)",
          }}
        >
          <div className="absolute inset-0 w-full h-full pointer-events-none rounded-xl overflow-hidden">
            <Noise patternSize={250} patternScaleX={1.4} patternScaleY={1.4} patternRefreshInterval={2} patternAlpha={18} />
          </div>

          <div className="relative z-10 flex flex-col justify-between space-y-2.5 h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#00F2FE]" />
                <h3 className="font-rajdhani font-bold text-sm text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                  SMTP Notification Relay (TLS 1.3)
                </h3>
              </div>
            </div>
            <p
              className="text-xs font-sans text-white leading-relaxed"
              style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 2px #000000" }}
            >
              Authoritative email dispatches from alerts@cyclo-ai.imd.gov.in to state emergency centres.
            </p>
            <div className="flex justify-end pt-1">
              <ScientistPillButton
                onClick={() => onNotify("Test bulletin dispatched to administrative mail list.", "success")}
                className="scientist-pill !h-9 !px-3.5 !py-0 !rounded-xl !gap-2"
                icon={<Mail className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
                hoverIcon={<Mail className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
                label={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    Send Test Email
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                    Send Test Email
                  </span>
                }
                title="Send Test Email"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Ping Inspector Modal */}
      {activeTestWebhook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B14]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-[#0A1322] flex flex-col max-h-[90vh]"
            style={{
              backgroundColor: "#0A1322",
              backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
              border: "1.5px solid rgba(0, 242, 254, 0.45)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.8), 0 0 24px rgba(0, 242, 254, 0.2)",
            }}
          >
            <div className="absolute inset-0 w-full h-full pointer-events-none rounded-xl overflow-hidden">
              <Noise patternSize={250} patternScaleX={1.5} patternScaleY={1.5} patternRefreshInterval={2} patternAlpha={9} />
            </div>

            <div className="relative z-10 p-5 sm:p-6 space-y-4 overflow-y-auto w-full">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[rgba(0,242,254,0.18)]">
                <div>
                  <h3 className="font-rajdhani font-bold text-base sm:text-lg text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                    Webhook Dispatch Inspector
                  </h3>
                  <p
                    className="text-xs font-sans text-slate-300 mt-0.5"
                    style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 2px #000000" }}
                  >
                    {activeTestWebhook.name}{" "}
                    <span className="text-[#00F2FE]/80 font-mono text-[11px]">({activeTestWebhook.url})</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTestWebhook(null)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#050B14] hover:bg-[#16253D] border border-[rgba(0,242,254,0.35)] text-slate-400 hover:text-[#00F2FE] transition-all cursor-pointer shadow-[0_0_8px_rgba(0,242,254,0.15)] shrink-0"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isSendingPing ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs font-mono text-slate-300">
                  <RefreshCw className="w-7 h-7 text-[#00F2FE] animate-spin" />
                  <span className="tracking-wide text-sm font-rajdhani font-bold text-white uppercase">
                    Dispatching HMAC-signed payload...
                  </span>
                </div>
              ) : testResponse ? (
                <div className="space-y-3">
                  {/* Signature & Latency Card */}
                  <div className="bg-[#050B14] border-[1.5px] border-[rgba(0,242,254,0.35)] rounded-xl p-3.5 space-y-2.5 shadow-[0_0_12px_rgba(0,242,254,0.1)]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#00F2FE] font-rajdhani font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#00F2FE]" />
                        HMAC-SHA256 Signature
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-200 break-all bg-[#070E1A] p-2.5 rounded-lg border border-white/5 selection:bg-[#00F2FE]/30">
                      <span className="text-slate-400">sha256=</span>
                      <span className="text-[#00F2FE]">{testResponse.signature.replace("sha256=", "")}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-white/5">
                      <span className="text-slate-300">
                        Round-Trip Latency: <strong className="text-[#00E676] font-bold">{testResponse.latencyMs} ms</strong>
                      </span>
                      <span className="text-slate-300">
                        Standard: <strong className="text-white uppercase font-bold">{activeTestWebhook.payloadStandard}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Dispatched Payload Pre */}
                  <div className="rounded-xl border-[1.5px] border-[rgba(0,242,254,0.35)] bg-[#050B14] overflow-hidden shadow-[0_0_12px_rgba(0,242,254,0.1)]">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-[#070E1A] border-b border-[rgba(0,242,254,0.2)]">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-3.5 h-3.5 text-[#00F2FE]" />
                        <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white">
                          Dispatched Payload Body
                        </span>
                      </div>
                    </div>
                    <pre className="p-3.5 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-56 leading-relaxed selection:bg-[#00F2FE]/30 no-scrollbar">
                      {testResponse.payloadSnippet}
                    </pre>
                  </div>
                </div>
              ) : null}

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-1">
                <ScientistPillButton
                  onClick={() => setActiveTestWebhook(null)}
                  className="scientist-pill !h-9 !px-4 !py-0 !rounded-xl !gap-2"
                  icon={<Check className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
                  hoverIcon={<Check className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
                  label={
                    <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                      Close
                    </span>
                  }
                  hoverLabel={
                    <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                      Close
                    </span>
                  }
                  title="Close Inspector"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050B14]/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-md overflow-hidden rounded-xl p-5 sm:p-6 bg-[#0A1322] space-y-4 shadow-2xl"
            style={{
              backgroundColor: "#0A1322",
              backgroundImage: "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
              border: "1.5px solid rgba(0, 242, 254, 0.45)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.8), 0 0 24px rgba(0, 242, 254, 0.2)",
            }}
          >
            <div className="absolute inset-0 w-full h-full pointer-events-none rounded-xl overflow-hidden">
              <Noise patternSize={250} patternScaleX={1.4} patternScaleY={1.4} patternRefreshInterval={2} patternAlpha={18} />
            </div>

            <div className="relative z-10 space-y-4">
              <div className="pb-3 border-b border-[rgba(0,242,254,0.18)]">
                <h3 className="font-rajdhani font-bold text-base sm:text-lg uppercase text-[#00F2FE] tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                  CDAC Cell Broadcast Simulation
                </h3>
              </div>

              <div
                className="p-3.5 rounded-xl space-y-2"
                style={{
                  backgroundColor: "#1F0B05",
                  backgroundImage: "linear-gradient(145deg, rgba(255, 94, 54, 0.35) 0%, rgba(200, 65, 15, 0.22) 45%, #180803 100%)",
                  border: "1.5px solid rgba(255, 94, 54, 0.65)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.6), 0 0 18px rgba(255, 94, 54, 0.25)",
                }}
              >
                <span
                  className="text-[#FF5E36] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 font-rajdhani"
                  style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 2px #000000" }}
                >
                  ⚠️ EMERGENCY ALERT / IMD STAGE 3
                </span>
                <p
                  className="text-[#FF9D7A] font-sans text-xs leading-relaxed font-medium"
                  style={{ textShadow: "0 2px 4px rgba(0, 0, 0, 0.95), 0 1px 2px #000000" }}
                >
                  "Super Cyclone AMPHAN: Landfall near Digha in 24h. Winds 185-205 km/h. Surge &gt; 3.5m. Evacuate low-lying areas. - IMD / SDMA"
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <ScientistPillButton
                  onClick={() => setShowSmsModal(false)}
                  className="scientist-pill-slate !h-9 !px-3.5 !py-0 !rounded-xl !gap-1.5"
                  label={
                    <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#CBD5E1]">
                      Cancel
                    </span>
                  }
                  hoverLabel={
                    <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white">
                      Cancel
                    </span>
                  }
                  title="Cancel Broadcast"
                />
                <ScientistPillButton
                  onClick={handleTestSms}
                  disabled={isSendingSms}
                  className="scientist-pill !h-9 !px-4 !py-0 !rounded-xl !gap-2 disabled:opacity-50"
                  icon={
                    isSendingSms ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#00F2FE] animate-spin shrink-0" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                    )
                  }
                  hoverIcon={
                    isSendingSms ? (
                      <RefreshCw className="w-3.5 h-3.5 text-[#050B14] animate-spin shrink-0" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-[#050B14] shrink-0" />
                    )
                  }
                  label={
                    <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                      {isSendingSms ? "Broadcasting..." : "Dispatch Broadcast"}
                    </span>
                  }
                  hoverLabel={
                    <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                      {isSendingSms ? "Broadcasting..." : "Dispatch Broadcast"}
                    </span>
                  }
                  title="Dispatch Cell Broadcast"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Dropdown Portal matching ModelSelectorPill */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {activeDropdownId && (
            <motion.div
              ref={dropdownRef}
              key={`payload-dropdown-${activeDropdownId}`}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={PANEL_VARIANTS}
              style={{
                position: "fixed",
                top: dropPos.top,
                left: dropPos.left,
                width: dropPos.width,
                zIndex: 9999,
                transformOrigin: "top left",
              }}
              className="min-w-[300px] bg-[#0F1B2F]/95 backdrop-blur-xl border border-[rgba(0,242,254,0.45)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(0,242,254,0.18)] transform-gpu overflow-hidden"
            >
              <Noise patternSize={250} patternScaleX={2.5} patternScaleY={2.5} patternRefreshInterval={2} patternAlpha={10} />
              <div className="relative z-10 flex flex-col space-y-1">
                {PAYLOAD_OPTIONS.map((opt) => {
                  const currentWh = webhooks.find((w) => w.id === activeDropdownId);
                  const active = currentWh?.payloadStandard === opt.id;
                  const IconComponent = opt.id === "cap-xml" ? FileCode : Code2;
                  return (
                    <motion.button
                      key={opt.id}
                      variants={ITEM_VARIANTS}
                      type="button"
                      onClick={() => {
                        if (activeDropdownId) {
                          onUpdateWebhook(activeDropdownId, { payloadStandard: opt.id });
                          onNotify(`Payload standard updated to ${opt.name}`, "success");
                        }
                        setActiveDropdownId(null);
                      }}
                      className={`flex items-center justify-between w-full px-2.5 py-2 rounded-lg border transition-all duration-200 cursor-pointer text-left ${
                        active
                          ? "bg-[rgba(0,242,254,0.14)] border-[rgba(0,242,254,0.5)] shadow-[0_0_12px_rgba(0,242,254,0.22)]"
                          : "bg-transparent border-transparent hover:bg-white/[0.06] hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${
                            active ? "bg-[#00F2FE]/20 text-[#00F2FE]" : "bg-white/5 text-[#8E9EB5]"
                          }`}
                        >
                          <IconComponent className="w-3.5 h-3.5 shrink-0" />
                        </div>
                        <div className="min-w-0">
                          <div
                            className={`text-xs font-bold font-rajdhani uppercase tracking-wider truncate ${
                              active ? "text-[#00F2FE]" : "text-white"
                            }`}
                          >
                            {opt.name}
                          </div>
                          <div className="text-[10px] text-[#8E9EB5] font-mono leading-tight truncate">
                            {opt.description}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                          active
                            ? opt.badgeActiveColor
                            : "bg-white/5 text-[#8E9EB5] border-white/10"
                        }`}
                      >
                        {opt.badge}
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
    </section>
  );
};
