"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  Shield, 
  Satellite, 
  KeyRound,
  ArrowRight,
  Check
} from "lucide-react";
import Noise from "@/components/ui/Noise";
import { ScientistPillButton } from "@/components/ui/ScientistPillButton";

type AuthRole = "scientist" | "disaster" | "public" | "admin";

interface AuthTerminalProps {
  initialMode?: "signin" | "register";
}

export const AuthTerminal: React.FC<AuthTerminalProps> = ({
  initialMode = "signin",
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "register">(initialMode);
  const [role, setRole] = useState<AuthRole>("scientist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { id: "scientist" as AuthRole, label: "Scientist", icon: Satellite, path: "/satellite-analyzer" },
    { id: "disaster" as AuthRole, label: "NDMA/SDMA", icon: Shield, path: "/alerts" },
    { id: "public" as AuthRole, label: "Public", icon: User, path: "/dashboard" },
    { id: "admin" as AuthRole, label: "Admin", icon: KeyRound, path: "/settings" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const target = roles.find((r) => r.id === role)?.path || "/dashboard";
      router.push(target);
    }, 450);
  };

  return (
    <div className="w-full">
      {/* Main Glassmorphic Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(10, 19, 34, 0.82)",
          backgroundImage:
            "linear-gradient(145deg, rgba(0, 242, 254, 0.08) 0%, rgba(15, 27, 47, 0.85) 40%, rgba(7, 14, 26, 0.90) 100%)",
          border: "1.5px solid rgba(0, 242, 254, 0.45)",
          boxShadow: "0 10px 32px rgba(0,0,0,0.7), 0 0 16px rgba(0, 242, 254, 0.15)",
        }}
      >
        {/* Background Noise layer */}
        <div className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-hidden">
          <Noise
            patternSize={250}
            patternScaleX={1.4}
            patternScaleY={1.4}
            patternRefreshInterval={2}
            patternAlpha={22}
          />
        </div>

        <div className="relative z-10 space-y-4">
          {/* Mode Switcher Tabs */}
          <div
            className="flex items-center p-1 rounded-xl bg-[#0F1B2F]/90"
            style={{
              border: "1.5px solid rgba(0, 242, 254, 0.45)",
              boxShadow: "0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(0, 242, 254, 0.15)",
            }}
          >
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)]"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Register
            </button>
          </div>

          {/* Role Selector Pills */}
          <div>
            <label className="text-[11px] font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] block mb-1.5">
              Select Operational Role
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {roles.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <ScientistPillButton
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`!min-w-0 !w-full !h-14 !p-0 !rounded-xl !justify-center transition-all ${
                      isSelected
                        ? "scientist-pill"
                        : "scientist-pill !bg-[#050B14]/85"
                    }`}
                    style={{
                      border: isSelected
                        ? "1.5px solid #00F2FE"
                        : "1.5px solid rgba(0, 242, 254, 0.45)",
                      boxShadow: isSelected
                        ? "0 8px 24px -2px rgba(0, 0, 0, 0.85), 0 0 16px rgba(0, 242, 254, 0.35), inset 0 1px 0 rgba(224, 252, 255, 0.5)"
                        : "0 8px 20px -2px rgba(0, 0, 0, 0.75), 0 0 8px rgba(0, 242, 254, 0.1), inset 0 1px 0 rgba(224, 252, 255, 0.25)",
                    }}
                    label={
                      <span className="flex flex-col items-center justify-center gap-1 w-full">
                        <Icon
                          className="w-4 h-4 shrink-0 transition-colors"
                          style={{ color: isSelected ? "#00F2FE" : "#94A3B8" }}
                        />
                        <span
                          className="text-[10px] font-mono leading-tight tracking-wider transition-colors"
                          style={{
                            color: isSelected ? "#00F2FE" : "#94A3B8",
                            fontWeight: isSelected ? 700 : 600,
                          }}
                        >
                          {r.label}
                        </span>
                      </span>
                    }
                    hoverLabel={
                      <span className="flex flex-col items-center justify-center gap-1 w-full">
                        <Icon className="w-4 h-4 shrink-0 text-[#050B14]" />
                        <span className="text-[10px] font-mono leading-tight text-[#050B14] font-bold tracking-wider">
                          {r.label}
                        </span>
                      </span>
                    }
                    title={`Select ${r.label} role`}
                  />
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Dr. Rajesh Sharma"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050B14]/80 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE]"
                    style={{
                      border: "1.5px solid rgba(0, 242, 254, 0.45)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(0, 242, 254, 0.1), inset 0 2px 4px rgba(0,0,0,0.6)",
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] block mb-1">
                Official Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="officer@imd.gov.in"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#050B14]/80 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE]"
                  style={{
                    border: "1.5px solid rgba(0, 242, 254, 0.45)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(0, 242, 254, 0.1), inset 0 2px 4px rgba(0,0,0,0.6)",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)]">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => alert("Please contact your IMD/NDMA System Administrator to reset your password.")}
                    className="text-[11px] font-mono text-[#00F2FE] hover:underline cursor-pointer relative -translate-y-1"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-[#050B14]/80 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE]"
                  style={{
                    border: "1.5px solid rgba(0, 242, 254, 0.45)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(0, 242, 254, 0.1), inset 0 2px 4px rgba(0,0,0,0.6)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Optional badge ID for officers */}
            {role !== "public" && (
              <div>
                <label className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] block mb-1">
                  Agency / Badge PIN <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. IMD-2026-9812"
                  className="w-full px-3 py-2 rounded-xl bg-[#050B14]/80 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE]"
                  style={{
                    border: "1.5px solid rgba(0, 242, 254, 0.45)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.5), 0 0 8px rgba(0, 242, 254, 0.1), inset 0 2px 4px rgba(0,0,0,0.6)",
                  }}
                />
              </div>
            )}

            {mode === "signin" && (
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={rememberMe}
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2.5 cursor-pointer select-none group text-left"
                >
                  <div
                    className="w-4 h-4 rounded-[5px] flex items-center justify-center transition-all duration-200 shrink-0"
                    style={{
                      backgroundColor: rememberMe ? "#00F2FE" : "rgba(5, 11, 20, 0.85)",
                      border: rememberMe ? "1.5px solid #00F2FE" : "1.5px solid rgba(0, 242, 254, 0.45)",
                      boxShadow: rememberMe
                        ? "0 0 10px rgba(0, 242, 254, 0.6), inset 0 1px 0 rgba(224, 252, 255, 0.6)"
                        : "0 2px 6px rgba(0,0,0,0.5), 0 0 8px rgba(0, 242, 254, 0.1), inset 0 2px 4px rgba(0,0,0,0.6)",
                    }}
                  >
                    {rememberMe && <Check className="w-3 h-3 text-[#050B14] stroke-[3.5]" />}
                  </div>
                  <span className="text-xs font-rajdhani font-semibold tracking-wide text-slate-300 group-hover:text-[#00F2FE] transition-colors">
                    Remember this device
                  </span>
                </button>
              </div>
            )}

            <div className="pt-2">
              <ScientistPillButton
                type="submit"
                disabled={isLoading}
                className="scientist-pill !w-full !h-10 !py-0 !rounded-xl !gap-2 !justify-center"
                icon={<ArrowRight className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
                hoverIcon={<ArrowRight className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
                label={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white">
                    {isLoading ? "Authenticating..." : mode === "signin" ? "Sign In" : "Create Account"}
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                    {isLoading ? "Authenticating..." : mode === "signin" ? "Sign In" : "Create Account"}
                  </span>
                }
                title="Authenticate session"
              />
            </div>
          </form>

          {/* Bottom link toggle */}
          <div className="pt-2 text-center text-xs text-slate-400">
            {mode === "signin" ? (
              <>
                Need agency credentials?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-[#00F2FE] hover:underline font-bold cursor-pointer"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have credentials?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="text-[#00F2FE] hover:underline font-bold cursor-pointer"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
