"use client";

/**
 * CYCLO-AI Page 9: Hyper-Local Coastal Inundation Digital Twin (/digital-twin)
 * 
 * SYSTEM ARCHITECTURE & INTEGRATION:
 * - Operates as the "Satellite-to-Street" Translator of CYCLO-AI.
 * - Ingests pre-computed storm surge parameters from Page 5 (/forecast) and Page 6 (/alerts).
 * - Visualizes sub-street-level flood impacts on roads, hospitals, power substations,
 *   and coastal villages hours before water arrives.
 * - Multi-tier bathtub hydrodynamic inundation model contours (0.5m, 1.5m, 3.0m, 4.5m+).
 * - Interactive 3D oblique tilt perspective, distance ruler, elevation transects, and T+0h to T+72h timeline.
 * - Direct downstream integration: Launches Autonomous Disaster Grid (/autonomous-grid) and Evacuation Orders.
 */

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCycloneStore } from "@/store/useCycloneStore";

import { 
  StormContext, 
  DistrictInfo, 
  ViewMode3D, 
  SurgeContourLevel, 
  InfrastructureType, 
  InfrastructurePOI, 
  RbacRole 
} from "@/components/digital-twin/types";
import { 
  STORMS_REGISTRY, 
  DISTRICTS_REGISTRY, 
  CRITICAL_INFRASTRUCTURE 
} from "@/components/digital-twin/digitalTwinData";

import { TwinCommandBar } from "@/components/digital-twin/TwinCommandBar";
import { SurgeLevelSlider } from "@/components/digital-twin/SurgeLevelSlider";
import { DigitalTwinMap } from "@/components/digital-twin/DigitalTwinMap";
import { SurgeTimeline } from "@/components/digital-twin/SurgeTimeline";
import { DistrictImpactRail } from "@/components/digital-twin/DistrictImpactRail";
import { ElevationTransectModal } from "@/components/digital-twin/ElevationTransectModal";
import { EvacuationOrderModal } from "@/components/digital-twin/EvacuationOrderModal";

