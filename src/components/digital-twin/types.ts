export type SurgeContourLevel = 0.5 | 1.5 | 3.0 | 4.5;

export type ViewMode3D = "2d" | "3d" | "satellite";

export type RbacRole = "scientist" | "eoc" | "public";

export type InfrastructureType = "hospital" | "shelter" | "substation" | "highway" | "cluster" | "port";

export interface InfrastructurePOI {
  id: string;
  name: string;
  type: InfrastructureType;
  districtId: string;
  coordinates: [number, number]; // [lng, lat]
  elevationMsl: number; // meters above MSL
  groundFloodDepth?: number; // meters of water above ground floor
  status: "safe" | "warning" | "critical" | "flooded";
  details: {
    capacity?: number;
    occupancy?: number;
    patients?: number;
    generatorStatus?: "safe" | "below_flood_line" | "elevated" | "critical";
    gridNodeId?: string;
    loadZone?: string;
    shutdownEta?: string;
    routeId?: string;
    floodCutKm?: string;
    alternateRoute?: string;
    population?: number;
    nearestShelter?: string;
    vessels?: number;
  };
  actionRecommendation: string;
}

export interface DistrictInfo {
  id: string;
  name: string;
  state: string;
  center: [number, number]; // [lng, lat]
  zoom: number;
  coastalLengthKm: number;
  totalAreaKm2: number;
  population: number;
  criticalHospitals: number;
  sheltersCount: number;
  substationsCount: number;
  highwayKm: number;
  riskScore: number; // 0-100
}

export interface StormContext {
  id: string;
  name: string;
  code: string;
  category: string;
  basin: string;
  centralPressureHpa: number;
  maxWindKmh: number;
  landfallEtaHours: number;
  landfallCoords: [number, number];
  landfallLocation: string;
  projectedSurgeMeters: number;
  warningStage: string;
}

export interface TimelineNode {
  hour: number;
  label: string;
  description: string;
  relativeSurgeRatio: number; // 0 to 1 multiplier on peak surge
  inlandIngressKm: number;
  isLandfall?: boolean;
}

export interface ContourLayerState {
  level: SurgeContourLevel;
  label: string;
  color: string;
  visible: boolean;
  affectedAreaKm2: number;
  populationAtRisk: number;
  riskDescription: string;
}

export interface TransectPoint {
  distanceKm: number;
  elevationMsl: number;
  surgeLevelMsl: number;
  name?: string;
  assetType?: InfrastructureType;
}

export interface EvacuationOrderData {
  districtId: string;
  districtName: string;
  threatStage: string;
  surgeHeightAat: number;
  affectedPopulation: number;
  recommendedShelters: string[];
  officerName: string;
  officerBadge: string;
  secondaryOfficer: string;
  evacuationDeadline: string;
  designatedHighways: string[];
  dispatchedAt?: string;
  confirmationCode?: string;
}
