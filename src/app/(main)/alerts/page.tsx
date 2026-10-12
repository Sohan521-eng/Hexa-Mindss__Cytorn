"use client";

/**
 * CYCLO-AI Page 6: Disaster Early Warning & Coastal Alert Hub (/alerts)
 * 
 * SYSTEM ARCHITECTURE & INTEGRATION:
 * - Operates as the Emergency Decision-Support Center for NDMA, SDMA, and District Magistrates.
 * - Converts raw meteorological telemetry from Page 5 (/forecast) and Page 3 (/dashboard)
 *   into actionable life-safety warnings, district vulnerability tables, multi-lingual public bulletins,
 *   and Common Alerting Protocol (CAP) emergency cell broadcasts.
 * - Downstream integration links to Page 9 (/digital-twin) and Page 11 (/autonomous-grid).
 * - Full IMD 4-Stage Warning Protocol (-72h Watch, -48h Alert, -24h Warning, +12h Outlook).
 */

import React, { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCycloneStore } from "@/store/useCycloneStore";

import { 
  AlertStageNumber, 
  DistrictVulnerability, 
  MultiLingualBulletin 
} from "@/components/alerts/types";
import { 
  COASTAL_DISTRICTS_DATA, 
  MULTI_LINGUAL_BULLETINS 
} from "@/components/alerts/alertsData";

import { AlertsTopBar } from "@/components/alerts/AlertsTopBar";
import { ImdWarningBanner } from "@/components/alerts/ImdWarningBanner";
import { DistrictVulnerabilityMatrix } from "@/components/alerts/DistrictVulnerabilityMatrix";
import { CoastalInundationMap } from "@/components/alerts/CoastalInundationMap";
import { MultiLingualBulletinGenerator } from "@/components/alerts/MultiLingualBulletinGenerator";
import { CapBroadcastSimulator } from "@/components/alerts/CapBroadcastSimulator";
import { AlertsFooterActions } from "@/components/alerts/AlertsFooterActions";

import { EvacuationOrderModal } from "@/components/alerts/EvacuationOrderModal";
import { Broadcast2FaModal } from "@/components/alerts/Broadcast2FaModal";
import { BulletinPdfModal } from "@/components/alerts/BulletinPdfModal";

