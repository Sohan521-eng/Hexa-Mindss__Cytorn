"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Building2, 
  Zap, 
  Route, 
  ShieldAlert, 
  Download, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  FileJson, 
  FileSpreadsheet, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  MapPin
} from "lucide-react";
import { DistrictInfo, StormContext, InfrastructurePOI, RbacRole } from "./types";
import { CRITICAL_INFRASTRUCTURE, calculatePoiStatus } from "./digitalTwinData";
import { exportTwinGeoJson, exportTwinCsv, exportTwinPdf } from "./exportTwinReport";

interface DistrictImpactRailProps {
  district: DistrictInfo;
  storm: StormContext;
  surgeLevel: number;
  rbacRole: RbacRole;
  onOpenEvacModal: () => void;
  onSelectPoi: (poi: InfrastructurePOI) => void;
  selectedPoiId: string | null;
}

export function DistrictImpactRail({
  district,
  storm,
  surgeLevel,
  rbacRole,
  onOpenEvacModal,
  onSelectPoi,
  selectedPoiId,
}: DistrictImpactRailProps) {
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  // Filter infrastructure for this district
  const districtPois = CRITICAL_INFRASTRUCTURE.filter((p) => p.districtId === district.id);

  const hospitals = districtPois.filter((p) => p.type === "hospital");
  const substations = districtPois.filter((p) => p.type === "substation");
  const highways = districtPois.filter((p) => p.type === "highway");
  const shelters = districtPois.filter((p) => p.type === "shelter");

  // Dynamic Impact KPIs scaled by surge level
  const affectedAreaKm2 = Math.round(district.totalAreaKm2 * 0.06 * (surgeLevel / 3.0));
  const populationAtRisk = Math.round(district.population * 0.08 * (surgeLevel / 3.0));
  const impassableKm = Math.min(district.highwayKm, Math.round(23 * (surgeLevel / 3.0)));

  const handleExport = (type: "geojson" | "csv" | "pdf") => {
    setExportMenuOpen(false);
    if (type === "geojson") {
      exportTwinGeoJson(district, storm, surgeLevel);
      setDownloadNotice("Exported GeoJSON (RFC 7946)");
    } else if (type === "csv") {
      exportTwinCsv(district, storm, surgeLevel);
      setDownloadNotice("Exported Impact Matrix CSV");
    } else {
      exportTwinPdf(district, storm, surgeLevel);
      setDownloadNotice("Generated Official IMD/NDMA PDF Report");
    }
    setTimeout(() => setDownloadNotice(null), 4000);
  };

  return (
    <aside
      id="district-impact-rail"
      className="w-full lg:w-80 xl:w-96 shrink-0 rounded-2xl bg-[#0F1B2F]/80 backdrop-blur-xl border border-[#00F2FE]/25 flex flex-col p-4 gap-4 overflow-y-auto text-white shadow-2xl"
    >
      {/* 1. Header & District Title */}
      <div className="flex items-center justify-between border-b border-[#1E3A5F] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] animate-ping" />
          <h2 className="text-sm font-orbitron font-bold uppercase tracking-wider text-white">
            {district.name.toUpperCase()} IMPACT INTELLIGENCE
          </h2>
        </div>
        <span className="text-[10px] font-jetbrains text-amber-300 font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
          RISK {district.riskScore}/100
        </span>
      </div>

      {/* 2. Surge Impact Summary Bar (KPI Grid) */}
      <div className="grid grid-cols-2 gap-2">
        {/* Affected Area */}
        <div className="p-2.5 rounded-xl bg-[#050B14]/80 border border-[#00F2FE]/20 flex flex-col">
          <span className="text-[9px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider">
            AFFECTED AREA
          </span>
          <span className="text-base font-jetbrains font-extrabold text-[#00F2FE] mt-0.5">
            {affectedAreaKm2} <span className="text-xs font-normal text-slate-400">km²</span>
          </span>
          <span className="text-[9px] font-jetbrains text-slate-400">
            {((affectedAreaKm2 / district.totalAreaKm2) * 100).toFixed(1)}% of district
          </span>
        </div>

        {/* Population at Risk */}
        <div className="p-2.5 rounded-xl bg-[#050B14]/80 border border-[#FF5E36]/30 flex flex-col">
          <span className="text-[9px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider">
            CITIZENS IN SURGE ZONE
          </span>
          <span className="text-base font-jetbrains font-extrabold text-[#FF5E36] mt-0.5">
            ~{populationAtRisk.toLocaleString()}
          </span>
          <span className="text-[9px] font-jetbrains text-slate-400">
            0-5km coastal strip
          </span>
        </div>

        {/* Safe Shelters */}
        <div className="p-2.5 rounded-xl bg-[#050B14]/80 border border-[#10E7A2]/20 flex flex-col">
          <span className="text-[9px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider">
            SAFE SHELTER CAPACITY
          </span>
          <span className="text-base font-jetbrains font-extrabold text-[#10E7A2] mt-0.5">
            {shelters.length} / {district.sheltersCount}
          </span>
          <span className="text-[9px] font-jetbrains text-slate-400">
            21,400 dry beds
          </span>
        </div>

        {/* Impassable Highway */}
        <div className="p-2.5 rounded-xl bg-[#050B14]/80 border border-[#F59E0B]/20 flex flex-col">
          <span className="text-[9px] font-rajdhani font-bold text-slate-400 uppercase tracking-wider">
            IMPASSABLE HIGHWAY
          </span>
          <span className="text-base font-jetbrains font-extrabold text-[#F59E0B] mt-0.5">
            {impassableKm} <span className="text-xs font-normal text-slate-400">km</span>
          </span>
          <span className="text-[9px] font-jetbrains text-slate-400">
            NH-316 cut off
          </span>
        </div>
      </div>

      {/* 3. Action CTAs */}
      <div className="flex flex-col gap-2 pt-1 pb-1">
        
        {/* Button 1: Order District Evacuation (Hazard Coral) */}
        <button
          onClick={onOpenEvacModal}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#EF4444] to-[#FF5E36] hover:from-[#dc2626] hover:to-[#ea580c] text-white font-rajdhani font-bold text-xs tracking-wider uppercase flex items-center justify-between shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-white animate-pulse" />
            <span>ORDER DISTRICT EVACUATION</span>
          </div>
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Button 2: Launch Autonomous Grid (Emerald Green) */}
        <Link
          href={`/autonomous-grid?district=${district.id}&shelters=auto`}
          className="w-full py-2 px-4 rounded-xl bg-[#10E7A2]/15 hover:bg-[#10E7A2]/25 border border-[#10E7A2]/40 hover:border-[#10E7A2] text-[#10E7A2] font-rajdhani font-bold text-xs tracking-wider uppercase flex items-center justify-between transition-all group"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#10E7A2]" />
            <span>LAUNCH AUTONOMOUS GRID</span>
          </div>
          <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        {/* Button 3: Export GIS Report Dropdown */}
        <div className="relative">
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="w-full py-2 px-4 rounded-xl bg-[#050B14]/80 hover:bg-[#00F2FE]/10 border border-[#00F2FE]/30 hover:border-[#00F2FE] text-slate-300 hover:text-[#00F2FE] font-rajdhani font-bold text-xs tracking-wider uppercase flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>EXPORT GIS FLOOD REPORT</span>
            </div>
            <span className="text-[10px] font-share-mono text-[#00F2FE]">RFC 7946</span>
          </button>

          {/* Export Dropdown Menu */}
          {exportMenuOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 p-1.5 rounded-xl bg-[#0F1B2F] border border-[#00F2FE]/40 shadow-[0_10px_25px_rgba(0,0,0,0.8)] z-30 flex flex-col gap-1 animate-in fade-in slide-in-from-top-1">
              <button
                onClick={() => handleExport("geojson")}
                className="w-full p-2 rounded-lg hover:bg-[#00F2FE]/15 flex items-center gap-2 text-xs font-rajdhani font-bold text-slate-200 hover:text-[#00F2FE] transition-colors text-left"
              >
                <FileJson className="w-4 h-4 text-[#00F2FE]" />
                <div className="flex flex-col">
                  <span>GeoJSON Vector Polygons (.geojson)</span>
                  <span className="text-[9px] font-jetbrains text-slate-400">GIS Shapefiles & Contours</span>
                </div>
              </button>

              <button
                onClick={() => handleExport("csv")}
                className="w-full p-2 rounded-lg hover:bg-[#10E7A2]/15 flex items-center gap-2 text-xs font-rajdhani font-bold text-slate-200 hover:text-[#10E7A2] transition-colors text-left"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#10E7A2]" />
                <div className="flex flex-col">
                  <span>District Impact Matrix (.csv)</span>
                  <span className="text-[9px] font-jetbrains text-slate-400">Tabular Asset Damage Assessment</span>
                </div>
              </button>

              <button
                onClick={() => handleExport("pdf")}
                className="w-full p-2 rounded-lg hover:bg-[#FF5E36]/15 flex items-center gap-2 text-xs font-rajdhani font-bold text-slate-200 hover:text-[#FF5E36] transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-[#FF5E36]" />
                <div className="flex flex-col">
                  <span>Official IMD/NDMA Whitepaper (.pdf)</span>
                  <span className="text-[9px] font-jetbrains text-slate-400">Full Inundation Briefing Document</span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Download notice */}
        {downloadNotice && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#10E7A2]/15 border border-[#10E7A2]/30 text-xs font-jetbrains text-[#10E7A2] animate-in fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{downloadNotice}</span>
          </div>
        )}
      </div>

      {/* 4. Critical Infrastructure Summary Cards */}
      <div className="flex flex-col gap-3 pt-2 border-t border-[#1E3A5F]">
        <div className="flex items-center justify-between">
          <span className="text-xs font-rajdhani font-bold uppercase tracking-wider text-slate-300">
            OPERATIONAL ASSETS (TAP TO FOCUS)
          </span>
          <span className="text-[10px] font-jetbrains text-slate-400">
            {districtPois.length} MONITORED
          </span>
        </div>

        {/* Hospital Card */}
        {hospitals.map((hosp) => {
          const { floodDepth, status } = calculatePoiStatus(hosp, surgeLevel);
          const isSelected = selectedPoiId === hosp.id;

          return (
            <div
              key={hosp.id}
              onClick={() => onSelectPoi(hosp)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#EF4444]/20 border-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                  : status === "critical" || status === "flooded"
                  ? "bg-[#050B14]/80 border-[#EF4444]/40 hover:border-[#EF4444]"
                  : "bg-[#050B14]/80 border-[#1E3A5F] hover:border-[#00F2FE]/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#EF4444] shrink-0" />
                  <span className="text-xs font-rajdhani font-bold text-white line-clamp-1">
                    {hosp.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-chakra font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                    status === "critical" || status === "flooded"
                      ? "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40"
                      : "bg-[#10E7A2]/20 text-[#10E7A2] border-[#10E7A2]/40"
                  }`}
                >
                  {status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-jetbrains text-slate-300">
                <div>
                  <span className="text-slate-500 block">FLOOD DEPTH:</span>
                  <span className="font-bold text-[#EF4444]">
                    {floodDepth > 0 ? `+${floodDepth}m at T+28h` : "DRY (0.0m)"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">GENERATOR:</span>
                  <span className="font-bold text-amber-300">
                    {hosp.details.generatorStatus === "below_flood_line" ? "BELOW FLOOD LINE ⚠️" : "SAFE"}
                  </span>
                </div>
              </div>

              <p className="text-[10px] font-rajdhani text-slate-400 mt-2 border-t border-[#1E3A5F]/50 pt-1.5">
                → <span className="text-slate-200">{hosp.actionRecommendation}</span>
              </p>
            </div>
          );
        })}

        {/* Power Grid Card */}
        {substations.map((sub) => {
          const { floodDepth, status } = calculatePoiStatus(sub, surgeLevel);
          const isSelected = selectedPoiId === sub.id;

          return (
            <div
              key={sub.id}
              onClick={() => onSelectPoi(sub)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#F59E0B]/20 border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                  : status === "critical" || status === "flooded"
                  ? "bg-[#050B14]/80 border-[#F59E0B]/40 hover:border-[#F59E0B]"
                  : "bg-[#050B14]/80 border-[#1E3A5F] hover:border-[#00F2FE]/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span className="text-xs font-rajdhani font-bold text-white line-clamp-1">
                    {sub.name}
                  </span>
                </div>
                <span className="text-[9px] font-chakra font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/40">
                  {status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px] font-jetbrains text-slate-300">
                <div>
                  <span className="text-slate-500 block">BASE MSL:</span>
                  <span className="font-bold text-white">+{sub.elevationMsl}m MSL</span>
                </div>
                <div>
                  <span className="text-slate-500 block">SHUTDOWN ETA:</span>
                  <span className="font-bold text-[#FF5E36]">{sub.details.shutdownEta}</span>
                </div>
              </div>

              <p className="text-[10px] font-rajdhani text-slate-400 mt-2 border-t border-[#1E3A5F]/50 pt-1.5">
                → <span className="text-slate-200">{sub.actionRecommendation}</span>
              </p>
            </div>
          );
        })}

        {/* Highway Artery Card */}
        {highways.map((hw) => {
          const { status } = calculatePoiStatus(hw, surgeLevel);
          const isSelected = selectedPoiId === hw.id;

          return (
            <div
              key={hw.id}
              onClick={() => onSelectPoi(hw)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#00F2FE]/20 border-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.3)]"
                  : hw.status === "critical"
                  ? "bg-[#050B14]/80 border-[#FF5E36]/30 hover:border-[#FF5E36]"
                  : "bg-[#050B14]/80 border-[#10E7A2]/30 hover:border-[#10E7A2]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Route className="w-4 h-4 text-[#00F2FE] shrink-0" />
                  <span className="text-xs font-rajdhani font-bold text-white line-clamp-1">
                    {hw.name}
                  </span>
                </div>
                <span
                  className={`text-[9px] font-chakra font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                    hw.status === "safe"
                      ? "bg-[#10E7A2]/20 text-[#10E7A2] border-[#10E7A2]/40"
                      : "bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40"
                  }`}
                >
                  {hw.status === "safe" ? "DRY ROUTE" : "IMPASSABLE"}
                </span>
              </div>

              <div className="flex flex-col gap-1 mt-2 text-[10px] font-jetbrains text-slate-300">
                <div>
                  <span className="text-slate-500">FLOOD CUT: </span>
                  <span className="font-bold text-white">{hw.details.floodCutKm}</span>
                </div>
                <div>
                  <span className="text-slate-500">CONVOY ALTERNATE: </span>
                  <span className="font-bold text-[#10E7A2]">{hw.details.alternateRoute}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
