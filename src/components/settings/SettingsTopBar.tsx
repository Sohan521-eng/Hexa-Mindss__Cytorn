"use client";

import { Save, RotateCcw, CheckCircle2, AlertTriangle } from "lucide-react";
import Noise from "@/components/ui/Noise";
import { ScientistPillButton } from "@/components/ui/ScientistPillButton";

interface SettingsTopBarProps {
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onRevert: () => void;
  toastMessage: { text: string; type: "success" | "warning" | "error" } | null;
}

export const SettingsTopBar: React.FC<SettingsTopBarProps> = ({
  hasUnsavedChanges,
  onSave,
  onRevert,
  toastMessage,
}) => {
  return (
    <header
      id="settings-top-bar"
      className="relative z-20 w-full rounded-2xl overflow-hidden p-3.5 sm:p-4 transition-all duration-200 bg-transparent"
      style={{
        border: "1.5px solid rgba(0, 242, 254, 0.55)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,242,254,0.12), 0 0 18px rgba(0,242,254,0.18)",
      }}
    >
      {/* Background layer with Noise & subtle ambient glow matching MetricsTopBar & AlertsTopBar */}
      <div className="absolute inset-0 bg-[#0F1B2F]/95 backdrop-blur-md pointer-events-none rounded-2xl overflow-hidden">
        <Noise
          patternSize={250}
          patternScaleX={1.2}
          patternScaleY={1.2}
          patternRefreshInterval={2}
          patternAlpha={12}
        />
        <div className="absolute top-0 right-1/4 w-96 h-24 bg-[#00F2FE]/10 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: Mission Brand & Title with Animated Gradient */}
        <div className="flex flex-col justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-wide flex items-center gap-2">
            <span className="heading-gradient-shadow-wrapper">
              <span className="heading-moving-gradient font-black font-rajdhani uppercase tracking-wider">
                System Settings &amp; Data Connectors
              </span>
            </span>
          </h1>
          <p className="text-xs text-[#00F2FE] font-medium font-sans hidden sm:block [text-shadow:0_2px_4px_rgba(0,0,0,0.95)] mt-0.5">
            Mission-control satellite data feeds, GPU inference engine, disaster webhook mesh &amp; developer REST API
          </p>
        </div>

        {/* Right: Master Save/Revert Actions (ScientistPillButton styling & GSAP physics matching SC button) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Revert Action (Slate Theme) */}
          <ScientistPillButton
            onClick={onRevert}
            disabled={!hasUnsavedChanges}
            className="scientist-pill-slate"
            style={{
              opacity: hasUnsavedChanges ? 1 : 0.45,
              cursor: hasUnsavedChanges ? "pointer" : "not-allowed",
            }}
            icon={<RotateCcw className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
            hoverIcon={<RotateCcw className="w-3.5 h-3.5 text-white shrink-0" />}
            label={<span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#CBD5E1]">Revert</span>}
            hoverLabel={<span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white">Revert</span>}
            title="Revert modified configuration inputs to last saved state"
          />

          {/* Save All Action (Cyan Theme) */}
          <ScientistPillButton
            onClick={onSave}
            className="scientist-pill"
            style={{
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(0, 0, 0, 0.8)",
            }}
            icon={<Save className="w-3.5 h-3.5 text-[#00F2FE] shrink-0" />}
            hoverIcon={<Save className="w-3.5 h-3.5 text-[#050B14] shrink-0" />}
            label={
              <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.95)]">
                Save All
              </span>
            }
            hoverLabel={
              <span className="font-rajdhani font-bold text-xs uppercase tracking-wider text-[#050B14]">
                Save All
              </span>
            }
            title="Commit all configuration parameters to operational database"
          />
        </div>
      </div>

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed top-20 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toastMessage.type === "success"
              ? "bg-[#0F1B2F]/95 border-[#00E676]/60 text-white shadow-[0_0_25px_rgba(0,230,118,0.25)]"
              : toastMessage.type === "warning"
              ? "bg-[#0F1B2F]/95 border-[#FFB300]/60 text-white shadow-[0_0_25px_rgba(255,179,0,0.25)]"
              : "bg-[#0F1B2F]/95 border-[#FF5E36]/60 text-white shadow-[0_0_25px_rgba(255,94,54,0.25)]"
          }`}
        >
          {toastMessage.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#00E676]" />}
          {toastMessage.type === "warning" && <AlertTriangle className="w-4 h-4 text-[#FFB300]" />}
          {toastMessage.type === "error" && <AlertTriangle className="w-4 h-4 text-[#FF5E36]" />}
          <span className="font-sans text-xs font-medium text-slate-200">{toastMessage.text}</span>
        </div>
      )}
    </header>
  );
};
