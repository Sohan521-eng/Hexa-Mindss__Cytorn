"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Play,
  X,
  ChevronDown,
  ShieldCheck,
  Zap,
  Activity
} from "lucide-react";
import { ApiToken } from "./types";
import { openApiEndpoints, sdkSnippets } from "./settingsData";
import Noise from "@/components/ui/Noise";
import { ScientistPillButton } from "@/components/ui/ScientistPillButton";
import { ElasticSlider } from "@/components/ui/ElasticSlider";

const SCOPE_OPTIONS: {
  id: ApiToken["scope"];
  name: string;
  description: string;
  badge: string;
  badgeActiveColor: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "read:active_storms",
    name: "read:active_storms (Live intensity)",
    description: "Live intensity, storm metrics & LLCC tracking",
    badge: "Telemetry Stream",
    badgeActiveColor: "bg-[#00E676]/15 text-[#00E676] border-[#00E676]/40",
    icon: Activity,
  },
  {
    id: "predict:trajectory",
    name: "predict:trajectory (Forward infer)",
    description: "Forward trajectory inference & PINN cones",
    badge: "AI Inference",
    badgeActiveColor: "bg-[#00F2FE]/15 text-[#00F2FE] border-[#00F2FE]/40",
    icon: Zap,
  },
  {
    id: "admin:configuration",
    name: "admin:configuration (Config edit)",
    description: "Administrative engine & webhook config edits",
    badge: "Admin Access",
    badgeActiveColor: "bg-[#FF5E36]/15 text-[#FF5E36] border-[#FF5E36]/40",
    icon: ShieldCheck,
  },
];

interface DeveloperApiHubProps {
  apiTokens: ApiToken[];
  onGenerateToken: (token: ApiToken) => void;
  onRevokeToken: (tokenId: string) => void;
  onNotify: (text: string, type: "success" | "warning" | "error") => void;
}

