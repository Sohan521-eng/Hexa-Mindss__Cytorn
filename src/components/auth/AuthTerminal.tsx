"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Check,
  AlertTriangle,
  CheckCircle2,
  Info,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import Noise from "@/components/ui/Noise";
import { ScientistPillButton } from "@/components/ui/ScientistPillButton";
import {
  evaluatePasswordStrength,
  type AuthRole,
  type SanitizedUser,
} from "@/lib/auth/rbac";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface AuthTerminalProps {
  initialMode?: "signin" | "register";
}

interface RoleOption {
  id: AuthRole;
  label: string;
  tier: string;
  clearanceSummary: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  demoEmail: string;
  demoPassword: string;
  demoBadge: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: "scientist",
    label: "Scientist",
    tier: "TIER 2",
    clearanceSummary: "INSAT-3DR raw bands, EfficientNet-B0 inference & Grad-CAM XAI",
    icon: Satellite,
    demoEmail: "dr.mukherjee@imd.gov.in",
    demoPassword: "Imd@2026#Sci",
    demoBadge: "IMD-2026-9812",
  },
  {
    id: "disaster",
    label: "NDMA/SDMA",
    tier: "TIER 3",
    clearanceSummary: "Coastal inundation twin, district matrices & CAP warning dispatch",
    icon: Shield,
    demoEmail: "eoc.odisha@ndma.gov.in",
    demoPassword: "Ndma@2026#Eoc",
    demoBadge: "NDMA-OD-2026-412",
  },
  {
    id: "public",
    label: "Public",
    tier: "TIER 4",
    clearanceSummary: "Live cyclone tracking, 120h track cone & public safety advisories",
    icon: User,
    demoEmail: "citizen@cyclo-ai.in",
    demoPassword: "Public@2026#View",
    demoBadge: "",
  },
  {
    id: "admin",
    label: "Admin",
    tier: "TIER 1",
    clearanceSummary: "Full EOC root clearance, API key rotation & security audit trails",
    icon: KeyRound,
    demoEmail: "root.admin@isro.gov.in",
    demoPassword: "Admin@2026#Root",
    demoBadge: "ISRO-SAC-0001",
  },
];

