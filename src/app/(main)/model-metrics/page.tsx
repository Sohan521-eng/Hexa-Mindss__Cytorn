"use client";

/**
 * CYCLO-AI Page 7: Model Performance & Historical Archive (/model-metrics)
 * 
 * SYSTEM ARCHITECTURE & INTEGRATION:
 * - Serves as the scientific validation and accountability hub of the CYCLO-AI system.
 * - Receives committed validation runs from Page 4 (/satellite-analyzer), track errors
 *   from Page 5 (/forecast), and benchmark replays from Page 3 (/dashboard).
 * - Links downstream to Page 10 (/physics-lab) and Page 8 (/settings).
 * - Full IMD Best-Track Ground-Truth verification across landmark benchmark cyclones
 *   (Amphan 2020, Fani 2019, Biparjoy 2023, Mocha 2023).
 * 
 * MATHEMATICAL FORMULATION REFERENCES:
 * 1. Mean Distance Error (MDE) for Track Forecast:
 *    MDE(t) = (1/N) * sum_{i=1}^N D_geodesic((Lat_i_pred, Lon_i_pred), (Lat_i_obs, Lon_i_obs))
 *    where D_geodesic is the Great-Circle distance computed via the Haversine formula:
 *    d = 2R * arcsin(sqrt(sin^2(Δlat/2) + cos(lat1)*cos(lat2)*sin^2(Δlon/2)))
 * 
 * 2. Intensity Mean Absolute Error (MAE):
 *    MAE_V = (1/N) * sum_{i=1}^N |V_max_i_pred - V_max_i_obs|
 * 
 * 3. Intensity Root Mean Square Error (RMSE):
 *    RMSE_V = sqrt((1/N) * sum_{i=1}^N (V_max_i_pred - V_max_i_obs)^2)
 * 
 * 4. Physics-Informed Neural Network (PINN) Navier-Stokes Residual:
 *    L_physics = || ∂u/∂t + (u·∇)u + (1/ρ)∇p - ν∇²u - 2(Ω × u) ||² < 0.005
 */

import React, { useState, useMemo, Suspense, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ModelCheckpointId, BenchmarkStormId } from "@/components/model-metrics/types";
import { MODEL_CHECKPOINTS, BENCHMARK_STORMS } from "@/components/model-metrics/benchmarkData";
import { MetricsTopBar } from "@/components/model-metrics/MetricsTopBar";
import { ScorecardsRow } from "@/components/model-metrics/ScorecardsRow";
import { HistoricalReplaySandbox } from "@/components/model-metrics/HistoricalReplaySandbox";
import { DvorakConfusionMatrix } from "@/components/model-metrics/DvorakConfusionMatrix";
import { RocLossConvergenceStudio } from "@/components/model-metrics/RocLossConvergenceStudio";
import { DatasetDemographicsFooter } from "@/components/model-metrics/DatasetDemographicsFooter";
import { FrameTelemetryInspector } from "@/components/model-metrics/FrameTelemetryInspector";
import { generateValidationPdf } from "@/components/model-metrics/exportValidationPdf";