function DigitalTwinContent() {
  const searchParams = useSearchParams();
  const { activeStormId } = useCycloneStore();

  // Ingest query parameters: ?surge=, ?storm=, ?district=, ?lat=, ?lng=
  const surgeParam = searchParams.get("surge");
  const stormParam = searchParams.get("storm");
  const districtParam = searchParams.get("district");

  // 1. Initial Storm Context
  const initialStorm = useMemo(() => {
    if (stormParam) {
      const match = Object.values(STORMS_REGISTRY).find(
        (s) => s.code.toLowerCase() === stormParam.toLowerCase() || s.id.toLowerCase().includes(stormParam.toLowerCase())
      );
      if (match) return match;
    }
    return STORMS_REGISTRY["arnab"];
  }, [stormParam]);

  // 2. Initial District Context
  const initialDistrict = useMemo(() => {
    if (districtParam) {
      const key = districtParam.toLowerCase().replace("od-", "").replace("-", "");
      if (DISTRICTS_REGISTRY[key]) return DISTRICTS_REGISTRY[key];
    }
    return DISTRICTS_REGISTRY["puri"];
  }, [districtParam]);

  // 3. Initial Surge Seed
  const initialSurge = useMemo(() => {
    if (surgeParam) {
      const parsed = parseFloat(surgeParam.replace("m", ""));
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return initialStorm.projectedSurgeMeters || 3.4;
  }, [surgeParam, initialStorm]);

  // Reactive State
  const [selectedStorm, setSelectedStorm] = useState<StormContext>(initialStorm);
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictInfo>(initialDistrict);
  const [surgeLevel, setSurgeLevel] = useState<number>(initialSurge);
  const [viewMode, setViewMode] = useState<ViewMode3D>("3d");
  const [rbacRole, setRbacRole] = useState<RbacRole>("eoc");

  // Contour Layers
  const [visibleContours, setVisibleContours] = useState<Record<SurgeContourLevel, boolean>>({
    0.5: true,
    1.5: true,
    3.0: true,
    4.5: true,
  });
  const [contourOpacity, setContourOpacity] = useState<number>(0.65);

  // Infrastructure Layers
  const [visibleLayers, setVisibleLayers] = useState<Record<InfrastructureType, boolean>>({
    hospital: true,
    shelter: true,
    substation: true,
    highway: true,
    cluster: true,
    port: true,
  });

  // Timeline Scrubber State (T+0h to T+72h)
  const [currentHour, setCurrentHour] = useState<number>(28); // default to landfall T+28h
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  // Selected POI for inspection
  const [selectedPoi, setSelectedPoi] = useState<InfrastructurePOI | null>(null);

  // Modals
  const [isEvacModalOpen, setIsEvacModalOpen] = useState<boolean>(false);
  const [isTransectModalOpen, setIsTransectModalOpen] = useState<boolean>(false);

  // Sync storm updates
  const handleSelectStorm = (storm: StormContext) => {
    setSelectedStorm(storm);
    setSurgeLevel(storm.projectedSurgeMeters);
  };

  // Toggle individual contour layer
  const handleToggleContour = (level: SurgeContourLevel) => {
    setVisibleContours((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  // Toggle individual infrastructure layer
  const handleToggleLayer = (type: InfrastructureType) => {
    setVisibleLayers((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-[#050B14] text-white overflow-hidden relative">
      
      {/* 1. TOP OPERATIONAL COMMAND BAR (#twin-command-bar) */}
      <TwinCommandBar
        selectedStorm={selectedStorm}
        onSelectStorm={handleSelectStorm}
        selectedDistrict={selectedDistrict}
        onSelectDistrict={setSelectedDistrict}
        surgeLevel={surgeLevel}
        onSelectSurgeLevel={setSurgeLevel}
        rbacRole={rbacRole}
        onChangeRbacRole={setRbacRole}
      />

      {/* 2. 3D EOC TACTICAL DASHBOARD VIEWPORT */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* LEFT CONTROLS RAIL (#twin-controls-rail) */}
        <SurgeLevelSlider
          surgeLevel={surgeLevel}
          onSurgeChange={setSurgeLevel}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          visibleContours={visibleContours}
          onToggleContour={handleToggleContour}
          contourOpacity={contourOpacity}
          onContourOpacityChange={setContourOpacity}
          visibleLayers={visibleLayers}
          onToggleLayer={handleToggleLayer}
          landfallEtaHours={selectedStorm.landfallEtaHours}
        />

        {/* CENTER: 3D COASTAL INUNDATION MAP CANVAS & TIMELINE */}
        <div className="flex-1 flex flex-col min-h-[500px] overflow-hidden relative">
          <DigitalTwinMap
            district={selectedDistrict}
            storm={selectedStorm}
            surgeLevel={surgeLevel}
            currentHour={currentHour}
            viewMode={viewMode}
            visibleContours={visibleContours}
            contourOpacity={contourOpacity}
            visibleLayers={visibleLayers}
            selectedPoi={selectedPoi}
            onSelectPoi={setSelectedPoi}
            onOpenTransectModal={() => setIsTransectModalOpen(true)}
          />

          {/* SURGE TIMELINE SCRUBBER (#surge-timeline-scrubber) */}
          <SurgeTimeline
            currentHour={currentHour}
            onHourChange={setCurrentHour}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            playbackSpeed={playbackSpeed}
            onSpeedChange={setPlaybackSpeed}
            maxSurgeLevel={surgeLevel}
          />
        </div>

        {/* RIGHT DISTRICT IMPACT INTELLIGENCE RAIL (#district-impact-rail) */}
        <DistrictImpactRail
          district={selectedDistrict}
          storm={selectedStorm}
          surgeLevel={surgeLevel}
          rbacRole={rbacRole}
          onOpenEvacModal={() => setIsEvacModalOpen(true)}
          onSelectPoi={setSelectedPoi}
          selectedPoiId={selectedPoi?.id || null}
        />

      </div>

      {/* 3. MODALS */}
      {/* Evacuation Order Modal (#evac-order-modal) */}
      <EvacuationOrderModal
        isOpen={isEvacModalOpen}
        onClose={() => setIsEvacModalOpen(false)}
        district={selectedDistrict}
        storm={selectedStorm}
        surgeLevel={surgeLevel}
      />

      {/* Elevation Transect Cross-Section Modal */}
      <ElevationTransectModal
        isOpen={isTransectModalOpen}
        onClose={() => setIsTransectModalOpen(false)}
        currentSurgeMeters={surgeLevel}
      />

    </div>
  );
}

export default function DigitalTwinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050B14] flex items-center justify-center text-[#00F2FE] font-rajdhani text-lg">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-2 border-[#00F2FE] border-t-transparent rounded-full animate-spin" />
            <span>INITIALIZING COASTAL INUNDATION DIGITAL TWIN...</span>
          </div>
        </div>
      }
    >
      <DigitalTwinContent />
    </Suspense>
  );
}