export const AuthTerminal: React.FC<AuthTerminalProps> = ({
  initialMode = "signin",
}) => {
  const [mode, setMode] = useState<"signin" | "register">(initialMode);
  const [role, setRole] = useState<AuthRole>("scientist");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [suggestedRole, setSuggestedRole] = useState<AuthRole | null>(null);
  const [activeUser, setActiveUser] = useState<SanitizedUser | null>(null);
  const [showDemoTray, setShowDemoTray] = useState(false);

  const passwordStrength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const currentRoleOption = useMemo(
    () => ROLE_OPTIONS.find((r) => r.id === role) || ROLE_OPTIONS[0],
    [role]
  );

  // Check if an operator already has a verified HttpOnly session cookie
  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json.authenticated && json.user) {
          setActiveUser(json.user as SanitizedUser);
        }
      } catch {
        // Silent when unauthenticated
      }
    };
    checkSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const clearFeedback = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setInfoMsg(null);
    setSuggestedRole(null);
  };

  const handleModeSwitch = (nextMode: "signin" | "register") => {
    setMode(nextMode);
    clearFeedback();
  };

  const handleSignOut = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      setActiveUser(null);
      setInfoMsg("Previous session terminated. Enter credentials to re-authenticate.");
    }
  };

  const handleFillDemo = (option: RoleOption) => {
    clearFeedback();
    setMode("signin");
    setRole(option.id);
    setEmail(option.demoEmail);
    setPassword(option.demoPassword);
    setBadgeId(option.demoBadge);
    setShowDemoTray(false);
    setInfoMsg(`Loaded ${option.label} (${option.tier}) verification credentials. Click Sign In to verify.`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    clearFeedback();

    if (mode === "register" && !passwordStrength.valid) {
      setErrorMsg(passwordStrength.reason);
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "signin" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "signin"
          ? { email, password, role, rememberMe }
          : {
              name,
              email,
              password,
              role,
              badgeId: role === "public" ? "" : badgeId,
              rememberMe,
            };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErrorMsg(data.message || "Authentication failed. Please verify your credentials.");
        if (data.code === "ROLE_CLEARANCE_DENIED" && data.assigned_role) {
          setSuggestedRole(data.assigned_role as AuthRole);
        }
        setIsLoading(false);
        return;
      }

      const tier = data.user?.clearance_tier ?? 4;
      setSuccessMsg(
        data.message || `Tier ${tier} Clearance verified. Entering Command Home...`
      );

      // Navigate cleanly to Homepage Hero Section (/) with freshly issued HttpOnly session cookie
      setTimeout(() => {
        window.location.assign(data.redirect_to || "/");
      }, 320);
    } catch {
      setErrorMsg("Unable to reach authentication gateway. Please retry.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Active Session Banner (when returning to /login while already authenticated) */}
      {activeUser && (
        <div className="rounded-xl px-4 py-3 bg-[#10E7A2]/10 border border-[#10E7A2]/45 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="w-4 h-4 text-[#10E7A2] shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] font-rajdhani font-bold uppercase tracking-wider text-[#10E7A2]">
                Active Session • Tier {activeUser.clearance_tier}
              </p>
              <p className="text-xs font-jetbrains text-white truncate">
                {activeUser.name} ({activeUser.role})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="px-2.5 py-1 rounded-lg bg-[#00F2FE]/15 border border-[#00F2FE]/55 text-[11px] font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] hover:bg-[#00F2FE]/25 transition cursor-pointer"
            >
              Enter Home &rarr;
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="p-1.5 rounded-lg bg-[#050B14]/80 border border-slate-700 text-slate-300 hover:text-[#FF5E36] hover:border-[#FF5E36]/60 transition cursor-pointer"
              title="Terminate active session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Glassmorphic Command Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-6 sm:p-7 space-y-5 backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(10, 19, 34, 0.88)",
          backgroundImage:
            "linear-gradient(155deg, rgba(0, 242, 254, 0.06) 0%, rgba(15, 27, 47, 0.90) 42%, rgba(5, 11, 20, 0.96) 100%)",
          border: "1px solid rgba(0, 242, 254, 0.35)",
          boxShadow: "0 18px 44px rgba(0, 0, 0, 0.72), inset 0 1px 0 rgba(224, 252, 255, 0.12)",
        }}
      >
        {/* Tactile Film-Grain Overlay */}
        <div className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl overflow-hidden opacity-60">
          <Noise
            patternSize={250}
            patternScaleX={1.3}
            patternScaleY={1.3}
            patternRefreshInterval={2}
            patternAlpha={14}
          />
        </div>

        <div className="relative z-10 space-y-4">
          {/* Terminal Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-jetbrains uppercase tracking-[0.16em] text-[#00F2FE]">
                Operator Access Control
              </span>
              <span className="text-[10px] font-jetbrains [font-feature-settings:'tnum'_on] px-2 py-0.5 rounded bg-[#050B14] border border-[rgba(0,242,254,0.28)] text-slate-300">
                {currentRoleOption.tier}
              </span>
            </div>
            <h1 className="font-orbitron font-bold text-lg sm:text-xl tracking-[0.04em] text-white uppercase">
              {mode === "signin" ? "Command Gateway Sign In" : "Provision Clearance"}
            </h1>
          </div>

          {/* Mode Switcher Rail */}
          <div
            className="flex items-center p-1 rounded-xl bg-[#050B14]/90"
            style={{
              border: "1px solid rgba(0, 242, 254, 0.3)",
            }}
          >
            <button
              type="button"
              onClick={() => handleModeSwitch("signin")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-jetbrains font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/65 text-[#00F2FE]"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("register")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-jetbrains font-bold uppercase tracking-wider transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/65 text-[#00F2FE]"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              Register
            </button>
          </div>

          {/* Role Selector Rail */}
          <div className="space-y-2">
            <label className="text-[11px] font-rajdhani font-bold uppercase tracking-[0.12em] text-[#00F2FE] block">
              Select Operational Role
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {ROLE_OPTIONS.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <ScientistPillButton
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRole(r.id);
                      setErrorMsg(null);
                      setSuggestedRole(null);
                    }}
                    className={`!min-w-0 !w-full !h-14 !p-0 !rounded-xl !justify-center transition-all ${
                      isSelected ? "scientist-pill" : "scientist-pill !bg-[#050B14]/90"
                    }`}
                    style={{
                      border: isSelected
                        ? "1.5px solid #00F2FE"
                        : "1px solid rgba(0, 242, 254, 0.28)",
                      boxShadow: isSelected
                        ? "0 6px 20px rgba(0, 0, 0, 0.8), 0 0 12px rgba(0, 242, 254, 0.28)"
                        : "0 4px 12px rgba(0, 0, 0, 0.6)",
                    }}
                    label={
                      <span className="flex flex-col items-center justify-center gap-1 w-full">
                        <Icon
                          className="w-4 h-4 shrink-0 transition-colors"
                          style={{ color: isSelected ? "#00F2FE" : "#94A3B8" }}
                        />
                        <span
                          className="text-[10px] font-jetbrains leading-tight tracking-wider transition-colors"
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
                        <span className="text-[10px] font-jetbrains leading-tight text-[#050B14] font-bold tracking-wider">
                          {r.label}
                        </span>
                      </span>
                    }
                    title={`Select ${r.label} clearance`}
                  />
                );
              })}
            </div>
            <p className="text-[11px] font-jakarta text-slate-400 leading-snug px-0.5">
              {currentRoleOption.clearanceSummary}
            </p>
          </div>

          {/* Inline Security & Status Feedback */}
          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl px-3 py-2.5 bg-[#FF5E36]/15 border border-[#FF5E36]/60 text-xs font-jetbrains text-[#FFB4A2] flex flex-col gap-1.5"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-[#FF5E36] shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
              {suggestedRole && (
                <button
                  type="button"
                  onClick={() => {
                    setRole(suggestedRole);
                    setErrorMsg(null);
                    setSuggestedRole(null);
                  }}
                  className="self-start text-[11px] font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] hover:underline cursor-pointer pl-5"
                >
                  Switch to assigned role ({ROLE_OPTIONS.find((r) => r.id === suggestedRole)?.label || suggestedRole}) &rarr;
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              className="rounded-xl px-3 py-2.5 bg-[#10E7A2]/15 border border-[#10E7A2]/60 text-xs font-jetbrains text-[#10E7A2] flex items-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div
              role="status"
              className="rounded-xl px-3 py-2.5 bg-[#00F2FE]/10 border border-[#00F2FE]/40 text-xs font-jetbrains text-[#00F2FE] flex items-start gap-2"
            >
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="leading-snug">{infoMsg}</span>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === "register" && (
              <div>
                <label className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] block mb-1">
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
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050B14]/85 text-xs font-jakarta text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE] transition-colors"
                    style={{
                      border: "1px solid rgba(0, 242, 254, 0.32)",
                    }}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] block mb-1">
                Official Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={currentRoleOption.demoEmail}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#050B14]/85 text-xs font-jetbrains text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE] transition-colors"
                  style={{
                    border: "1px solid rgba(0, 242, 254, 0.32)",
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE]">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      setInfoMsg("Contact your IMD / NDMA EOC Administrator to initiate a clearance override reset.");
                    }}
                    className="text-[11px] font-jetbrains text-[#00F2FE]/85 hover:text-[#00F2FE] hover:underline cursor-pointer"
                  >
                    Recovery?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#050B14]/85 text-xs font-jetbrains text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE] transition-colors"
                  style={{
                    border: "1px solid rgba(0, 242, 254, 0.32)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === "register" && password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((seg) => {
                      const active = passwordStrength.score >= seg;
                      const color =
                        passwordStrength.score >= 4
                          ? "#10E7A2"
                          : passwordStrength.score === 3
                          ? "#00F2FE"
                          : passwordStrength.score === 2
                          ? "#F59E0B"
                          : "#FF5E36";
                      return (
                        <div
                          key={seg}
                          className="h-1 rounded-full transition-colors duration-200"
                          style={{
                            backgroundColor: active ? color : "rgba(30, 50, 82, 0.7)",
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-jetbrains [font-feature-settings:'tnum'_on]">
                    <span className="text-slate-400">Entropy Level:</span>
                    <span
                      style={{
                        color:
                          passwordStrength.score >= 4
                            ? "#10E7A2"
                            : passwordStrength.score === 3
                            ? "#00F2FE"
                            : passwordStrength.score === 2
                            ? "#F59E0B"
                            : "#FF5E36",
                      }}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {role !== "public" && mode === "register" && (
              <div>
                <label className="text-xs font-rajdhani font-bold uppercase tracking-wider text-[#00F2FE] block mb-1">
                  Agency / Badge PIN <span className="text-slate-500 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  value={badgeId}
                  onChange={(e) => setBadgeId(e.target.value)}
                  placeholder="e.g. IMD-2026-9812"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#050B14]/85 text-xs font-jetbrains text-white placeholder-slate-600 focus:outline-none focus:border-[#00F2FE] transition-colors"
                  style={{
                    border: "1px solid rgba(0, 242, 254, 0.32)",
                  }}
                />
              </div>
            )}

            {mode === "signin" && (
              <div className="flex items-center justify-between pt-0.5">
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
                      border: rememberMe ? "1.5px solid #00F2FE" : "1px solid rgba(0, 242, 254, 0.4)",
                    }}
                  >
                    {rememberMe && <Check className="w-3 h-3 text-[#050B14] stroke-[3.5]" />}
                  </div>
                  <span className="text-xs font-rajdhani font-semibold tracking-wide text-slate-300 group-hover:text-[#00F2FE] transition-colors">
                    Keep terminal authorized (30 days)
                  </span>
                </button>
              </div>
            )}

            <div className="pt-1.5">
              <ScientistPillButton
                type="submit"
                disabled={isLoading}
                className="scientist-pill !w-full !h-11 !py-0 !rounded-xl !gap-2 !justify-center"
                icon={<ArrowRight className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
                hoverIcon={<ArrowRight className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
                label={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-[0.12em] text-white">
                    {isLoading
                      ? "Verifying Clearance..."
                      : mode === "signin"
                      ? "Authenticate & Enter Command"
                      : "Provision & Enter Command"}
                  </span>
                }
                hoverLabel={
                  <span className="font-rajdhani font-bold text-xs uppercase tracking-[0.12em] text-[#050B14]">
                    {isLoading
                      ? "Verifying Clearance..."
                      : mode === "signin"
                      ? "Authenticate & Enter Command"
                      : "Provision & Enter Command"}
                  </span>
                }
                title="Authenticate and enter CYTORN homepage"
              />
            </div>
          </form>

          {/* Collapsible Institutional Verification Credentials Helper */}
          <div className="pt-2 border-t border-[rgba(0,242,254,0.14)] space-y-2">
            <button
              type="button"
              onClick={() => setShowDemoTray(!showDemoTray)}
              className="w-full flex items-center justify-between text-[11px] font-jetbrains text-slate-400 hover:text-[#00F2FE] transition cursor-pointer"
            >
              <span>Institutional Demo Clearances (4 Tiers)</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  showDemoTray ? "rotate-180 text-[#00F2FE]" : ""
                }`}
              />
            </button>

            {showDemoTray && (
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleFillDemo(opt)}
                    className="text-left px-2.5 py-2 rounded-lg bg-[#050B14]/90 border border-[#1E3252] hover:border-[#00F2FE]/60 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-rajdhani font-bold uppercase text-white">
                        {opt.label}
                      </span>
                      <span className="text-[9px] font-jetbrains text-[#00F2FE]">
                        {opt.tier}
                      </span>
                    </div>
                    <p className="text-[10px] font-jetbrains text-slate-400 truncate mt-0.5">
                      {opt.demoEmail}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Mode Link */}
          <div className="text-center text-xs font-jakarta text-slate-400">
            {mode === "signin" ? (
              <>
                New operator?{" "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch("register")}
                  className="text-[#00F2FE] hover:underline font-semibold cursor-pointer"
                >
                  Request Clearance
                </button>
              </>
            ) : (
              <>
                Already hold clearance?{" "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch("signin")}
                  className="text-[#00F2FE] hover:underline font-semibold cursor-pointer"
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
