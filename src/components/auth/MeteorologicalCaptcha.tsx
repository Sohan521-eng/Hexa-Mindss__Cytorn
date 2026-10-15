"use client";

import React, { useState } from "react";
import { 
  CheckCircle2, 
  RotateCcw, 
  HelpCircle, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";

interface MeteorologicalCaptchaProps {
  onVerified: () => void;
}

export const MeteorologicalCaptcha: React.FC<MeteorologicalCaptchaProps> = ({
  onVerified,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<boolean>(false);

  // Question: Coriolis Deflection / Northern Hemisphere Cyclone Rotation
  const correctAnswer = 0; // "Counter-Clockwise (Cyclonic Inward Spiral)"

  const options = [
    {
      id: 0,
      label: "Counter-Clockwise (Cyclonic Inward Spiral)",
      hint: "Northern Hemisphere Coriolis Effect",
    },
    {
      id: 1,
      label: "Clockwise (Anticyclonic Outward Divergence)",
      hint: "Southern Hemisphere Anticyclone",
    },
    {
      id: 2,
      label: "Purely Linear Zonal Easterly Vector",
      hint: "Non-rotational trade wind",
    },
  ];

  const handleSelect = (id: number) => {
    setSelectedOption(id);
    if (id === correctAnswer) {
      setIsPassed(true);
      setErrorStatus(false);
      onVerified();
    } else {
      setIsPassed(false);
      setErrorStatus(true);
    }
  };

  return (
    <div className="p-3.5 rounded-xl bg-[#050B14]/80 border border-[rgba(0,242,254,0.3)] space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-rajdhani font-bold text-white uppercase tracking-wider">
          <HelpCircle className="w-3.5 h-3.5 text-[#00F2FE]" />
          <span>Meteorological Zero-Bot Verification</span>
        </div>
        {isPassed ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-[#00E676] bg-[#00E676]/10 px-2 py-0.5 rounded-full border border-[#00E676]/40">
            <CheckCircle2 className="w-3 h-3" />
            HUMAN SCIENTIST VERIFIED
          </span>
        ) : (
          <span className="text-[10px] font-mono text-slate-400">
            Select correct circulation:
          </span>
        )}
      </div>

      <div className="text-[11px] font-sans text-slate-300">
        In the <strong>Bay of Bengal (Northern Hemisphere)</strong>, tropical cyclones rotate in which rotational sense?
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const isCorrect = isPassed && opt.id === correctAnswer;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={`p-2 rounded-lg text-left text-xs transition-all cursor-pointer border ${
                isCorrect
                  ? "bg-[#00E676]/15 border-[#00E676] text-[#00E676] shadow-[0_0_8px_rgba(0,230,118,0.2)]"
                  : isSelected && errorStatus
                  ? "bg-[#FF5E36]/15 border-[#FF5E36] text-[#FF5E36]"
                  : "bg-[#0A1322] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
              }`}
            >
              <div className="font-mono text-[11px] font-semibold leading-tight">
                {opt.label}
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-1">
                {opt.hint}
              </div>
            </button>
          );
        })}
      </div>

      {errorStatus && (
        <div className="text-[10px] font-mono text-[#FF5E36] flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>Incorrect circulation vector. Please pick the cyclonic vortex for Northern Basin.</span>
        </div>
      )}
    </div>
  );
};
