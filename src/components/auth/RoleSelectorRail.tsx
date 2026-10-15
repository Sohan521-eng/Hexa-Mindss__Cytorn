"use client";

import React from "react";
import { 
  Satellite, 
  ShieldAlert, 
  UserCheck, 
  KeyRound, 
  Info 
} from "lucide-react";

export type UserRole = "scientist" | "disaster" | "public" | "admin";

interface RoleOption {
  id: UserRole;
  title: string;
  badge: string;
  subtitle: string;
  privilege: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  targetDestination: string;
}

const ROLES: RoleOption[] = [
  {
    id: "scientist",
    title: "Meteorologist",
    badge: "TIER 2",
    subtitle: "IMD / ISRO Climatology",
    privilege: "Raw multi-spectral sensors, PINN Navier-Stokes tuning, NetCDF",
    icon: Satellite,
    accentColor: "#00F2FE",
    targetDestination: "/satellite-analyzer",
  },
  {
    id: "disaster",
    title: "Disaster EOC",
    badge: "TIER 3",
    subtitle: "NDMA / SDMA Commander",
    privilege: "Digital Twin inundation, district matrices, live CAP cell broadcasts",
    icon: ShieldAlert,
    accentColor: "#FF5E36",
    targetDestination: "/alerts",
  },
  {
    id: "public",
    title: "General Public",
    badge: "TIER 4",
    subtitle: "Citizen & Media Access",
    privilege: "Interactive track forecast viewer, safety warnings & shelter directory",
    icon: UserCheck,
    accentColor: "#94A3B8",
    targetDestination: "/dashboard",
  },
  {
    id: "admin",
    title: "System Admin",
    badge: "TIER 1",
    subtitle: "EOC Root Controller",
    privilege: "GPU hardware telemetry, API tokens, security audit log exports",
    icon: KeyRound,
    accentColor: "#00E676",
    targetDestination: "/settings",
  },
];

interface RoleSelectorRailProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  onOpenMatrix: () => void;
}

export const RoleSelectorRail: React.FC<RoleSelectorRailProps> = ({
  selectedRole,
  onSelectRole,
  onOpenMatrix,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-rajdhani font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <span>Select Operational Clearance</span>
          <span className="text-[10px] font-mono text-[#00F2FE] font-normal">
            (Determines Interface Gateway)
          </span>
        </label>
        <button
          type="button"
          onClick={onOpenMatrix}
          className="inline-flex items-center gap-1 text-[11px] font-mono text-[#00F2FE] hover:text-[#38f5ff] transition-colors cursor-pointer"
        >
          <Info className="w-3 h-3" />
          <span>Clearance Matrix</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {ROLES.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;

          return (
            <button
              key={role.id}
              type="button"
              onClick={() => onSelectRole(role.id)}
              className={`relative p-2.5 sm:p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-[#0A192F]/90 shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.3)]"
                  : "bg-[#050B14]/80 border-[#1E3252] hover:border-slate-600 hover:bg-[#081220]"
              }`}
              style={{
                borderColor: isSelected ? role.accentColor : undefined,
              }}
            >
              {/* Active Glow Accent Indicator */}
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: role.accentColor }}
                />
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div
                    className="p-1 rounded-lg"
                    style={{
                      backgroundColor: isSelected
                        ? `${role.accentColor}20`
                        : "rgba(30, 50, 82, 0.4)",
                      color: isSelected ? role.accentColor : "#94A3B8",
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded"
                    style={{
                      backgroundColor: isSelected
                        ? `${role.accentColor}25`
                        : "rgba(15, 27, 47, 0.8)",
                      color: isSelected ? role.accentColor : "#64748B",
                      border: `1px solid ${
                        isSelected ? `${role.accentColor}50` : "transparent"
                      }`,
                    }}
                  >
                    {role.badge}
                  </span>
                </div>

                <div className="font-rajdhani font-bold text-xs sm:text-sm text-white uppercase tracking-wide leading-tight">
                  {role.title}
                </div>
                <div className="text-[10px] font-sans text-slate-400 truncate mt-0.5">
                  {role.subtitle}
                </div>
              </div>

              <div className="mt-2 pt-1.5 border-t border-[rgba(255,255,255,0.06)] text-[9px] font-mono text-slate-400 line-clamp-2 leading-tight">
                {role.privilege}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
