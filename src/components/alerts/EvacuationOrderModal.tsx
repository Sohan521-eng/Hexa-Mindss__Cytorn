"use client";

import React, { useState } from "react";
import { 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  Truck, 
  Users, 
  Building2, 
  AlertTriangle, 
  FileCheck, 
  MapPin, 
  Clock,
  Send,
  Lock
} from "lucide-react";
import { DistrictVulnerability, EvacuationOrderData } from "./types";
import { DEFAULT_EVACUATION_ORDER } from "./alertsData";

interface EvacuationOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  district: DistrictVulnerability | null;
}

export function EvacuationOrderModal({
  isOpen,
  onClose,
  district,
}: EvacuationOrderModalProps) {
  const [curfewActive, setCurfewActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !district) return null;

  // Synthesize order details based on selected district
  const orderData: EvacuationOrderData = {
    ...DEFAULT_EVACUATION_ORDER,
    districtId: district.id,
    districtName: district.name,
    stateName: district.state,
    priorityScore: district.evacuationPriority,
    totalPopulationToEvacuate: district.populationAtRisk,
    designatedSheltersCount: district.sheltersTotal,
  };

  const handleIssueOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B14]/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="w-full max-w-2xl rounded-2xl bg-[#0F1B2F] border border-red-500/50 shadow-[0_20px_60px_rgba(213,0,0,0.4)] overflow-hidden text-xs text-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Top Ribbon */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-red-950 via-[#0A1220] to-red-950 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(213,0,0,0.5)]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-red-400 font-extrabold uppercase tracking-wider">
                GOVERNMENT OF {district.state.toUpperCase()} • EMERGENCY DISASTER POWERS ACT
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white font-orbitron">
                Mandatory Evacuation & Convoy Dispatch Order
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Target District Header Banner */}
          <div className="p-3 rounded-xl bg-[#050B14] border border-[#1E3252] flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-mono text-slate-400 uppercase">Target Jurisdiction:</div>
              <div className="text-base font-bold text-white font-rajdhani">
                {district.name} District ({district.state})
              </div>
              <div className="text-[11px] font-mono text-red-400 font-semibold">
                Priority: 🔴 {district.evacuationPriority} (Shoreline Exposure: {district.distanceToCoastKm} km)
              </div>
            </div>

            <div className="text-right font-mono text-xs">
              <div className="text-slate-400 text-[10px]">Order Reference ID:</div>
              <div className="text-[#00F2FE] font-bold">{orderData.orderId}</div>
              <div className="text-slate-400 text-[10px]">Issued at: {orderData.timestampIst}</div>
            </div>
          </div>

          {/* Evacuation Zones Breakdown */}
          <div className="space-y-2">
            <div className="text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-400" />
              <span>Evacuation Zones & Targeted Civilian Density</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/40">
                <span className="text-red-400 font-bold block text-[11px]">ZONE A (0 - 2 km)</span>
                <span className="text-white text-xs block font-bold mt-1">100% Mandatory Evac</span>
                <span className="text-slate-400 text-[10px] block">Beachfront hamlets & thatch huts</span>
                <span className="text-red-300 text-[10px] block mt-1">Est. Pop: 185,000</span>
              </div>

              <div className="p-2.5 rounded-lg bg-orange-950/40 border border-orange-500/40">
                <span className="text-orange-400 font-bold block text-[11px]">ZONE B (2 - 5 km)</span>
                <span className="text-white text-xs block font-bold mt-1">High Priority Move</span>
                <span className="text-slate-400 text-[10px] block">Low-lying agrarian tracts</span>
                <span className="text-orange-300 text-[10px] block mt-1">Est. Pop: 160,000</span>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/30">
                <span className="text-amber-400 font-bold block text-[11px]">ZONE C (5 - 10 km)</span>
                <span className="text-white text-xs block font-bold mt-1">Inland Buffer Standby</span>
                <span className="text-slate-400 text-[10px] block">Reinforced masonry structures</span>
                <span className="text-amber-300 text-[10px] block mt-1">Est. Pop: 83,000</span>
              </div>
            </div>
          </div>

          {/* Deployed Emergency Resources */}
          <div className="p-3 rounded-xl bg-[#0A1220] border border-[#1E3252] space-y-2.5">
            <div className="text-xs font-chakra font-bold text-[#00F2FE] uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>Allocated Response Convoys & Medical Triage</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-[#050B14] border border-slate-800">
                <div className="text-sm font-bold text-white">{orderData.ndrfBattalionsDeployed}</div>
                <div className="text-[10px] text-slate-400">NDRF Battalions</div>
              </div>
              <div className="p-2 rounded bg-[#050B14] border border-slate-800">
                <div className="text-sm font-bold text-white">{orderData.odrafTeamsDeployed}</div>
                <div className="text-[10px] text-slate-400">ODRAF / SDRF Units</div>
              </div>
              <div className="p-2 rounded bg-[#050B14] border border-slate-800">
                <div className="text-sm font-bold text-white">{orderData.transportBusesAssigned}</div>
                <div className="text-[10px] text-slate-400">State Transport Buses</div>
              </div>
              <div className="p-2 rounded bg-[#050B14] border border-slate-800">
                <div className="text-sm font-bold text-white">{orderData.medicalTriageTeams}</div>
                <div className="text-[10px] text-slate-400">Mobile Triage Beds</div>
              </div>
            </div>
          </div>

          {/* Curfew / Restriction Declaration */}
          <div className="p-3 rounded-xl bg-[#050B14] border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <div className="font-bold text-white font-rajdhani text-sm">
                Enforce Section 144 / Coastal Travel Curfew
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Prohibits non-authorized private vehicles on NH-316 & coastal escape roads after 14:00 IST
              </div>
            </div>

            <button
              onClick={() => setCurfewActive(!curfewActive)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                curfewActive 
                  ? "bg-red-600 text-white shadow-[0_0_10px_rgba(213,0,0,0.5)]" 
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {curfewActive ? "CURFEW ACTIVE" : "OPTIONAL"}
            </button>
          </div>

          {/* Assembly Centers List */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Designated Convoy Assembly Terminals:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[11px]">
              {orderData.assemblyPoints.map((pt, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="truncate">{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signatory Authorization */}
          <div className="p-2.5 rounded-lg bg-[#0E3D59]/30 border border-[#00F2FE]/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00F2FE]" />
              <div>
                <span className="text-slate-400 text-[10px] block">Authorized Signatory:</span>
                <span className="text-white font-bold">{orderData.authorizedOfficer}</span>
              </div>
            </div>
            <span className="text-emerald-400 text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/40">
              Cryptographically Verified
            </span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-3 sm:p-4 bg-[#0A1220] border-t border-[rgba(0,242,254,0.15)] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg bg-[#050B14] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleIssueOrder}
            disabled={isSubmitting || isSuccess}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-xs font-extrabold tracking-wider transition-all cursor-pointer shadow-lg ${
              isSuccess
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_20px_rgba(213,0,0,0.5)] border border-red-400"
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>ORDER DISPATCHED TO STATE POLICE & SDRF</span>
              </>
            ) : isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>SIGNING WITH NDMA PKI TOKEN...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>SIGN & ISSUE MANDATORY EVACUATION ORDER</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