function ModelMetricsContent() {
  const searchParams = useSearchParams();

  // Ingest URL Search Parameters
  const initialBenchmark = (searchParams.get("benchmark")?.toLowerCase() as BenchmarkStormId) || "amphan";
  const initialModel = (searchParams.get("model") as ModelCheckpointId) || "v2.4-convnext-vit";

  const [selectedStormId, setSelectedStormId] = useState<BenchmarkStormId>(
    BENCHMARK_STORMS[initialBenchmark] ? initialBenchmark : "amphan"
  );
  const [selectedModelId, setSelectedModelId] = useState<ModelCheckpointId>(
    MODEL_CHECKPOINTS[initialModel] ? initialModel : "v2.4-convnext-vit"
  );
  const [currentFrameIdx, setCurrentFrameIdx] = useState<number>(0);

  // Synchronize Left & Right Column heights so Active Frame Telemetry and ROC-AUC Studio align at the exact same lower boundary
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const [syncedHeight, setSyncedHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    const leftEl = leftPaneRef.current;
    if (!leftEl) return;

    const syncHeights = () => {
      if (typeof window !== "undefined" && window.innerWidth >= 1280 && leftEl) {
        setSyncedHeight(leftEl.offsetHeight);
      } else {
        setSyncedHeight(undefined);
      }
    };

    syncHeights();
    const ro = new ResizeObserver(syncHeights);
    ro.observe(leftEl);
    window.addEventListener("resize", syncHeights);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", syncHeights);
    };
  }, []);

  const handleSelectStorm = (id: BenchmarkStormId) => {
    setSelectedStormId(id);
    setCurrentFrameIdx(0);
  };

  const activeModel = useMemo(() => {
    return MODEL_CHECKPOINTS[selectedModelId] || MODEL_CHECKPOINTS["v2.4-convnext-vit"];
  }, [selectedModelId]);

  const activeStorm = useMemo(() => {
    return BENCHMARK_STORMS[selectedStormId] || BENCHMARK_STORMS["amphan"];
  }, [selectedStormId]);

  return (
    <div className="w-full max-w-[1720px] mx-auto flex flex-col gap-3.5 sm:gap-4 pb-8">
      {/* ======================================================== */}
      {/* SECTION A: TOP HORIZON BENCHMARK SELECTOR & SCORECARDS   */}
      {/* ======================================================== */}
      <div className="flex flex-col gap-3">
        <MetricsTopBar
          selectedModel={selectedModelId}
          onSelectModel={setSelectedModelId}
          selectedStorm={selectedStormId}
          onSelectStorm={handleSelectStorm}
          onExportPdf={() => generateValidationPdf(activeModel, activeStorm)}
        />

        <ScorecardsRow model={activeModel} />
      </div>

      {/* ======================================================== */}
      {/* CORE SCIENTIFIC LABORATORY SUITE (2-COLUMN GRID)         */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 sm:gap-4 items-start">
        
        {/* LEFT PANE (6 cols on XL): SECTION B - HISTORICAL REPLAY + FRAME TELEMETRY */}
        <div ref={leftPaneRef} className="xl:col-span-6 flex flex-col gap-3.5 sm:gap-4">
          <HistoricalReplaySandbox 
            storm={activeStorm} 
            frameIndex={currentFrameIdx}
            onFrameChange={setCurrentFrameIdx}
          />
          <FrameTelemetryInspector 
            storm={activeStorm}
            currentFrameIdx={currentFrameIdx}
            onSelectFrame={setCurrentFrameIdx}
          />
        </div>

        {/* RIGHT PANE (6 cols on XL): SECTION C & SECTION D */}
        <div 
          style={{ height: syncedHeight ? `${syncedHeight}px` : undefined }}
          className="xl:col-span-6 flex flex-col gap-3.5 sm:gap-4"
        >
          {/* SECTION C: DVORAK MULTI-CLASS CONFUSION MATRIX */}
          <DvorakConfusionMatrix />

          {/* SECTION D: ROC-AUC & LOSS CONVERGENCE STUDIO */}
          <RocLossConvergenceStudio />
        </div>

      </div>

      {/* ======================================================== */}
      {/* SECTION E: DATASET DEMOGRAPHICS & DOWNSTREAM ACTIONS     */}
      {/* ======================================================== */}
      <DatasetDemographicsFooter
        selectedStorm={selectedStormId}
        selectedModel={selectedModelId}
      />



    </div>
  );
}

export default function ModelMetricsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-[#050B14] text-[#00F2FE] font-mono text-xs">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#00F2FE] animate-ping" />
          <span>INITIALIZING MODEL PERFORMANCE &amp; HISTORICAL ARCHIVE...</span>
        </div>
      </div>
    }>
      <ModelMetricsContent />
    </Suspense>
  );
}
