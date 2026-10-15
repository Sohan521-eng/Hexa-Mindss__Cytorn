"use client";

import React, { useRef, useEffect } from "react";
import { 
  FileText, 
  X, 
  Download, 
  ShieldCheck, 
  Award,
  Calendar,
  Building,
  CheckCircle2
} from "lucide-react";
import { jsPDF } from "jspdf";
import { MultiLingualBulletin } from "./types";
import Noise from "@/components/ui/Noise";
import { ScientistPillButton } from "@/components/ui/ScientistPillButton";

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
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - margin * 2;
      let y = 15;

      const checkPageBreak = (neededHeight: number) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          y = 15;
        }
      };

      // Header: Government of India
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.text("GOVERNMENT OF INDIA • MINISTRY OF EARTH SCIENCES", pageWidth / 2, y, { align: "center" });
      y += 6;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text("INDIA METEOROLOGICAL DEPARTMENT", pageWidth / 2, y, { align: "center" });
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text("CYCLONE WARNING DIVISION, MAUSAM BHAWAN, LODHI ROAD, NEW DELHI - 110003", pageWidth / 2, y, { align: "center" });
      y += 4;
      doc.text("NATIONAL DISASTER EARLY WARNING DISPATCH • CWD / EOC / 2026 / 04", pageWidth / 2, y, { align: "center" });
      y += 4;

      // Divider
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.6);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;

      // Bulletin Number & Issue Info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.text(bulletin.bulletinNumber, margin, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text("Date & Time of Issue:", pageWidth - margin, y, { align: "right" });
      y += 5;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(185, 28, 28);
      doc.text(bulletin.warningStage, margin, y);

      doc.setTextColor(15, 23, 42);
      doc.text(bulletin.issueDateTimeIst, pageWidth - margin, y, { align: "right" });
      y += 7;

      // Subject Box
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(margin, y, contentWidth, 14, 2, 2, "FD");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`SUBJECT: ${bulletin.stormName}`, margin + 4, y + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`Classification: ${bulletin.intensityCategory}`, margin + 4, y + 10.5);
      y += 18;

      // Section 1: Track Telemetry
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("1. Location & Central Pressure:", margin, y);
      doc.setFont("helvetica", "normal");
      const locText = `The storm center is currently positioned at ${bulletin.centerCoordinates} with an estimated central pressure of ${bulletin.centralPressureHpa} hPa. Maximum sustained gale wind speed is ${bulletin.currentWindKmh} km/h (${bulletin.currentWindKnots} knots).`;
      const locLines = doc.splitTextToSize(locText, contentWidth);
      doc.text(locLines, margin, y + 4.5);
      y += 5.5 + locLines.length * 4;

      checkPageBreak(25);

      // Section 2: Landfall Expectations
      doc.setFont("helvetica", "bold");
      doc.text("2. Landfall Expectations:", margin, y);
      doc.setFont("helvetica", "normal");
      const landfallText = `Projected to cross ${bulletin.landfallForecast.coastalTarget} during operational window of ${bulletin.landfallForecast.expectedWindow}. Peak storm surge of +${bulletin.landfallForecast.peakSurgeHeightM} meters above astronomical tide is expected to reach ${bulletin.landfallForecast.inundationReachKm} km inland.`;
      const landfallLines = doc.splitTextToSize(landfallText, contentWidth);
      doc.text(landfallLines, margin, y + 4.5);
      y += 5.5 + landfallLines.length * 4;

      checkPageBreak(35);

      // Section 3: Damage Expected Box
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text("3. DAMAGE EXPECTED:", margin, y);
      y += 4.5;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      const damageTextArr = [
        `• Thatched Houses: ${bulletin.damageExpectation.thatchedHouses}`,
        `• Power Infrastructure: ${bulletin.damageExpectation.powerLines}`,
        `• Agricultural Crops: ${bulletin.damageExpectation.standingCrops}`,
        `• Arterials & Roads: ${bulletin.damageExpectation.transportRoads}`
      ];
      damageTextArr.forEach((dt) => {
        const dtLines = doc.splitTextToSize(dt, contentWidth - 4);
        checkPageBreak(dtLines.length * 3.5);
        doc.text(dtLines, margin + 2, y);
        y += dtLines.length * 3.8;
      });
      y += 3;

      checkPageBreak(35);

      // Section 4: Civil Advisory Box
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(185, 28, 28);
      doc.text("4. ACTION SUGGESTED & CIVIL ADVISORY:", margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      const advArr = [
        `• Evacuation: ${bulletin.civilAdvisory.evacuationMandate}`,
        `• Fishermen Warning: ${bulletin.civilAdvisory.fishermenWarning}`,
        `• Port Signals: ${bulletin.civilAdvisory.portSignals}`,
        `• Emergency Helplines: ${bulletin.civilAdvisory.emergencyHelpline}`
      ];
      advArr.forEach((adv) => {
        const advLines = doc.splitTextToSize(adv, contentWidth - 4);
        checkPageBreak(advLines.length * 3.5);
        doc.text(advLines, margin + 2, y);
        y += advLines.length * 3.8;
      });
      y += 3;

      checkPageBreak(30);

      // Section 5: Meteorological Narrative
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.text("5. OFFICIAL DISPATCH NARRATIVE:", margin, y);
      y += 4.5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      bulletin.fullDispatchParagraphs.forEach((para) => {
        const pLines = doc.splitTextToSize(para, contentWidth);
        checkPageBreak(pLines.length * 3.8 + 2);
        doc.text(pLines, margin, y);
        y += pLines.length * 3.8 + 2;
      });
      y += 5;

      checkPageBreak(30);

      // Signatory Box
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text("Copy to: Cabinet Secretary, New Delhi | Chief Secretary, Odisha & West Bengal", margin, y);
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text("(Dr. Mrutyunjay Mohapatra)", pageWidth - margin, y, { align: "right" });
      y += 4;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("Director General of Meteorology, IMD", pageWidth - margin, y, { align: "right" });

      doc.save(`IMD_Official_Bulletin_04.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-3 sm:p-6 pt-20 sm:pt-24 pb-4 sm:pb-6 bg-[#050B14]/90 backdrop-blur-md animate-in fade-in overflow-hidden">
      {/* Background Noise overlay for backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <Noise patternSize={250} patternScaleX={1} patternScaleY={1} patternRefreshInterval={3} patternAlpha={12} />
      </div>

      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-[#0F1B2F] border border-[#00F2FE]/40 shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden text-xs text-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[calc(100vh-6.5rem)] sm:max-h-[calc(100vh-7rem)] z-10"
        role="dialog"
        aria-modal="true"
      >
        {/* Top Header */}
        <div className="relative z-10 p-3.5 sm:p-4 bg-[#0A1220]/90 backdrop-blur-md border-b border-[rgba(0,242,254,0.15)] flex items-center justify-between shrink-0 overflow-hidden">
          {/* Header Noise Overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-75">
            <Noise patternSize={250} patternScaleX={1} patternScaleY={1} patternRefreshInterval={3} patternAlpha={15} />
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00F2FE]" />
            <h2 className="text-sm sm:text-base font-bold text-[#00F2FE] font-orbitron tracking-wide [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
              Official Meteorological Bulletin Document
            </h2>
          </div>

          <div className="relative z-10 flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview Surface (Simulating Official Letterhead) */}
        <div 
          ref={contentRef}
          className="relative z-10 flex-1 p-4 sm:p-6 overflow-y-auto bg-slate-100 text-slate-900 font-sans selection:bg-cyan-200 selection:text-slate-900 scroll-smooth"
        >
          
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
        <div className="relative z-10 p-3.5 sm:p-4 bg-[#0A1220]/90 backdrop-blur-md border-t border-[rgba(0,242,254,0.15)] flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 overflow-hidden">
          {/* Footer Noise Overlay */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-75">
            <Noise patternSize={250} patternScaleX={1} patternScaleY={1} patternRefreshInterval={3} patternAlpha={15} />
          </div>

          <div className="relative z-10">
            <ScientistPillButton
              onClick={onClose}
              icon={<X className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
              hoverIcon={<X className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
              label="CLOSE PREVIEW"
              title="Close Bulletin Preview"
            />
          </div>

          <div className="relative z-10">
            <ScientistPillButton
              onClick={handleDownload}
              icon={<Download className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
              hoverIcon={<Download className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
              label={
                <>
                  <span className="hidden sm:inline">DOWNLOAD OFFICIAL IMD_BULLETIN_04.PDF</span>
                  <span className="sm:hidden">DOWNLOAD OFFICIAL PDF</span>
                </>
              }
              title="Download Official IMD Bulletin PDF"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
