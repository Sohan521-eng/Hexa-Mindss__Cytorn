"use client";

import React, { useState } from "react";
import { 
  Languages, 
  Download, 
  AlertOctagon, 
  PhoneCall, 
  Home, 
  Zap, 
  Wheat, 
  Car, 
  Anchor
} from "lucide-react";
import Noise from "@/components/ui/Noise";
import { BulletinLanguageCode } from "./types";
import { BULLETIN_LANGUAGES, MULTI_LINGUAL_BULLETINS } from "./alertsData";
import { useGsapPill, PillButton } from "@/components/forecast/ForecastTopBar";

interface MultiLingualBulletinGeneratorProps {
  onOpenPdfModal?: (lang?: BulletinLanguageCode) => void;
}

export function MultiLingualBulletinGenerator({
  onOpenPdfModal,
}: MultiLingualBulletinGeneratorProps) {
  const [selectedLang, setSelectedLang] = useState<BulletinLanguageCode>("en");
  const officialPdfPill = useGsapPill(false);

  const activeBulletin = MULTI_LINGUAL_BULLETINS[selectedLang] || MULTI_LINGUAL_BULLETINS.en;

  const handleDownloadPdf = () => {
    if (onOpenPdfModal) {
      onOpenPdfModal(selectedLang);
      return;
    }
  };

  return (
    <div 
      id="bulletin-generator-studio"
      className="relative flex flex-col h-full rounded-xl backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] overflow-hidden"
      style={{
        background: "#0F1B2F",
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.15)",
      }}
    >
      {/* Noise Film Grain Texture — matches other pages */}
      <Noise patternSize={250} patternScaleX={1.2} patternScaleY={1.2} patternRefreshInterval={2} patternAlpha={10} />

      {/* ─── Top Header & Language Selector Portion (with Dedicated Noise Background) ─── */}
      <div className="relative overflow-hidden bg-[#0A1220] border-b border-[rgba(0,242,254,0.18)] shrink-0">
        {/* Dedicated React Bits Noise Grain Texture — exactly matching CoastalInundationMap header */}
        <Noise 
          patternSize={250} 
          patternScaleX={1.2} 
          patternScaleY={1.2} 
          patternRefreshInterval={2} 
          patternAlpha={16} 
        />

        {/* Studio Header Bar */}
        <div className="relative z-10 p-3.5 sm:p-4 border-b border-[rgba(0,242,254,0.12)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold tracking-wide flex items-center gap-2">
              <span className="heading-gradient-shadow-wrapper">
                <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                  Meteorological Bulletin Dispatch Studio
                </span>
              </span>
            </h3>
            <p className="text-xs text-[#00F2FE] font-medium font-sans [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              Standardized multi-lingual emergency bulletins for regional media & civil administration
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <PillButton
              btnRef={officialPdfPill.btnRef}
              circleRef={officialPdfPill.circleRef}
              handleEnter={officialPdfPill.handleEnter}
              handleLeave={officialPdfPill.handleLeave}
              open={false}
              onClick={handleDownloadPdf}
              icon={<Download style={{ width: 14, height: 14 }} className="text-[#00F2FE]" />}
              label="OFFICIAL PDF"
              style={{
                height: "38px",
                borderRadius: "0.75rem",
                border: "1.5px solid rgba(0,242,254,0.65)",
                background: "#081826",
                boxShadow: "0 4px 16px -2px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.2)",
                padding: "0 14px",
                fontSize: "12px",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Language Selector Pills Bar */}
        <div className="relative z-10 px-3.5 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1.5 shrink-0">
            <Languages className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#00F2FE] font-bold [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] shrink-0">
              Language:
            </span>
          </div>

          <div 
            className="relative z-10 isolate flex items-center gap-1 p-1 rounded-lg border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.8)] shrink-0"
            style={{ backgroundColor: "#0A1424" }}
          >
            {BULLETIN_LANGUAGES.map((lang) => {
              const isActive = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLang(lang.code)}
                  className={`h-7 px-2.5 rounded-md text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer shrink-0 ${
                    isActive
                      ? "border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
                      : "border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
                  }`}
                  style={{
                    backgroundColor: isActive ? "#0E2438" : "#050B14",
                  }}
                >
                  <span className="font-semibold">{lang.nativeLabel}</span>
                  <span className={`text-[10px] font-mono ${isActive ? "text-[#00F2FE]/80" : "text-[#8E9EB5]/70"}`}>
                    ({lang.label})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bulletin Preview Container */}
      <div className="relative z-10 flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* Official Header Strip */}
        <div 
          className="relative z-10 isolate p-3.5 rounded-xl border-[1.5px] border-[#00F2FE]/65 shadow-[0_8px_24px_rgba(0,0,0,0.85)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
          style={{ backgroundColor: "#0A1C2E" }}
        >
          <div>
            <div className="text-[10px] font-mono text-[#00F2FE] uppercase tracking-wider font-bold">
              INDIA METEOROLOGICAL DEPARTMENT • CYCLONE WARNING DIVISION
            </div>
            <div className="text-sm font-bold text-white font-chakra tracking-wide mt-0.5">
              {activeBulletin.bulletinNumber}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-[10px] font-mono text-slate-400">
              ISSUED DATE & TIME:
            </div>
            <div className="text-xs font-mono font-bold text-amber-300">
              {activeBulletin.issueDateTimeIst}
            </div>
          </div>
        </div>

        {/* Warning Stage Alert Callout */}
        <div 
          className="relative z-10 isolate p-3 rounded-xl border-[1.5px] border-red-500/75 shadow-[0_8px_24px_rgba(0,0,0,0.85)] flex items-center justify-between gap-3"
          style={{ backgroundColor: "#1E0A0F" }}
        >
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
            <div>
              <div className="text-xs font-chakra font-extrabold text-red-400 uppercase tracking-wider">
                {activeBulletin.warningStage}
              </div>
              <div className="text-sm font-bold text-white font-rajdhani">
                {activeBulletin.stormName} ({activeBulletin.intensityCategory})
              </div>
            </div>
          </div>
          <div className="text-right font-mono text-[11px] hidden sm:block">
            <div className="text-slate-400">Top Wind Speed</div>
            <div className="text-white font-bold">{activeBulletin.currentWindKmh} km/h</div>
          </div>
        </div>

        {/* Sectoral Threat Assessment Cards */}
        <div className="relative z-10">
          <div className="text-[11px] font-chakra font-bold text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>Expected Damage in Your Area & Public Safety Risks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-sans">
            <div 
              className="relative z-10 isolate p-3 rounded-xl border-[1.5px] border-amber-500/65 shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
              style={{ backgroundColor: "#1A1208" }}
            >
              <div className="font-bold text-amber-400 font-mono text-[11px] flex items-center gap-1.5 mb-1">
                <Home className="w-3.5 h-3.5" />
                <span>Huts & Thatched Houses</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeBulletin.damageExpectation.thatchedHouses}
              </p>
            </div>

            <div 
              className="relative z-10 isolate p-3 rounded-xl border-[1.5px] border-amber-500/65 shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
              style={{ backgroundColor: "#1A1208" }}
            >
              <div className="font-bold text-amber-400 font-mono text-[11px] flex items-center gap-1.5 mb-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Electricity & Phone Networks</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeBulletin.damageExpectation.powerLines}
              </p>
            </div>

            <div 
              className="relative z-10 isolate p-3 rounded-xl border-[1.5px] border-emerald-500/65 shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
              style={{ backgroundColor: "#081A12" }}
            >
              <div className="font-bold text-emerald-400 font-mono text-[11px] flex items-center gap-1.5 mb-1">
                <Wheat className="w-3.5 h-3.5" />
                <span>Farms, Crops & Trees</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeBulletin.damageExpectation.standingCrops}
              </p>
            </div>

            <div 
              className="relative z-10 isolate p-3 rounded-xl border-[1.5px] border-[#00F2FE]/65 shadow-[0_6px_20px_rgba(0,0,0,0.85)]"
              style={{ backgroundColor: "#0A1C2E" }}
            >
              <div className="font-bold text-[#00F2FE] font-mono text-[11px] flex items-center gap-1.5 mb-1">
                <Car className="w-3.5 h-3.5" />
                <span>Roads, Travel & Coastal Areas</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeBulletin.damageExpectation.transportRoads}
              </p>
            </div>
          </div>
        </div>

        {/* Civil Protection & Maritime Directives */}
        <div 
          className="relative z-10 isolate p-3.5 sm:p-4 rounded-xl border-[1.5px] border-[#00F2FE]/65 shadow-[0_8px_24px_rgba(0,0,0,0.85)] space-y-2 text-xs font-sans"
          style={{ backgroundColor: "#0A1C2E" }}
        >
          <div className="text-[11px] font-chakra font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5" />
            <span>Safety Rules & Emergency Action</span>
          </div>

          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <div>
              <strong className="text-white font-mono">Fishermen & Sea Safety:</strong> {activeBulletin.civilAdvisory.fishermenWarning}
            </div>
            <div>
              <strong className="text-white font-mono">Port Danger Level:</strong> {activeBulletin.civilAdvisory.portSignals}
            </div>
            <div>
              <strong className="text-red-400 font-mono">Emergency Evacuation:</strong> {activeBulletin.civilAdvisory.evacuationMandate}
            </div>
            <div className="text-emerald-400 font-mono pt-1 flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Emergency Helplines: {activeBulletin.civilAdvisory.emergencyHelpline}</span>
            </div>
          </div>
        </div>

        {/* Full Official Meteorological Paragraphs */}
        <div 
          className="relative z-10 isolate p-3.5 sm:p-4 rounded-xl border-[1.5px] border-[#00F2FE]/55 shadow-[0_8px_24px_rgba(0,0,0,0.85)] space-y-2.5"
          style={{ backgroundColor: "#0A1C2E" }}
        >
          <div className="text-[10px] font-mono text-[#00F2FE] uppercase tracking-wider font-bold">
            Official Weather Forecast & Landfall Summary
          </div>
          {activeBulletin.fullDispatchParagraphs.map((para, i) => (
            <p key={i} className="text-xs text-slate-300 font-sans leading-relaxed">
              {para}
            </p>
          ))}
          
          {/* Dispatch Certification (integrated seamlessly) */}
          <div className="pt-2.5 mt-2 border-t border-[rgba(0,242,254,0.2)] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-400">
            <span>Verified Emergency Public Advisory (IMD SOP Protocol)</span>
            <span className="text-[#00F2FE]">Approved for Public Release & Community Broadcast</span>
          </div>
        </div>

      </div>
    </div>
  );
}
