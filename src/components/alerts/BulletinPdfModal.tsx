"use client";

import React from "react";
import { 
  FileText, 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  Award,
  Calendar,
  Building,
  CheckCircle2
} from "lucide-react";
import { MultiLingualBulletin } from "./types";

interface BulletinPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  bulletin: MultiLingualBulletin;
}

export function BulletinPdfModal({
  isOpen,
  onClose,
  bulletin,
}: BulletinPdfModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const textContent = `
================================================================================
GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES
INDIA METEOROLOGICAL DEPARTMENT (IMD) / NATIONAL DISASTER MANAGEMENT AUTHORITY
================================================================================

${bulletin.bulletinNumber}
DATE / TIME: ${bulletin.issueDateTimeIst}
ALERT STATUS: ${bulletin.warningStage}

1. CYCLONE IDENTIFICATION & TRACK TELEMETRY
   Name: ${bulletin.stormName}
   Intensity: ${bulletin.intensityCategory}
   Center Coordinates: ${bulletin.centerCoordinates}
   Central Pressure: ${bulletin.centralPressureHpa} hPa
   Sustained Gale Winds: ${bulletin.currentWindKmh} km/h (${bulletin.currentWindKnots} knots)

2. LANDFALL WINDOW & STORM SURGE HYDRODYNAMICS
   Estimated Window: ${bulletin.landfallForecast.expectedWindow}
   Target Coast: ${bulletin.landfallForecast.coastalTarget}
   Peak Surge Height: +${bulletin.landfallForecast.peakSurgeHeightM} meters above astronomical tide
   Saline Reach: ${bulletin.landfallForecast.inundationReachKm} km inshore

3. SECTORAL DAMAGE THREAT ASSESSMENT
   * Structures: ${bulletin.damageExpectation.thatchedHouses}
   * Power & Telecom: ${bulletin.damageExpectation.powerLines}
   * Agricultural: ${bulletin.damageExpectation.standingCrops}
   * Transport & Highways: ${bulletin.damageExpectation.transportRoads}

4. MANDATORY CIVIL & MARITIME ADVISORIES
   * Fishermen: ${bulletin.civilAdvisory.fishermenWarning}
   * Port Signals: ${bulletin.civilAdvisory.portSignals}
   * Evacuation: ${bulletin.civilAdvisory.evacuationMandate}
   * Helplines: ${bulletin.civilAdvisory.emergencyHelpline}

5. OFFICIAL DISPATCH NARRATIVE
${bulletin.fullDispatchParagraphs.join("\n\n")}

================================================================================
AUTHORIZED BY:
DR. M. MOHAPATRA, DIRECTOR GENERAL OF METEOROLOGY (IMD)
IN CONCURRENCE WITH NDMA EMERGENCY OPERATIONS CENTRE, NEW DELHI
DISPATCH ID: NDMA-IMD-2026-OCT-04
================================================================================
`.trim();

    const blob = new Blob([textContent], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `IMD_Official_Bulletin_04.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B14]/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-3xl rounded-2xl bg-[#0F1B2F] border border-[#00F2FE]/40 shadow-[0_20px_70px_rgba(0,242,254,0.3)] overflow-hidden text-xs text-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-[#0A1220] border-b border-[rgba(0,242,254,0.15)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00F2FE]" />
            <h2 className="text-sm sm:text-base font-bold text-white font-orbitron">
              Official Meteorological Bulletin Document
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/40">
              GOVT SEALED
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-[#050B14] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4 text-[#00F2FE]" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Surface (Simulating Official Letterhead) */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100 text-slate-900 font-sans selection:bg-cyan-200 selection:text-slate-900">
          
          {/* Government of India Emblem & Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
            <div className="text-[11px] font-serif uppercase tracking-widest text-slate-700 font-bold">
              GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES
            </div>
            <div className="text-base sm:text-lg font-serif font-black tracking-wide text-slate-950 uppercase mt-0.5">
              INDIA METEOROLOGICAL DEPARTMENT
            </div>
            <div className="text-xs font-serif text-slate-700 font-semibold">
              CYCLONE WARNING DIVISION, MAUSAM BHAWAN, LODHI ROAD, NEW DELHI - 110003
            </div>
            <div className="text-[10px] font-mono text-slate-600 mt-1">
              NATIONAL DISASTER EARLY WARNING DISPATCH • CWD / EOC / 2026 / 04
            </div>
          </div>

          {/* Bulletin Title & Issue Info */}
          <div className="flex justify-between items-center text-xs font-mono border-b border-slate-300 pb-2 mb-3">
            <div>
              <strong className="text-slate-950 font-bold block">{bulletin.bulletinNumber}</strong>
              <span className="text-red-700 font-bold">{bulletin.warningStage}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-600 block">Date & Time of Issue:</span>
              <strong className="text-slate-950">{bulletin.issueDateTimeIst}</strong>
            </div>
          </div>

          {/* Storm Particulars */}
          <div className="space-y-3 text-xs leading-relaxed">
            <div className="p-2.5 rounded bg-slate-200/80 border border-slate-300">
              <div className="font-bold text-slate-950 text-sm">
                SUBJECT: {bulletin.stormName}
              </div>
              <div className="font-mono text-slate-700 text-xs mt-0.5">
                Classification: {bulletin.intensityCategory}
              </div>
            </div>

            <p>
              <strong>1. Location & Central Pressure:</strong> The storm center is currently positioned at <strong>{bulletin.centerCoordinates}</strong> with an estimated central pressure of <strong>{bulletin.centralPressureHpa} hPa</strong>. Maximum sustained gale wind speed is <strong>{bulletin.currentWindKmh} km/h ({bulletin.currentWindKnots} knots)</strong>.
            </p>

            <p>
              <strong>2. Landfall Expectations:</strong> Projected to cross <strong>{bulletin.landfallForecast.coastalTarget}</strong> during the operational window of <strong>{bulletin.landfallForecast.expectedWindow}</strong>. Peak storm surge of <strong>+{bulletin.landfallForecast.peakSurgeHeightM} meters</strong> above astronomical tide is expected to reach <strong>{bulletin.landfallForecast.inundationReachKm} km</strong> inland.
            </p>

            <div className="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-1">
              <strong className="block text-slate-950 font-bold uppercase text-[11px]">
                3. Damage Expected:
              </strong>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-800">
                <li><strong>Thatched Houses:</strong> {bulletin.damageExpectation.thatchedHouses}</li>
                <li><strong>Power Infrastructure:</strong> {bulletin.damageExpectation.powerLines}</li>
                <li><strong>Agricultural Crops:</strong> {bulletin.damageExpectation.standingCrops}</li>
                <li><strong>Arterials & Roads:</strong> {bulletin.damageExpectation.transportRoads}</li>
              </ul>
            </div>

            <div className="border border-red-200 rounded p-2.5 bg-red-50 text-red-950 space-y-1">
              <strong className="block font-bold uppercase text-[11px]">
                4. Action Suggested & Civil Advisory:
              </strong>
              <p className="text-[11px]">{bulletin.civilAdvisory.evacuationMandate}</p>
              <p className="text-[11px]"><strong>Fishermen Warning:</strong> {bulletin.civilAdvisory.fishermenWarning}</p>
              <p className="text-[11px]"><strong>Emergency Numbers:</strong> {bulletin.civilAdvisory.emergencyHelpline}</p>
            </div>

            <div className="space-y-1 text-slate-800 text-xs pt-1">
              {bulletin.fullDispatchParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {/* Official Signatory Box */}
            <div className="pt-6 mt-4 border-t border-slate-300 flex justify-between items-end text-xs">
              <div className="text-[10px] text-slate-600 font-mono">
                Copy to: Cabinet Secretary, New Delhi<br />
                Chief Secretary, Odisha & West Bengal<br />
                Armed Forces Emergency Operations Directorate
              </div>

              <div className="text-right">
                <div className="font-serif font-bold text-slate-950">
                  (Dr. Mrutyunjay Mohapatra)
                </div>
                <div className="text-[11px] text-slate-700">
                  Director General of Meteorology, IMD
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Signatory Auth ID: IMD-DGM-01
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3.5 sm:p-4 bg-[#0A1220] border-t border-[rgba(0,242,254,0.15)] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg bg-[#050B14] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            Close Preview
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-[#00F2FE] to-[#0E8BFD] hover:from-[#38F9D7] hover:to-[#00F2FE] text-[#050B14] font-mono text-xs font-extrabold tracking-wider transition-all shadow-[0_0_20px_rgba(0,242,254,0.4)] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#050B14]" />
            <span>DOWNLOAD OFFICIAL IMD_BULLETIN_04.PDF</span>
          </button>
        </div>

      </div>
    </div>
  );
}
