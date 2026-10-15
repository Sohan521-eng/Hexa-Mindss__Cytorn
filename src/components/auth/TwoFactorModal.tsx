"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  KeyRound, 
  Smartphone, 
  ShieldCheck, 
  X, 
  RefreshCw, 
  Radio, 
  Fingerprint 
} from "lucide-react";
import Noise from "@/components/ui/Noise";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerifySuccess: () => void;
  userRoleName: string;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onVerifySuccess,
  userRoleName,
}) => {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [authMethod, setAuthMethod] = useState<"totp" | "webauthn" | "sms">("totp");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Rotating countdown timer
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Focus on first input on mount
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputsRef.current[0]?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    newDigits[index] = val.slice(-1); // Take last character entered
    setDigits(newDigits);
    setErrorMsg("");

    // Auto-advance
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto-verify when 6 digits are complete
    if (index === 5 && val) {
      triggerVerification(newDigits.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim().slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;

    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);

    if (pasted.length === 6) {
      inputsRef.current[5]?.focus();
      triggerVerification(pasted);
    }
  };

  const triggerVerification = (codeString?: string) => {
    const code = codeString || digits.join("");
    if (code.length < 6 && authMethod === "totp") {
      setErrorMsg("Please enter the complete 6-digit TOTP code.");
      return;
    }

    setIsVerifying(true);
    setErrorMsg("");

    setTimeout(() => {
      setIsVerifying(false);
      onVerifySuccess();
    }, 700);
  };

  const handleWebAuthnChallenge = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerifySuccess();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl p-6 sm:p-7 space-y-5"
        style={{
          backgroundColor: "#0A1322",
          backgroundImage:
            "linear-gradient(145deg, rgba(0, 242, 254, 0.12) 0%, rgba(15, 27, 47, 0.98) 40%, #070E1A 100%)",
          border: "1.5px solid rgba(0, 242, 254, 0.5)",
          boxShadow: "0 12px 48px rgba(0,0,0,0.85), 0 0 24px rgba(0, 242, 254, 0.25)",
        }}
      >
        {/* Background Noise layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-hidden opacity-75">
          <Noise
            patternSize={250}
            patternScaleX={1.4}
            patternScaleY={1.4}
            patternRefreshInterval={2}
            patternAlpha={18}
          />
        </div>

        {/* Modal Header */}
        <div className="relative z-10 flex items-start justify-between pb-3 border-b border-[rgba(0,242,254,0.25)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00F2FE]/15 border border-[#00F2FE]/50 text-[10px] font-mono text-[#00F2FE] font-bold uppercase tracking-wider">
              <KeyRound className="w-3 h-3" />
              Two-Factor Authentication
            </div>
            <h3 className="font-orbitron font-extrabold text-base sm:text-lg text-white tracking-wide">
              MFA Challenge: {userRoleName}
            </h3>
            <p className="text-xs font-sans text-slate-300">
              Government security mandate requires secondary clearance authentication.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl bg-[#050B14] border border-slate-700 hover:border-[#00F2FE] text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Method Selector */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#050B14]/80 border border-[rgba(0,242,254,0.25)]">
          <button
            type="button"
            onClick={() => setAuthMethod("totp")}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              authMethod === "totp"
                ? "bg-[#00F2FE]/20 border border-[#00F2FE] text-[#00F2FE]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>TOTP App</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod("webauthn")}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              authMethod === "webauthn"
                ? "bg-[#00F2FE]/20 border border-[#00F2FE] text-[#00F2FE]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>FIDO2 Key</span>
          </button>

          <button
            type="button"
            onClick={() => setAuthMethod("sms")}
            className={`py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              authMethod === "sms"
                ? "bg-[#00F2FE]/20 border border-[#00F2FE] text-[#00F2FE]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SMS / Pager</span>
          </button>
        </div>

        {/* Method 1: TOTP Split Code Input */}
        {authMethod === "totp" && (
          <div className="relative z-10 space-y-4">
            <div className="text-center">
              <span className="text-xs font-sans text-slate-300">
                Enter the 6-digit code from your Government Authenticator:
              </span>
            </div>

            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-11 sm:w-12 h-13 text-center text-xl font-mono font-bold text-white bg-[#050B14] border border-[rgba(0,242,254,0.4)] rounded-xl focus:border-[#00F2FE] focus:outline-none focus:shadow-[0_0_12px_rgba(0,242,254,0.3)] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-all"
                />
              ))}
            </div>

            {/* Countdown timer */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
              <span className="flex items-center gap-1">
                <RefreshCw className="w-3 h-3 text-[#00F2FE] animate-spin" />
                Rotating in <strong className="text-white">{timeLeft}s</strong>
              </span>
              <button
                type="button"
                onClick={() => setDigits(["", "", "", "", "", ""])}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Method 2: WebAuthn Hardware Key */}
        {authMethod === "webauthn" && (
          <div className="relative z-10 py-4 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#00F2FE]/15 border border-[#00F2FE]/50 flex items-center justify-center text-[#00F2FE] shadow-[0_0_16px_rgba(0,242,254,0.25)]">
              <Fingerprint className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-rajdhani font-bold text-sm text-white uppercase tracking-wider">
                Touch YubiKey / Hardware Token
              </h4>
              <p className="text-xs font-sans text-slate-400">
                Insert your PKI USB key or tap your contactless officer smart card.
              </p>
            </div>
            <button
              type="button"
              onClick={handleWebAuthnChallenge}
              className="px-4 py-2 rounded-xl bg-[#00F2FE] text-[#050B14] font-rajdhani font-bold text-xs uppercase tracking-wider hover:bg-[#38f5ff] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.4)]"
            >
              Simulate Touch Verification
            </button>
          </div>
        )}

        {/* Method 3: SMS Relay */}
        {authMethod === "sms" && (
          <div className="relative z-10 py-3 text-center space-y-3">
            <div className="text-xs font-sans text-slate-300">
              One-Time Password dispatched to registered terminal:
            </div>
            <div className="font-mono text-sm font-bold text-[#00F2FE]">
              +91 98••••••41 (EOC Disaster Line)
            </div>
            <input
              type="text"
              placeholder="Enter 6-digit SMS code"
              className="w-full bg-[#050B14] border border-[rgba(0,242,254,0.4)] rounded-xl px-3 py-2 text-center text-sm font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE]"
              onChange={(e) => {
                if (e.target.value.length === 6) {
                  triggerVerification(e.target.value);
                }
              }}
            />
          </div>
        )}

        {/* Error message display */}
        {errorMsg && (
          <div className="relative z-10 p-2.5 rounded-xl bg-[#FF5E36]/15 border border-[#FF5E36] text-[11px] font-mono text-[#FF5E36] text-center font-bold">
            {errorMsg}
          </div>
        )}

        {/* Verify Action Button */}
        <div className="relative z-10 pt-2 border-t border-[rgba(0,242,254,0.2)] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#050B14] border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isVerifying}
            onClick={() => triggerVerification()}
            className="flex-1 py-2 px-4 rounded-xl bg-[#00F2FE] hover:bg-[#38f5ff] text-[#050B14] font-rajdhani font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_14px_rgba(0,242,254,0.4)] flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying Cryptographic Seal...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Authorize &amp; Enter Platform</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
