"use client";

import React, { useState } from "react";
import { 
  Lock, 
  X, 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  KeyRound, 
  Send,
  Zap,
  TowerControl,
  Users
} from "lucide-react";

import Noise from "@/components/ui/Noise";

interface Broadcast2FaModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeStormName?: string;
}

export function Broadcast2FaModal({
  isOpen,
  onClose,
  activeStormName = "Cyclone MOCHA",
}: Broadcast2FaModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [selectedClusters, setSelectedClusters] = useState({
    puri: true,
    paradip: true,
    kendrapara: true,
    digha: true,
  });
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleAutofillCode = () => {
    setOtp(["7", "2", "9", "4", "0", "1"]);
    setErrorMsg("");
  };

  const handleTransmitBroadcast = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setErrorMsg("Please enter the complete 6-digit incident commander 2FA authentication code.");
      return;
    }

    setIsTransmitting(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsTransmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#050B14]/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-[#0F1B2F] border border-red-500/60 shadow-[0_20px_70px_rgba(213,0,0,0.5)] overflow-hidden text-xs text-slate-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Noise overlay */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl z-0 opacity-75">
          <Noise patternSize={250} patternScaleX={1} patternScaleY={1} patternRefreshInterval={3} patternAlpha={10} />
        </div>
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-red-950 via-[#0A1220] to-red-950 border-b border-red-500/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white shrink-0 shadow-[0_0_12px_rgba(213,0,0,0.5)] animate-pulse">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-red-400 font-extrabold uppercase tracking-wider">
                NDMA / DOT • CRITICAL GATEWAY SECURITY
              </div>
              <h2 className="text-sm sm:text-base font-bold text-white font-orbitron">
                2FA Emergency Cell Broadcast Gate
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
          
          {/* Warning Banner Against False Alarms */}
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/50 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-bold text-red-300 font-rajdhani text-xs uppercase tracking-wide">
                WARNING: High-Priority Public Warning Mechanism
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                This broadcast bypasses silent mode on all mobile handsets within the selected telecom cell sectors and emits an audible 853/960 Hz emergency siren. False alarms carry statutory liability under Section 54 of the Disaster Management Act.
              </p>
            </div>
          </div>

          {/* Geo-Fenced Cell Tower Cluster Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>Select Target Cell Tower Clusters within R_max Danger Zone</span>
              </span>
              <span className="text-[10px] font-mono text-[#00F2FE]">
                ~1.48M Mobile Handsets
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#050B14] border border-[#1E3252] cursor-pointer hover:border-[#00F2FE]/40">
                <input
                  type="checkbox"
                  checked={selectedClusters.puri}
                  onChange={(e) => setSelectedClusters({ ...selectedClusters, puri: e.target.checked })}
                  className="accent-[#00F2FE] w-3.5 h-3.5"
                />
                <div className="min-w-0">
                  <span className="text-white font-bold block">Puri Coastal Sector</span>
                  <span className="text-[10px] text-slate-400">48 BTS Towers • 480k Users</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#050B14] border border-[#1E3252] cursor-pointer hover:border-[#00F2FE]/40">
                <input
                  type="checkbox"
                  checked={selectedClusters.paradip}
                  onChange={(e) => setSelectedClusters({ ...selectedClusters, paradip: e.target.checked })}
                  className="accent-[#00F2FE] w-3.5 h-3.5"
                />
                <div className="min-w-0">
                  <span className="text-white font-bold block">Paradip Port Sector</span>
                  <span className="text-[10px] text-slate-400">36 BTS Towers • 390k Users</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#050B14] border border-[#1E3252] cursor-pointer hover:border-[#00F2FE]/40">
                <input
                  type="checkbox"
                  checked={selectedClusters.kendrapara}
                  onChange={(e) => setSelectedClusters({ ...selectedClusters, kendrapara: e.target.checked })}
                  className="accent-[#00F2FE] w-3.5 h-3.5"
                />
                <div className="min-w-0">
                  <span className="text-white font-bold block">Kendrapara Estuary</span>
                  <span className="text-[10px] text-slate-400">28 BTS Towers • 310k Users</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg bg-[#050B14] border border-[#1E3252] cursor-pointer hover:border-[#00F2FE]/40">
                <input
                  type="checkbox"
                  checked={selectedClusters.digha}
                  onChange={(e) => setSelectedClusters({ ...selectedClusters, digha: e.target.checked })}
                  className="accent-[#00F2FE] w-3.5 h-3.5"
                />
                <div className="min-w-0">
                  <span className="text-white font-bold block">Digha / Medinipur (WB)</span>
                  <span className="text-[10px] text-slate-400">32 BTS Towers • 300k Users</span>
                </div>
              </label>
            </div>
          </div>

          {/* 6-Digit 2FA Code Input */}
          <div className="p-3.5 rounded-xl bg-[#050B14] border border-[#1E3252] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-chakra font-bold text-slate-300 uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>Enter Commander 2FA Security Token</span>
              </div>
              <button
                onClick={handleAutofillCode}
                className="text-[10px] font-mono text-[#00F2FE] hover:underline cursor-pointer"
              >
                Auto-fill Token (729401)
              </button>
            </div>

            {/* 6 OTP Input Boxes */}
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-bold font-mono bg-[#0F1B2F] border-2 border-[#1E3252] focus:border-[#00F2FE] focus:ring-1 focus:ring-[#00F2FE] rounded-lg text-white transition-all outline-none"
                />
              ))}
            </div>

            {errorMsg && (
              <div className="text-center text-red-400 font-mono text-[11px]">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
              <span>Biometric ID: NDMA-AUTH-4812</span>
              <span className="text-emerald-400">Time-based One-Time Password (TOTP)</span>
            </div>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="p-3.5 sm:p-4 bg-[#0A1220] border-t border-[rgba(0,242,254,0.15)] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg bg-[#050B14] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleTransmitBroadcast}
            disabled={isTransmitting || isSuccess}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-mono text-xs font-extrabold tracking-wider transition-all cursor-pointer shadow-lg ${
              isSuccess
                ? "bg-emerald-600 text-white"
                : "bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-red-600 text-white shadow-[0_0_25px_rgba(213,0,0,0.6)] border border-red-400"
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>CELL BROADCAST DELIVERED TO 1.48M HANDSETS</span>
              </>
            ) : isTransmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>TRANSMITTING VIA TELECOM CBS GATEWAYS...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>CONFIRM & TRANSMIT CELL BROADCAST</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