function AlertsHubContent() {
  const searchParams = useSearchParams();
  const { activeStormId } = useCycloneStore();

  // Ingest URL search parameters (e.g., from /forecast or /dashboard)
  const stormParam = searchParams.get("storm") || "MOCHA";
  const districtParam = searchParams.get("district") || "od-puri";
  const stageParam = searchParams.get("stage");
  const stateParam = searchParams.get("state") || "Odisha";

  // System State Management
  const [selectedState, setSelectedState] = useState<string>(stateParam);
  const [activeStage] = useState<AlertStageNumber>(3); // Active live warning is Stage 3
  const [selectedStageFilter, setSelectedStageFilter] = useState<AlertStageNumber>(
    stageParam ? (parseInt(stageParam, 10) as AlertStageNumber) : 3
  );

  // Selected district for map zoom & matrix isolation
  const initialDistrict = useMemo(() => {
    return (
      COASTAL_DISTRICTS_DATA.find((d) => d.id === districtParam || d.name.toLowerCase() === districtParam.toLowerCase()) ||
      COASTAL_DISTRICTS_DATA[0] // Puri default
    );
  }, [districtParam]);

  const [selectedDistrict, setSelectedDistrict] = useState<DistrictVulnerability>(initialDistrict);

  // Modals state management
  const [isEvacuationModalOpen, setIsEvacuationModalOpen] = useState(false);
  const [targetEvacDistrict, setTargetEvacDistrict] = useState<DistrictVulnerability | null>(null);

  const [is2FaModalOpen, setIs2FaModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Handler for row/pin selection
  const handleSelectDistrict = (district: DistrictVulnerability) => {
    setSelectedDistrict(district);
  };

  const handleSelectDistrictById = (districtId: string) => {
    const found = COASTAL_DISTRICTS_DATA.find((d) => d.id === districtId);
    if (found) {
      setSelectedDistrict(found);
    }
  };

  // Handler for opening evacuation modal
  const handleOpenEvacuationModal = (district: DistrictVulnerability) => {
    setTargetEvacDistrict(district);
    setIsEvacuationModalOpen(true);
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto space-y-4 sm:space-y-6 pb-12">
      
      {/* 1. MASTER COMMAND HEADER */}
      <AlertsTopBar
        stormName="Cyclone MOCHA"
        stormCode="BOB-02"
        selectedState={selectedState}
        onSelectState={setSelectedState}
        allDistricts={COASTAL_DISTRICTS_DATA}
        activeStage={activeStage}
      />

      {/* 2. SECTION A: OFFICIAL IMD 4-STAGE WARNING BANNER (TOP HORIZON) */}
      <ImdWarningBanner
        activeStage={activeStage}
        selectedStageFilter={selectedStageFilter}
        onSelectStageFilter={setSelectedStageFilter}
        landfallTime="Tomorrow 18:30 IST • Puri Coast"
        surgeHeightM={selectedDistrict?.stormSurgeM || 3.4}
        lastIssuedIst="06:00 IST"
      />

      {/* 3. CORE EOC 2-COLUMN HIGH-DENSITY OPERATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* === LEFT PANE (lg:col-span-6 xl:col-span-6) === */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-4 sm:space-y-6">
          
          {/* SECTION C: 2D COASTAL INUNDATION & INFRASTRUCTURE MAP (LEFT - TOP) */}
          <div className="flex-1 min-h-[460px] lg:min-h-[500px]">
            <CoastalInundationMap
              selectedDistrict={selectedDistrict}
              onSelectDistrictById={handleSelectDistrictById}
              onOpenEvacModal={handleOpenEvacuationModal}
            />
          </div>

          {/* SECTION D: AUTOMATED MULTI-LINGUAL BULLETIN GENERATOR (LEFT - BOTTOM) */}
          <div className="flex-1 min-h-[460px] lg:min-h-[500px]">
            <MultiLingualBulletinGenerator
              onOpenPdfModal={() => setIsPdfModalOpen(true)}
            />
          </div>

        </div>

        {/* === RIGHT PANE (lg:col-span-6 xl:col-span-6) === */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col space-y-4 sm:space-y-6">
          
          {/* SECTION B: DISTRICT-LEVEL IMPACT & VULNERABILITY MATRIX (RIGHT - TOP) */}
          <div className="flex-1 min-h-[460px] lg:min-h-[500px]">
            <DistrictVulnerabilityMatrix
              districts={COASTAL_DISTRICTS_DATA}
              selectedDistrict={selectedDistrict}
              onSelectDistrict={handleSelectDistrict}
              onOpenEvacuationModal={handleOpenEvacuationModal}
              selectedStateFilter={selectedState}
            />
          </div>

          {/* SECTION E: COMMON ALERTING PROTOCOL (CAP) EMERGENCY BROADCAST SIMULATOR (RIGHT - BOTTOM) */}
          <div className="flex-1 min-h-[460px] lg:min-h-[500px]">
            <CapBroadcastSimulator
              onOpen2FaModal={() => setIs2FaModalOpen(true)}
              activeStormName="Cyclone MOCHA"
            />
          </div>

        </div>

      </div>

      {/* 4. DOWNSTREAM PIPELINE ACTIONS STRIP (FOOTER) */}
      <AlertsFooterActions
        stormParam={stormParam}
        selectedDistrictName={selectedDistrict?.name || "Puri"}
      />

      {/* 5. INTERACTIVE MODALS & 2FA DIALOGS */}
      {/* Evacuation Order Modal */}
      <EvacuationOrderModal
        isOpen={isEvacuationModalOpen}
        onClose={() => setIsEvacuationModalOpen(false)}
        district={targetEvacDistrict || selectedDistrict}
      />

      {/* Broadcast 2FA Modal */}
      <Broadcast2FaModal
        isOpen={is2FaModalOpen}
        onClose={() => setIs2FaModalOpen(false)}
        activeStormName="Cyclone MOCHA"
      />

      {/* Official Government PDF Bulletin Preview Modal */}
      <BulletinPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        bulletin={MULTI_LINGUAL_BULLETINS.en}
      />

    </div>
  );
}

export default function AlertsHubPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-center">
          <div className="p-6 rounded-2xl bg-[#0F1B2F]/80 border border-[rgba(0,242,254,0.2)] backdrop-blur-xl shadow-2xl space-y-3">
            <div className="w-10 h-10 border-4 border-[#00F2FE] border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="font-orbitron font-bold text-white text-base tracking-wider">
              CYCLO-AI DISASTER ALERT HUB
            </div>
            <div className="font-mono text-xs text-slate-400">
              Initializing IMD 4-Stage Warning Protocol & Hydrodynamic Telemetry...
            </div>
          </div>
        </div>
      }
    >
      <AlertsHubContent />
    </Suspense>
  );
}
