"use client";

import React, { useState } from "react";
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  AlertTriangle, 
  User, 
  BadgeCheck, 
  Calendar, 
  Building2, 
  Route, 
  Copy,
  Check
} from "lucide-react";
import { DistrictInfo, StormContext } from "./types";

interface EvacuationOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  district: DistrictInfo;
  storm: StormContext;
  surgeLevel: number;
}

export function EvacuationOrderModal({
  isOpen,
  onClose,
  district,
  storm,
  surgeLevel,
}: EvacuationOrderModalProps) {
  const [officerName, setOfficerName] = useState("Collector & District Magistrate (IAS)");
  const [officerBadge, setOfficerBadge] = useState("NDMA-EOC-7842");
  const [secondaryOfficer, setSecondaryOfficer] = useState("SP Coastal Police Command (IPS)");
  const [deadline, setDeadline] = useState("T-12 Hours (18:00 IST)");
  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchCode, setDispatchCode] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDispatch = () => {
    const code = `CAP-IN-${district.state.toUpperCase().slice(0, 2)}-${district.name.toUpperCase().slice(0, 3)}-${Math.floor(1000 + Math.random() * 9000)}`;
    setDispatchCode(code);
    setIsDispatched(true);
  };

  const handleCopyCode = () => {
    if (dispatchCode) {
      navigator.clipboard.writeText(dispatchCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      id="evac-order-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050B14]/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="w-full max-w-2xl bg-[#0F1B2F]/95 border border-[#FF5E36]/50 rounded-2xl shadow-[0_0_50px_rgba(255,94,54,0.3)] flex flex-col overflow-hidden text-white font-jakarta">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#FF5E36]/30 bg-gradient-to-r from-[#FF5E36]/20 via-[#0F1B2F] to-[#050B14]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#FF5E36]/20 border border-[#FF5E36]/60 flex items-center justify-center text-[#FF5E36] animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-orbitron font-bold uppercase tracking-wider text-white">
                MANDATORY DISTRICT EVACUATION ORDER
              </h2>
              <p className="text-xs font-rajdhani text-slate-300">
                Disaster Management Act 2005 • Section 30/34 Emergency Execution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#050B14] hover:bg-[#FF5E36]/20 border border-[#1E3A5F] hover:border-[#FF5E36] text-slate-400 hover:text-[#FF5E36] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
          
          {isDispatched ? (
            /* Success Dispatch State */
            <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-[#10E7A2]/20 border-2 border-[#10E7A2] flex items-center justify-center text-[#10E7A2] shadow-[0_0_30px_rgba(16,231,162,0.4)] animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-xl font-orbitron font-extrabold text-[#10E7A2]">
                  EVACUATION ORDER DISPATCHED
                </h3>
                <p className="text-sm font-rajdhani text-slate-300 max-w-md">
                  Emergency alert broadcasts and automated siren triggers transmitted to {district.name} District Administration, NDRF 3rd Battalion, and ODRAF coastal convoys.
                </p>
              </div>

              {/* Authorization Code Box */}
              <div className="w-full max-w-md p-4 rounded-xl bg-[#050B14] border border-[#10E7A2]/40 flex items-center justify-between">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-rajdhani text-slate-400 uppercase">
                    CAP DISPATCH AUTHORIZATION TOKEN
                  </span>
                  <span className="text-base font-share-mono font-bold text-[#10E7A2]">
                    {dispatchCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-[#10E7A2]/20 hover:bg-[#10E7A2]/30 text-[#10E7A2] border border-[#10E7A2]/40 transition-all flex items-center gap-1 text-xs font-rajdhani font-bold"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "COPIED" : "COPY"}</span>
                </button>
              </div>

              <div className="text-[11px] font-share-mono text-slate-400">
                AUDIT LOG: DISPATCHED AT {new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata" })} IST • STATUS: TRANSMITTED VIA SAT-LINK
              </div>

              <button
                onClick={onClose}
                className="mt-2 px-6 py-2 rounded-lg bg-[#00F2FE]/20 hover:bg-[#00F2FE]/30 border border-[#00F2FE]/50 text-[#00F2FE] font-rajdhani font-bold text-sm transition-all"
              >
                RETURN TO DIGITAL TWIN
              </button>
            </div>
          ) : (
            /* Order Input & Verification Form */
            <>
              {/* Pre-filled Threat Briefing Box */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-[#050B14]/80 border border-[#1E3A5F]">
                <div>
                  <span className="text-[10px] font-rajdhani font-bold text-slate-400 block uppercase">
                    TARGET DISTRICT
                  </span>
                  <span className="text-xs font-jetbrains font-bold text-white">
                    {district.name}, {district.state}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-rajdhani font-bold text-slate-400 block uppercase">
                    THREAT STAGE
                  </span>
                  <span className="text-xs font-jetbrains font-bold text-[#FF5E36]">
                    STAGE 3 WARNING
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-rajdhani font-bold text-slate-400 block uppercase">
                    PEAK SURGE SEED
                  </span>
                  <span className="text-xs font-jetbrains font-bold text-[#00F2FE]">
                    +{surgeLevel.toFixed(1)}m AAT
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-rajdhani font-bold text-slate-400 block uppercase">
                    EST. EVACUEES
                  </span>
                  <span className="text-xs font-jetbrains font-bold text-amber-300">
                    ~1,42,000 citizens
                  </span>
                </div>
              </div>

              {/* Recommended Safe Shelters Strip */}
              <div className="rounded-xl p-3 bg-[#050B14]/60 border border-[#10E7A2]/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-rajdhani font-bold text-[#10E7A2] uppercase">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>RECOMMENDED DRY HIGH-GROUND SHELTERS</span>
                </div>
                <p className="text-[11px] font-jetbrains text-slate-300">
                  CS-01 Balighai Safe Haven (Cap: 2,800), CS-04 Astaranga Safe Haven (Cap: 3,200), CS-09 Pentha High Ground (Cap: 4,000), CS-12 Erasama Supercyclone Citadel (Cap: 3,500)
                </p>
              </div>

              {/* Designated Convoy Corridors */}
              <div className="rounded-xl p-3 bg-[#050B14]/60 border border-[#00F2FE]/30 flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5 text-xs font-rajdhani font-bold text-[#00F2FE] uppercase">
                  <Route className="w-3.5 h-3.5" />
                  <span>DESIGNATED EVACUATION HIGHWAYS</span>
                </div>
                <p className="text-[11px] font-jetbrains text-slate-300">
                  <strong className="text-[#10E7A2]">SH-18 Elevated Bypass Corridor (OPEN ✓)</strong> • NH-316 closed from Km 44–67 due to projected 2.1m flood cut.
                </p>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-rajdhani font-bold text-slate-300 uppercase">
                    ISSUING OFFICER
                  </label>
                  <div className="flex items-center bg-[#050B14] border border-[#1E3A5F] rounded-lg px-2.5 py-1.5 text-xs text-white">
                    <User className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="bg-transparent w-full focus:outline-none font-jetbrains text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-rajdhani font-bold text-slate-300 uppercase">
                    OFFICER BADGE ID / EOC CREDENTIAL
                  </label>
                  <div className="flex items-center bg-[#050B14] border border-[#1E3A5F] rounded-lg px-2.5 py-1.5 text-xs text-white">
                    <BadgeCheck className="w-3.5 h-3.5 text-[#00F2FE] mr-2 shrink-0" />
                    <input
                      type="text"
                      value={officerBadge}
                      onChange={(e) => setOfficerBadge(e.target.value)}
                      className="bg-transparent w-full focus:outline-none font-jetbrains text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-rajdhani font-bold text-slate-300 uppercase">
                    SECONDARY VERIFYING OFFICER
                  </label>
                  <div className="flex items-center bg-[#050B14] border border-[#1E3A5F] rounded-lg px-2.5 py-1.5 text-xs text-white">
                    <User className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={secondaryOfficer}
                      onChange={(e) => setSecondaryOfficer(e.target.value)}
                      className="bg-transparent w-full focus:outline-none font-jetbrains text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-rajdhani font-bold text-slate-300 uppercase">
                    MANDATORY EVACUATION DEADLINE
                  </label>
                  <div className="flex items-center bg-[#050B14] border border-[#1E3A5F] rounded-lg px-2.5 py-1.5 text-xs text-white">
                    <Calendar className="w-3.5 h-3.5 text-amber-400 mr-2 shrink-0" />
                    <input
                      type="text"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      className="bg-transparent w-full focus:outline-none font-jetbrains text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E3A5F]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#050B14] hover:bg-slate-800 border border-[#1E3A5F] text-slate-300 text-xs font-rajdhani font-bold transition-all"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleDispatch}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#EF4444] to-[#FF5E36] hover:from-[#dc2626] hover:to-[#ea580c] text-white text-xs font-rajdhani font-bold tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>CONFIRM & DISPATCH EVACUATION ORDER</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
