"use client";

import React from "react";
import { 
  X, 
  ShieldCheck, 
  Check, 
  Minus, 
  Lock, 
  Eye, 
  Cpu, 
  Bell, 
  Settings, 
  Database,
  Radio
} from "lucide-react";
import Noise from "@/components/ui/Noise";

interface RbacMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RbacMatrixModal: React.FC<RbacMatrixModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const permissions = [
    {
      feature: "Multi-Spectral Satellite Stream (TIR-1, TIR-2, WV)",
      scientist: "Full Read/Write",
      disaster: "Composite Overlay",
      public: "Restricted VIS",
      admin: "Full Ingestion Control",
    },
    {
      feature: "Deep Learning Inference & Weight Tuning (PINN Navier-Stokes)",
      scientist: "Full Hyperparameter Control",
      disaster: "Read-Only Predictions",
      public: "Locked",
      admin: "Model Swapping & Benchmark",
    },
    {
      feature: "Disaster Cell Broadcast & CAP Emergency Protocol",
      scientist: "Draft Bulletin Advisory",
      disaster: "Full Live Broadcast Authority",
      public: "Read-Only Bulletins",
      admin: "System Audit & Test Relay",
    },
    {
      feature: "Geospatial Coastal Inundation Digital Twin",
      scientist: "High-Res Mesh (10m)",
      disaster: "District Evacuation Matrix",
      public: "Zonal Heatmap (1km)",
      admin: "GIS Pipeline Maintenance",
    },
    {
      feature: "System Settings, Satellite API Feeds & REST Tokens",
      scientist: "View Hardware Telemetry",
      disaster: "Webhook Dispatch Status",
      public: "Locked",
      admin: "Full Provisioning & Rotation",
    },
    {
      feature: "National Security & Audit Trail Inspection",
      scientist: "Personal Audit History",
      disaster: "EOC Broadcast Logs",
      public: "Locked",
      admin: "Full Audit Export & Inspection",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl p-6 sm:p-7 space-y-5"
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
        <div className="relative z-10 flex items-start justify-between pb-4 border-b border-[rgba(0,242,254,0.25)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00F2FE]/15 border border-[#00F2FE]/50 text-[10px] font-mono text-[#00F2FE] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Security Clearance Matrix
            </div>
            <h3 className="font-orbitron font-extrabold text-lg sm:text-xl text-white tracking-wide">
              Role-Based Access Control (RBAC) Governance
            </h3>
            <p className="text-xs font-sans text-slate-300">
              Comparative clearance levels, feature access tiers, and operational authorization protocols under CYCLO-AI v2.4.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#050B14] border border-slate-700 hover:border-[#00F2FE] text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Matrix Table */}
        <div className="relative z-10 overflow-x-auto no-scrollbar rounded-xl border border-[rgba(0,242,254,0.35)] bg-[#050B14]/70 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#050B14]/90 border-b border-[rgba(0,242,254,0.25)] text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4 min-w-[200px]">Platform Capability</th>
                <th className="py-3 px-3 text-[#00F2FE] min-w-[150px]">
                  🧑‍🔬 Scientist (Tier 2)
                </th>
                <th className="py-3 px-3 text-[#FF5E36] min-w-[150px]">
                  🛡️ Disaster (Tier 3)
                </th>
                <th className="py-3 px-3 text-slate-300 min-w-[130px]">
                  👤 Public (Tier 4)
                </th>
                <th className="py-3 px-3 text-[#00E676] min-w-[150px]">
                  🔑 Admin (Tier 1)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(0,242,254,0.12)] font-mono text-[11px]">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-[#00F2FE]/5 transition-colors">
                  <td className="py-3 px-4 font-sans font-medium text-white">
                    {p.feature}
                  </td>
                  <td className="py-3 px-3 text-[#00F2FE]/90 font-medium">
                    {p.scientist}
                  </td>
                  <td className="py-3 px-3 text-[#FF5E36]/90 font-medium">
                    {p.disaster}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {p.public}
                  </td>
                  <td className="py-3 px-3 text-[#00E676] font-semibold">
                    {p.admin}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[rgba(0,242,254,0.2)] text-[11px] font-mono text-slate-400">
          <div>
            <span>Verified pursuant to National Cyclone Risk Mitigation Project (NCRMP) rules.</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#00F2FE] text-[#050B14] font-rajdhani font-bold text-xs uppercase tracking-wider hover:bg-[#38f5ff] transition-all cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.4)]"
          >
            Acknowledge Matrix
          </button>
        </div>
      </div>
    </div>
  );
};
