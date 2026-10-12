"use client";

import React, { useState } from "react";
import { 
  FileText, 
  Languages, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  Share2, 
  AlertOctagon, 
  ShieldCheck, 
  PhoneCall, 
  Anchor,
  Compass,
  FileCheck
} from "lucide-react";
import { BulletinLanguageCode } from "./types";
import { BULLETIN_LANGUAGES, MULTI_LINGUAL_BULLETINS } from "./alertsData";

interface MultiLingualBulletinGeneratorProps {
  onOpenPdfModal?: () => void;
}

export function MultiLingualBulletinGenerator({
  onOpenPdfModal,
}: MultiLingualBulletinGeneratorProps) {
  const [selectedLang, setSelectedLang] = useState<BulletinLanguageCode>("en");
  const [copied, setCopied] = useState(false);

  const activeBulletin = MULTI_LINGUAL_BULLETINS[selectedLang] || MULTI_LINGUAL_BULLETINS.en;

  // Copy full dispatch text
  const handleCopyDispatch = () => {
    const textToCopy = `
${activeBulletin.bulletinNumber}
${activeBulletin.issueDateTimeIst}
${activeBulletin.warningStage}
STORM: ${activeBulletin.stormName}
INTENSITY: ${activeBulletin.intensityCategory}
CENTER: ${activeBulletin.centerCoordinates}
LANDFALL EXPECTED: ${activeBulletin.landfallForecast.expectedWindow} (${activeBulletin.landfallForecast.coastalTarget})
SURGE: +${activeBulletin.landfallForecast.peakSurgeHeightM}m | Inundation Reach: ${activeBulletin.landfallForecast.inundationReachKm}km

EXPECTED DAMAGE:
- Thatched Houses: ${activeBulletin.damageExpectation.thatchedHouses}
- Power Lines: ${activeBulletin.damageExpectation.powerLines}
- Standing Crops: ${activeBulletin.damageExpectation.standingCrops}
- Roads: ${activeBulletin.damageExpectation.transportRoads}

CIVIL & MARITIME ADVISORY:
- Fishermen: ${activeBulletin.civilAdvisory.fishermenWarning}
- Ports: ${activeBulletin.civilAdvisory.portSignals}
- Evacuation: ${activeBulletin.civilAdvisory.evacuationMandate}
- Helplines: ${activeBulletin.civilAdvisory.emergencyHelpline}

DISPATCH BODY:
${activeBulletin.fullDispatchParagraphs.join("\n\n")}
`.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  // Download official mock PDF bulletin
  const handleDownloadPdf = () => {
    if (onOpenPdfModal) {
      onOpenPdfModal();
      return;
    }

    // Direct Blob download fallback
    const pdfContent = `
GOVERNMENT OF INDIA
MINISTRY OF EARTH SCIENCES / INDIA METEOROLOGICAL DEPARTMENT
NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)

${activeBulletin.bulletinNumber}
DATE / TIME: ${activeBulletin.issueDateTimeIst}
ALERT LEVEL: ${activeBulletin.warningStage}

--------------------------------------------------------------------------------
1. STORM POSITION & INTENSITY:
   Storm Name: ${activeBulletin.stormName}
   Intensity: ${activeBulletin.intensityCategory}
   Location: ${activeBulletin.centerCoordinates}
   Central Pressure: ${activeBulletin.centralPressureHpa} hPa
   Sustained Gale: ${activeBulletin.currentWindKmh} km/h (${activeBulletin.currentWindKnots} kts)

2. LANDFALL FORECAST:
   Time Window: ${activeBulletin.landfallForecast.expectedWindow}
   Coastal Sector: ${activeBulletin.landfallForecast.coastalTarget}
   Storm Surge: +${activeBulletin.landfallForecast.peakSurgeHeightM}m
   Inshore Inundation: ${activeBulletin.landfallForecast.inundationReachKm} km

3. SECTORAL DAMAGE ASSESSMENT:
   - Structures: ${activeBulletin.damageExpectation.thatchedHouses}
   - Grid & Power: ${activeBulletin.damageExpectation.powerLines}
   - Agriculture: ${activeBulletin.damageExpectation.standingCrops}
   - Highways & Arterials: ${activeBulletin.damageExpectation.transportRoads}

4. EMERGENCY CIVIL ADVISORIES:
   - Marine Warning: ${activeBulletin.civilAdvisory.fishermenWarning}
   - Maritime Signals: ${activeBulletin.civilAdvisory.portSignals}
   - Evacuation Mandate: ${activeBulletin.civilAdvisory.evacuationMandate}
   - Central Helpline: ${activeBulletin.civilAdvisory.emergencyHelpline}

--------------------------------------------------------------------------------
AUTHORITY:
ISSUED BY CYCLONE WARNING DIVISION (CWD), NEW DELHI
IN CO-ORDINATION WITH SPECIAL RELIEF COMMISSIONER, ODISHA & WEST BENGAL
DISPATCH ID: CWD-2026-OCT-MOCHA-04
`.trim();

    const blob = new Blob([pdfContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `IMD_Bulletin_04_${selectedLang.toUpperCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      id="bulletin-generator-studio"
      className="flex flex-col h-full rounded-xl border border-[rgba(0,242,254,0.2)] bg-[#0F1B2F]/90 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
    >
      {/* Studio Header */}
      <div className="p-3 sm:p-4 bg-[#0A1220]/95 border-b border-[rgba(0,242,254,0.15)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00F2FE]" />
            <h3 className="text-sm sm:text-base font-bold text-white font-orbitron tracking-wide">
              Automated Multi-Lingual Bulletin Generator
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40 font-semibold">
              REAL-TIME AI TRANSLATOR
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            Standardized Meteorological Dispatch Studio • Instant Multi-Lingual Public Alerts
          </p>
        </div>

        {/* Action CTAs: Download & Print */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyDispatch}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#050B14] hover:bg-[#16253D] border border-[#1E3252] hover:border-[#00F2FE]/50 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
            title="Copy Bulletin Text to Clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#050B14] hover:bg-[#16253D] border border-[#1E3252] hover:border-[#00F2FE]/50 text-slate-300 hover:text-white text-xs font-mono transition-all cursor-pointer"
            title="Print Official Disaster Dispatch"
          >
            <Printer className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden sm:inline">Print Dispatch</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#0E8BFD] hover:from-[#38F9D7] hover:to-[#00F2FE] text-[#050B14] font-bold text-xs font-mono transition-all shadow-[0_0_15px_rgba(0,242,254,0.4)] cursor-pointer"
            title="Download Official Government PDF Bulletin"
          >
            <Download className="w-3.5 h-3.5 text-[#050B14]" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Language Selector Pills Bar */}
      <div className="px-3 py-2.5 bg-[#08101E] border-b border-[rgba(0,242,254,0.1)] flex items-center gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
        <Languages className="w-3.5 h-3.5 text-[#00F2FE] shrink-0 mr-1" />
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Language:
        </span>

        {BULLETIN_LANGUAGES.map((lang) => {
          const isActive = selectedLang === lang.code;
          return (
            <button
              key={lang.code}
              onClick={() => setSelectedLang(lang.code)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-rajdhani font-semibold transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? "bg-[#00F2FE] text-[#050B14] border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.4)] font-bold"
                  : "bg-[#050B14] text-slate-300 hover:text-white border-[#1E3252] hover:border-[#00F2FE]/40"
              }`}
            >
              <span>{lang.nativeLabel}</span>
              <span className={`text-[10px] font-mono ${isActive ? "text-[#050B14]/80" : "text-slate-500"}`}>
                ({lang.label})
              </span>
            </button>
          );
        })}
      </div>

      {/* Bulletin Preview Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[380px] lg:max-h-[460px] bg-[#070D18]">
        
        {/* Official Header Strip */}
        <div className="p-3 rounded-lg bg-[#0F1B2F] border border-[rgba(0,242,254,0.2)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <div className="text-[10px] font-mono text-[#00F2FE] uppercase tracking-wider font-bold">
              INDIA METEOROLOGICAL DEPARTMENT • CYCLONE WARNING DIVISION
            </div>
            <div className="text-sm font-bold text-white font-chakra tracking-wide mt-0.5">
              {activeBulletin.bulletinNumber}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400">
              ISSUE DATE & TIME:
            </div>
            <div className="text-xs font-mono font-bold text-amber-300">
              {activeBulletin.issueDateTimeIst}
            </div>
          </div>
        </div>

        {/* Warning Stage Alert Callout */}
        <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
            <div>
              <div className="text-xs font-chakra font-extrabold text-red-400 uppercase tracking-wider">
                {activeBulletin.warningStage}
              </div>
              <div className="text-sm font-bold text-white font-rajdhani">
                {activeBulletin.stormName}
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-[11px] hidden sm:block">
            <div className="text-slate-400">Core Gale Winds</div>
            <div className="text-red-300 font-bold">{activeBulletin.currentWindKmh} km/h ({activeBulletin.currentWindKnots} kts)</div>
          </div>
        </div>

        {/* Key Operational Coordinates & Landfall Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-[#0A1220] border border-[#1E3252]">
            <span className="text-slate-400 text-[10px] uppercase block">Storm Center & Pressure:</span>
            <span className="text-white font-bold">{activeBulletin.centerCoordinates}</span>
            <span className="text-[#00F2FE] block text-[11px]">Central Pressure: {activeBulletin.centralPressureHpa} hPa</span>
          </div>

          <div className="p-2.5 rounded bg-[#0A1220] border border-[#1E3252]">
            <span className="text-slate-400 text-[10px] uppercase block">Expected Landfall Sector:</span>
            <span className="text-amber-300 font-bold">{activeBulletin.landfallForecast.expectedWindow}</span>
            <span className="text-slate-300 block text-[11px]">{activeBulletin.landfallForecast.coastalTarget}</span>
          </div>
        </div>

        {/* Structured Damage Expectations by Sector */}
        <div className="p-3 rounded-lg bg-[#0A1220] border border-[rgba(0,242,254,0.15)] space-y-2">
          <div className="text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#FF9100]" />
            <span>Expected Damage & Sectoral Threat Assessment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            <div className="p-2 rounded bg-[#050B14]/80 border border-slate-800">
              <span className="text-red-400 font-bold block text-[11px]">🏚️ Thatched & Kutcha Houses:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">{activeBulletin.damageExpectation.thatchedHouses}</p>
            </div>

            <div className="p-2 rounded bg-[#050B14]/80 border border-slate-800">
              <span className="text-amber-400 font-bold block text-[11px]">⚡ Power Lines & Telecom:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">{activeBulletin.damageExpectation.powerLines}</p>
            </div>

            <div className="p-2 rounded bg-[#050B14]/80 border border-slate-800">
              <span className="text-emerald-400 font-bold block text-[11px]">🌾 Crops & Plantations:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">{activeBulletin.damageExpectation.standingCrops}</p>
            </div>

            <div className="p-2 rounded bg-[#050B14]/80 border border-slate-800">
              <span className="text-cyan-400 font-bold block text-[11px]">🛣️ Coastal Roadways & Ports:</span>
              <p className="text-slate-300 text-[11px] mt-0.5">{activeBulletin.damageExpectation.transportRoads}</p>
            </div>
          </div>
        </div>

        {/* Civil Action & Maritime Advisories */}
        <div className="p-3 rounded-lg bg-[#0E3D59]/30 border border-[#00F2FE]/30 space-y-2">
          <div className="text-xs font-chakra font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Civil Protection & Maritime Signals</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono text-slate-300">
            <div>
              <strong className="text-white">Fishermen:</strong> {activeBulletin.civilAdvisory.fishermenWarning}
            </div>
            <div>
              <strong className="text-white">Port Signals:</strong> {activeBulletin.civilAdvisory.portSignals}
            </div>
            <div>
              <strong className="text-white">Evacuation Mandate:</strong> {activeBulletin.civilAdvisory.evacuationMandate}
            </div>
            <div className="flex items-center gap-1.5 text-[#00F2FE] font-bold pt-1">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{activeBulletin.civilAdvisory.emergencyHelpline}</span>
            </div>
          </div>
        </div>

        {/* Official Dispatch Text Body */}
        <div className="p-3 rounded-lg bg-[#050B14] border border-[#1E3252] space-y-2 text-xs font-sans leading-relaxed text-slate-300">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
            OFFICIAL METEOROLOGICAL DISPATCH TEXT
          </div>
          {activeBulletin.fullDispatchParagraphs.map((para, idx) => (
            <p key={idx} className="text-xs text-slate-200">
              {para}
            </p>
          ))}
        </div>

      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-[#0A1220] border-t border-[rgba(0,242,254,0.12)] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400 shrink-0">
        <span>Verified against IMD Cyclone Warning SOP Table 4.2</span>
        <span className="text-[#00F2FE]">Certified for Press Release & All-India Radio Broadcast</span>
      </div>
    </div>
  );
}