export const DeveloperApiHub: React.FC<DeveloperApiHubProps> = ({
  apiTokens,
  onGenerateToken,
  onRevokeToken,
  onNotify,
}) => {
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenScope, setNewTokenScope] = useState<ApiToken["scope"]>("read:active_storms");
  const [newTokenRateLimit, setNewTokenRateLimit] = useState(600);
  const [generatedFullKey, setGeneratedFullKey] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);
  const [isScopeOpen, setIsScopeOpen] = useState(false);
  const [scopeDropPos, setScopeDropPos] = useState({ top: 0, left: 0, width: 0 });
  const scopeDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown on click outside or resize/scroll
  useEffect(() => {
    if (!isScopeOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const trigger = document.getElementById("scope-dropdown-trigger");
      if (
        scopeDropdownRef.current &&
        !scopeDropdownRef.current.contains(e.target as Node) &&
        trigger &&
        !trigger.contains(e.target as Node)
      ) {
        setIsScopeOpen(false);
      }
    };
    const handleScrollOrResize = () => {
      const trigger = document.getElementById("scope-dropdown-trigger");
      if (trigger) {
        const rect = trigger.getBoundingClientRect();
        setScopeDropPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 320) });
      }
    };
    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);
    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isScopeOpen]);

  const [selectedEndpointIndex, setSelectedEndpointIndex] = useState(0);
  const [isExecutingApi, setIsExecutingApi] = useState(false);
  const [apiExecutionResult, setApiExecutionResult] = useState<{
    status: number;
    latencyMs: number;
    responseBody: object;
  } | null>(null);

  const [activeLang, setActiveLang] = useState<string>("curl");
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTokenName.trim()) return;

    const randomSuffix = Math.random().toString(36).substring(2, 10);
    const fullKey = `cyc_live_${randomSuffix}${Math.random().toString(36).substring(2, 10)}`;
    const prefix = `cyc_live_${randomSuffix.substring(0, 4)}••••••••${randomSuffix.substring(4, 8)}`;

    const newToken: ApiToken = {
      id: `tok-${Date.now()}`,
      name: newTokenName,
      tokenPrefix: prefix,
      scope: newTokenScope,
      rateLimitPerMin: newTokenRateLimit,
      createdDate: new Date().toISOString().split("T")[0],
      lastUsedDate: "Never",
      isRevoked: false,
    };

    onGenerateToken(newToken);
    setGeneratedFullKey(fullKey);
    onNotify(`Token '${newToken.name}' provisioned successfully.`, "success");
  };

  const handleExecuteRequest = () => {
    setIsExecutingApi(true);
    setApiExecutionResult(null);

    setTimeout(() => {
      const endpoint = openApiEndpoints[selectedEndpointIndex];
      const latency = Math.floor(Math.random() * 12) + 16;
      setApiExecutionResult({
        status: 200,
        latencyMs: latency,
        responseBody: endpoint.sampleResponse,
      });
      setIsExecutingApi(false);
      onNotify(`${endpoint.method} ${endpoint.path} succeeded (${latency}ms)`, "success");
    }, 550);
  };

  const handleCopySnippet = () => {
    const text = sdkSnippets[activeLang]?.code || "";
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
    onNotify("Code snippet copied to clipboard.", "success");
  };

  const currentEndpoint = openApiEndpoints[selectedEndpointIndex];

  return (
    <section id="api-hub" className="scroll-mt-20 space-y-4">
      {/* Streamlined Section Title */}
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(0,242,254,0.25)] pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-wide flex items-center">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                Developer API Hub &amp; Token Management
              </span>
            </span>
          </h2>
        </div>

        <ScientistPillButton
          onClick={() => {
            setGeneratedFullKey(null);
            setNewTokenName("");
            setShowGenerateModal(true);
          }}
          className="scientist-pill !h-9 !px-3.5 !py-0 !rounded-xl !gap-2"
          icon={<Plus className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
          hoverIcon={<Plus className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
          label={
            <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
              Generate New Key
            </span>
          }
          hoverLabel={
            <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
              Generate New Key
            </span>
          }
          title="Generate New API Authorization Key"
        />
      </div>

      {/* ACTIVE TOKENS TABLE */}
      <div
        className="relative overflow-hidden rounded-xl p-4 sm:p-5 space-y-3 bg-[#0A1322]"
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

        <div className="relative z-10 flex items-center justify-between">
          <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
            Active REST API Authorization Tokens
          </h3>
          <span className="font-mono text-xs text-[#00F2FE]">
            Quota: 1,200 req/min
          </span>
        </div>

        <div className="relative z-10 overflow-x-auto no-scrollbar border border-slate-800/80 rounded-lg bg-[#050B14]/40 backdrop-blur-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#050B14]/80 text-[11px] font-mono text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <th className="py-2 px-3">Token Name</th>
                <th className="py-2 px-3">Prefix / Hash</th>
                <th className="py-2 px-3">Scope</th>
                <th className="py-2 px-3">Rate Limit</th>
                <th className="py-2 px-3">Created</th>
                <th className="py-2 px-3">Last Used</th>
                <th className="py-2 px-3 text-right">Revoke</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {apiTokens.map((tok) => (
                <tr
                  key={tok.id}
                  className={`hover:bg-[#050B14]/50 transition-colors ${
                    tok.isRevoked ? "opacity-40" : ""
                  }`}
                >
                  <td className="py-2.5 px-3 font-semibold text-white">
                    <div className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-[#00F2FE]" />
                      <span>{tok.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-[#00F2FE]">{tok.tokenPrefix}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      {tok.scope}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{tok.rateLimitPerMin} req/min</td>
                  <td className="py-2.5 px-3 text-slate-400">{tok.createdDate}</td>
                  <td className="py-2.5 px-3 text-slate-300">{tok.lastUsedDate}</td>
                  <td className="py-2.5 px-3 text-right">
                    {tok.isRevoked ? (
                      <span className="text-[10px] font-bold text-[#FF5E36]">REVOKED</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          onRevokeToken(tok.id);
                          onNotify(`Token '${tok.name}' revoked.`, "warning");
                        }}
                        className="p-1 rounded text-slate-400 hover:text-[#FF5E36] cursor-pointer"
                        title="Revoke Token"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* OPENAPI SANDBOX & SDK SNIPPETS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* OpenAPI Sandbox */}
        <div
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-[#0A1322]"
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

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                Interactive OpenAPI 3.1 Console
              </h3>
            </div>

            {/* Endpoints */}
            <div className="w-full flex items-center gap-1.5 p-1 rounded-xl bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] overflow-x-auto no-scrollbar">
              {openApiEndpoints.map((ep, idx) => {
                const isActive = selectedEndpointIndex === idx;
                return (
                  <button
                    key={ep.path}
                    type="button"
                    onClick={() => {
                      setSelectedEndpointIndex(idx);
                      setApiExecutionResult(null);
                    }}
                    className={`group flex-1 min-w-[170px] sm:min-w-0 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-white shadow-[0_0_10px_rgba(0,242,254,0.3)] font-bold"
                        : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                    }`}
                  >
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[11px] font-rajdhani uppercase tracking-wider shrink-0 ${
                        ep.method === "GET"
                          ? "bg-[#00E676]/15 text-[#00E676] border border-[#00E676]/30"
                          : "bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30"
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="font-mono text-xs truncate">{ep.path}</span>
                  </button>
                );
              })}
            </div>

            <div
              className="p-3 rounded-xl flex items-center justify-between gap-3 bg-[#050B14]/80 backdrop-blur-sm shadow-inner"
              style={{
                border: "1.5px solid rgba(0, 242, 254, 0.45)",
                boxShadow: "0 0 14px rgba(0, 242, 254, 0.12), inset 0 2px 6px rgba(0, 0, 0, 0.6)",
              }}
            >
              <span className="text-xs font-mono text-slate-300 truncate pr-2">
                {currentEndpoint.description}
              </span>
              <ScientistPillButton
                onClick={handleExecuteRequest}
                disabled={isExecutingApi}
                className="scientist-pill !h-8 !px-3.5 !py-0 !rounded-xl !gap-1.5 disabled:opacity-50 shrink-0"
                icon={<Play className="w-3 h-3 text-[#00F2FE] shrink-0" />}
                hoverIcon={<Play className="w-3 h-3 text-[#050B14] shrink-0" />}
                label={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    {isExecutingApi ? "Running..." : "Execute"}
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                    {isExecutingApi ? "Running..." : "Execute"}
                  </span>
                }
                title="Execute API Request"
              />
            </div>

            <pre
              className="bg-[#050B14]/85 backdrop-blur-sm rounded-xl p-3 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-44 no-scrollbar"
              style={{
                border: "1.5px solid rgba(0, 242, 254, 0.45)",
                boxShadow: "0 0 14px rgba(0, 242, 254, 0.12), inset 0 2px 6px rgba(0, 0, 0, 0.6)",
              }}
            >
              {JSON.stringify(
                apiExecutionResult ? apiExecutionResult.responseBody : currentEndpoint.sampleResponse,
                null,
                2
              )}
            </pre>
          </div>
        </div>

        {/* Multi-Language SDK Snippets */}
        <div
          className="relative overflow-hidden rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-3 bg-[#0A1322]"
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

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-rajdhani font-bold text-base text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                Multi-Language Integration Snippets
              </h3>

              <ScientistPillButton
                onClick={handleCopySnippet}
                className="scientist-pill !h-8 !px-3.5 !py-0 !rounded-xl !gap-1.5 shrink-0"
                icon={
                  copiedSnippet ? (
                    <Check className="w-3.5 h-3.5 text-[#00E676] shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                  )
                }
                hoverIcon={
                  copiedSnippet ? (
                    <Check className="w-3.5 h-3.5 text-[#050B14] shrink-0" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#050B14] shrink-0" />
                  )
                }
                label={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                    {copiedSnippet ? "Copied" : "Copy"}
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                    {copiedSnippet ? "Copied" : "Copy"}
                  </span>
                }
                title="Copy code snippet to clipboard"
              />
            </div>

            {/* Language Tabs */}
            <div className="w-full flex items-center gap-1.5 p-1 rounded-xl bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] overflow-x-auto no-scrollbar">
              {Object.keys(sdkSnippets).map((langKey) => {
                const item = sdkSnippets[langKey];
                const isActive = activeLang === langKey;
                return (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => setActiveLang(langKey)}
                    className={`group flex-1 min-w-[70px] sm:min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)] font-bold"
                        : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                  </button>
                );
              })}
            </div>

            <pre
              className="bg-[#050B14]/85 backdrop-blur-sm rounded-xl p-3 text-[11px] font-mono text-slate-200 overflow-x-auto max-h-52 no-scrollbar leading-relaxed"
              style={{
                border: "1.5px solid rgba(0, 242, 254, 0.45)",
                boxShadow: "0 0 14px rgba(0, 242, 254, 0.12), inset 0 2px 6px rgba(0, 0, 0, 0.6)",
              }}
            >
              {sdkSnippets[activeLang]?.code}
            </pre>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showGenerateModal && (
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
                <h3 className="font-rajdhani font-bold text-base sm:text-lg text-[#00F2FE] uppercase tracking-wider [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                  Generate Scoped API Token
                </h3>
              </div>

              {generatedFullKey ? (
                <div className="space-y-3 bg-[#050B14] p-4 rounded-xl border-[1.5px] border-[#00E676]/45 shadow-[0_0_16px_rgba(0,230,118,0.15)]">
                  <span className="text-[#00E676] font-rajdhani font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#00E676]" /> Key Created (Store Securely):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedFullKey}
                      className="w-full bg-[#0A1322] border border-[#00E676]/40 rounded-xl px-3 py-2 text-xs font-mono text-[#00E676] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedFullKey);
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 2000);
                        onNotify("Token copied to clipboard.", "success");
                      }}
                      className="h-9 px-3 rounded-xl bg-[#00E676] hover:bg-[#2bf597] text-[#050B14] font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(0,230,118,0.3)]"
                      title="Copy Key to Clipboard"
                    >
                      {copiedKey ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex justify-end pt-1">
                    <ScientistPillButton
                      onClick={() => setShowGenerateModal(false)}
                      className="scientist-pill !h-9 !px-4 !py-0 !rounded-xl !gap-1.5"
                      label={<span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white">Done</span>}
                      hoverLabel={<span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">Done</span>}
                      title="Close"
                    />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateToken} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-rajdhani font-bold text-slate-300 uppercase tracking-wider">
                      Client Identifier Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      placeholder="e.g., INCOIS Surge Modeler"
                      style={{
                        border: "1.5px solid rgba(0, 242, 254, 0.45)",
                        boxShadow: "0 0 12px rgba(0, 242, 254, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.6)",
                      }}
                      className="w-full bg-[#050B14] focus:border-[#00F2FE] focus:shadow-[0_0_16px_rgba(0,242,254,0.35)] rounded-xl px-3.5 py-2.5 font-mono text-xs text-white placeholder:text-slate-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-rajdhani font-bold text-slate-300 uppercase tracking-wider">
                      Permission Scope
                    </label>
                    <button
                      id="scope-dropdown-trigger"
                      type="button"
                      onClick={(e) => {
                        if (isScopeOpen) {
                          setIsScopeOpen(false);
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setScopeDropPos({ top: rect.bottom + 6, left: rect.left, width: Math.max(rect.width, 320) });
                          setIsScopeOpen(true);
                        }
                      }}
                      style={{
                        border: isScopeOpen ? "1.5px solid #00F2FE" : "1.5px solid rgba(0, 242, 254, 0.45)",
                        boxShadow: isScopeOpen
                          ? "0 0 16px rgba(0, 242, 254, 0.35), inset 0 2px 4px rgba(0, 0, 0, 0.6)"
                          : "0 0 12px rgba(0, 242, 254, 0.15), inset 0 2px 4px rgba(0, 0, 0, 0.6)",
                      }}
                      className="w-full h-10 bg-[#050B14] rounded-xl px-3.5 py-2 text-xs font-mono flex items-center justify-between transition-all cursor-pointer hover:border-[#00F2FE] hover:shadow-[0_0_14px_rgba(0,242,254,0.25)]"
                    >
                      <span className="truncate flex items-center gap-2">
                        {(() => {
                          const currentOpt = SCOPE_OPTIONS.find((o) => o.id === newTokenScope) || SCOPE_OPTIONS[0];
                          const CurrentIcon = currentOpt.icon;
                          return (
                            <>
                              <CurrentIcon className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
                              <span className="text-white font-mono">{currentOpt.name}</span>
                            </>
                          );
                        })()}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-[#00F2FE] shrink-0 transition-transform duration-200 ${
                          isScopeOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div
                    className="p-3 rounded-xl bg-[#050B14] space-y-1 relative"
                    style={{
                      border: "1.5px solid rgba(0, 242, 254, 0.45)",
                      boxShadow: "0 0 12px rgba(0, 242, 254, 0.15), inset 0 3px 14px rgba(0, 0, 0, 0.95), inset 0 0 16px rgba(0, 0, 0, 0.85)",
                    }}
                  >
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                        Rate Limit
                      </span>
                      <span className="text-[#00F2FE] font-bold [text-shadow:0_1px_3px_rgba(0,0,0,0.95)]">
                        {newTokenRateLimit} req/min
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
                        value={newTokenRateLimit}
                        defaultValue={600}
                        startingValue={100}
                        maxValue={2000}
                        stepSize={50}
                        isStepped={true}
                        onChange={(val) => setNewTokenRateLimit(Math.round(val))}
                        className="rm-elastic w-full"
                        showThumb={true}
                        showValueIndicator={false}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <ScientistPillButton
                      onClick={() => setShowGenerateModal(false)}
                      className="scientist-pill-slate !h-9 !px-4 !py-0 !rounded-xl !gap-1.5"
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
                      title="Cancel Key Generation"
                    />
                    <ScientistPillButton
                      type="submit"
                      className="scientist-pill !h-9 !px-4 !py-0 !rounded-xl !gap-2"
                      icon={<Key className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
                      hoverIcon={<Key className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
                      label={
                        <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                          Create Key
                        </span>
                      }
                      hoverLabel={
                        <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                          Create Key
                        </span>
                      }
                      title="Generate Authorization Token"
                    />
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Custom Dropdown Portal matching Payload Standard */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isScopeOpen && (
            <motion.div
              ref={scopeDropdownRef}
              key="scope-dropdown-menu"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "fixed",
                top: scopeDropPos.top,
                left: scopeDropPos.left,
                width: scopeDropPos.width,
                zIndex: 99999,
                transformOrigin: "top left",
              }}
              className="bg-[#0F1B2F]/95 backdrop-blur-xl border border-[rgba(0,242,254,0.45)] rounded-xl p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_16px_rgba(0,242,254,0.18)] transform-gpu overflow-hidden"
            >
              <Noise patternSize={250} patternScaleX={2.5} patternScaleY={2.5} patternRefreshInterval={2} patternAlpha={10} />
              <div className="relative z-10 flex flex-col space-y-1">
                {SCOPE_OPTIONS.map((opt) => {
                  const active = newTokenScope === opt.id;
                  const IconComponent = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setNewTokenScope(opt.id);
                        setIsScopeOpen(false);
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
                    </button>
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
