"use client";

import React from "react";
import { SettingsCategory } from "./types";
import { Satellite, Cpu, BellRing, Terminal, Shield } from "lucide-react";

interface SettingsNavPillsProps {
  activeCategory: SettingsCategory;
  onSelectCategory: (category: SettingsCategory) => void;
}

interface NavItem {
  id: SettingsCategory;
  hash: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    id: "satellite-feeds",
    hash: "#satellite-feeds",
    label: "Satellite Feeds",
    icon: Satellite,
  },
  {
    id: "model-engine",
    hash: "#model-engine",
    label: "AI Model Engine",
    icon: Cpu,
  },
  {
    id: "webhooks",
    hash: "#webhooks",
    label: "Disaster Webhooks",
    icon: BellRing,
  },
  {
    id: "api-hub",
    hash: "#api-hub",
    label: "Developer API Hub",
    icon: Terminal,
  },
  {
    id: "security",
    hash: "#security",
    label: "Security & Audit",
    icon: Shield,
  },
];

export const SettingsNavPills: React.FC<SettingsNavPillsProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const handleClick = (item: NavItem) => {
    onSelectCategory(item.id);
    window.history.pushState(null, "", item.hash);
    const navBar = document.getElementById("settings-nav-bar");
    if (navBar) {
      navBar.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  return (
    <div id="settings-nav-bar" className="w-full py-1">
      <nav
        aria-label="Settings Categories"
        className="w-full flex flex-wrap md:flex-nowrap items-center justify-between gap-1 sm:gap-1.5 p-1 rounded-lg sm:rounded-xl bg-[#0F1B2F]/90 backdrop-blur-xl border border-[rgba(0,242,254,0.4)] shadow-[0_4px_16px_rgba(0,0,0,0.6),0_0_12px_rgba(0,242,254,0.15)]"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeCategory === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item)}
              className={`group flex-1 min-w-[140px] md:min-w-0 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-md sm:rounded-lg text-xs sm:text-sm font-rajdhani font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#00F2FE]/15 border border-[#00F2FE]/70 text-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.3)] font-black"
                  : "bg-[#050B14]/70 hover:bg-[#00F2FE]/15 border border-[#1E3252] hover:border-[#00F2FE]/60 text-[#8E9EB5] hover:text-[#00F2FE]"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors duration-200 ${
                  isActive ? "text-[#00F2FE]" : "text-[#8E9EB5] group-hover:text-[#00F2FE]"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
