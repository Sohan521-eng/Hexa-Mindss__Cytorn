/**
 * CYCLO-AI Page 7: Model Performance & Historical Archive (/model-metrics)
 * Type Definitions & Meteorological Validation Schemas
 * 
 * MATHEMATICAL FORMULATION REFERENCES:
 * 1. Mean Distance Error (MDE) for Track Forecast:
 *    MDE(t) = (1/N) * sum_{i=1}^N D_geodesic((Lat_i_pred, Lon_i_pred), (Lat_i_obs, Lon_i_obs))
 *    where D_geodesic is the Great-Circle distance computed via Haversine.
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

export type ModelCheckpointId = 
  | "v2.4-convnext-vit" 
  | "baseline-resnet50" 
  | "ablated-pure-vit";

export type BenchmarkStormId = 
  | "amphan" 
  | "fani" 
  | "biparjoy" 
  | "mocha";

export type DvorakClassId = 
  | "curved-band" 
  | "eye" 
  | "cdo" 
  | "shear" 
  | "embedded-center";

export interface ModelCheckpointInfo {
  id: ModelCheckpointId;
  name: string;
  badge: string;
  architecture: string;
  description: string;
  overallAccuracy: number; // percentage, e.g. 96.2
  trackError24h: number;   // km, e.g. 48.2
  trackError48h: number;   // km, e.g. 94.6
  intensityMae: number;    // knots, e.g. 7.4
  intensityMaeKmh: number; // km/h, e.g. 13.7
  trainingCorpus: number;  // frames, e.g. 154280
  latencyMs: number;       // ms, e.g. 24
  parametersM: number;     // Million params, e.g. 84.6
  physicsResidual: number; // Navier-Stokes penalty, e.g. 0.0038
}

export interface StormReplayFrame {
  frameIndex: number;
  timestampUtc: string;
  timeLabel: string;
  
  // Verified Ground-Truth (IMD Best-Track)
  latObs: number;
  lonObs: number;
  windObsKts: number;
  windObsKmh: number;
  pressureObsHpa: number;
  
  // CYCLO-AI Model Prediction
  latPred: number;
  lonPred: number;
  windPredKts: number;
  windPredKmh: number;
  pressurePredHpa: number;
  
  // Baseline ResNet-50 Prediction (Comparative)
  latBaseline?: number;
  lonBaseline?: number;
  
  // Instantaneous Error Vectors
  crossTrackErrorKm: number; // Δd
  intensityDeltaKts: number; // ΔV_max
  pressureDeltaHpa: number;  // ΔP
  
  // Dvorak Classification
  dvorakClass: DvorakClassId;
  dvorakTNumber: string;     // e.g. "T-6.5"
  category: string;          // e.g. "Super Cyclone (Cat 5)"
  eyewallRadiusKm: number;
  synopticNotes: string;
}

export interface BenchmarkStormInfo {
  id: BenchmarkStormId;
  name: string;
  year: number;
  basin: string;
  dates: string;
  peakIntensityKmh: number;
  peakIntensityKts: number;
  minPressureHpa: number;
  category: string;
  summary: string;
  landfallLocation: string;
  frames: StormReplayFrame[];
  mapCenter: [number, number]; // [lat, lon]
  mapZoom: number;
}

export interface DvorakClassMeta {
  id: DvorakClassId;
  name: string;
  code: string;
  tRange: string;
  color: string;
  sampleCount: number;
  precision: number;
  recall: number;
  f1Score: number;
  specificity: number;
  description: string;
}

export interface ConfusionMatrixCell {
  actual: DvorakClassId;
  predicted: DvorakClassId;
  count: number;
  percentage: number;
  isDiagonal: boolean;
  notes?: string;
}

export interface RocCurvePoint {
  fpr: number; // False Positive Rate
  tpr: number; // True Positive Rate
}

export interface PrCurvePoint {
  recall: number;
  precision: number;
}

export interface LossEpochPoint {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  crossEntropy: number;
  physicsPenalty: number;
}

export interface DatasetProvenance {
  sensor: string;
  satellite: string;
  percentage: number;
  framesCount: number;
  channels: string[];
  purpose: string;
}

export interface DatasetSplit {
  name: string;
  percentage: number;
  framesCount: number;
  dateRange: string;
  notes: string;
}
