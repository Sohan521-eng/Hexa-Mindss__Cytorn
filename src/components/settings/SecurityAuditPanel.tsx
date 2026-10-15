"use client";

import React, { useState, useRef } from "react";
import { 
  ShieldCheck, 
  Download, 
  Upload, 
  CheckCircle2, 
  KeyRound 
} from "lucide-react";
import { AuditLogEntry, SystemSettingsState } from "./types";
import Noise from "@/components/ui/Noise";
import { ScientistPillButton } from "@/components/ui/ScientistPillButton";

interface SecurityAuditPanelProps {
  auditLogs: AuditLogEntry[];
  currentState: SystemSettingsState;
  onImportState: (newState: SystemSettingsState) => void;
  onNotify: (text: string, type: "success" | "warning" | "error") => void;
}

export const SecurityAuditPanel: React.FC<SecurityAuditPanelProps> = ({
  auditLogs,
  currentState,
  onImportState,
  onNotify,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredLogs = auditLogs.filter((entry) => {
    const matchesCategory =
      activeCategoryFilter === "all" || entry.category.toLowerCase() === activeCategoryFilter.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.ipAddress.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const handleExportConfig = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(currentState, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `cyclo_ai_settings_${new Date().toISOString().replace(/[:.]/g, "-")}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onNotify("System configuration archive exported as cyclo_ai_settings.json.", "success");
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.mosdac || !parsed.noaaS3 || !parsed.checkpoints) {
          throw new Error("Invalid CYCLO-AI configuration schema");
        }
        onImportState(parsed);
        onNotify("System configuration successfully imported.", "success");
      } catch (err) {
        onNotify("Failed to import: Invalid JSON schema.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <section id="security" className="scroll-mt-20 space-y-4">
      {/* Streamlined Section Title */}
      <div className="flex items-center justify-between gap-2 border-b border-[rgba(0,242,254,0.25)] pb-2.5">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold tracking-wide flex items-center">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                Security, Audit Logs &amp; Config Backups
              </span>
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFileChange}
            accept=".json"
            className="hidden"
          />
          <ScientistPillButton
            onClick={() => fileInputRef.current?.click()}
            className="scientist-pill !h-9 !px-3.5 !py-0 !rounded-xl !gap-2"
            icon={<Upload className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
            hoverIcon={<Upload className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
            label={
              <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Import JSON
              </span>
            }
            hoverLabel={
              <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                Import JSON
              </span>
            }
            title="Import configuration JSON file"
          />

          <ScientistPillButton
            onClick={handleExportConfig}
            className="scientist-pill-cyan-solid !h-9 !px-3.5 !py-0 !rounded-xl !gap-2"
            icon={<Download className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
            hoverIcon={<Download className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
            label={
              <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                Export Config
              </span>
            }
            hoverLabel={
              <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#00F2FE]">
                Export Config
              </span>
            }
            title="Export operational parameters as JSON"
          />
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
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
          <div className="absolute top-0 right-1/4 w-96 h-28 bg-[#00F2FE]/8 blur-3xl pointer-events-none" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)] overflow-x-auto no-scrollbar">
            {["all", "model", "satellite", "webhook", "api"].map((cat) => {
              const isActive = activeCategoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`group flex items-center justify-center px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all duration-200 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)] font-bold"
                      : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                  }`}
                >
                  <span className="truncate">{cat}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="bg-[#050B14]/80 rounded-xl px-3.5 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] w-full sm:w-56 transition-all"
            style={{
              border: "1.5px solid rgba(0, 242, 254, 0.45)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(0, 242, 254, 0.15), inset 0 2px 4px rgba(0,0,0,0.6)",
            }}
          />
        </div>

        {/* Table */}
        <div
          className="relative z-10 overflow-x-auto no-scrollbar rounded-xl bg-[#050B14]/30"
          style={{
            border: "1.5px solid rgba(0, 242, 254, 0.45)",
            boxShadow: "0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(0, 242, 254, 0.15)",
          }}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#050B14]/70 text-[11px] font-mono text-slate-400 border-b border-[rgba(0,242,254,0.25)] uppercase tracking-wider">
                <th className="py-2 px-3">Timestamp (UTC)</th>
                <th className="py-2 px-3">Operator</th>
                <th className="py-2 px-3">Action Description</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">IP Address</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#050B14]/50 transition-colors">
                  <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-2.5 px-3 font-semibold text-white whitespace-nowrap">
                    {log.operator}
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 min-w-[260px]">{log.action}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 uppercase">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#00F2FE]">{log.ipAddress}</td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] text-[#00E676] font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>OK</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
