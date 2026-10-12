/**
 * CYCLO-AI Page 6: Disaster Early Warning & Coastal Alert Hub (/alerts)
 * TypeScript Data Models & Contract Definitions
 * 
 * Standards Reference:
 * - IMD Standard Operating Procedure for Cyclone Warning in India
 * - NDMA National Cyclone Risk Mitigation Project (NCRMP)
 * - ITU-T X.1303 Common Alerting Protocol (CAP v1.2)
 */

export type AlertStageNumber = 1 | 2 | 3 | 4;

export interface AlertStageConfig {
  stage: AlertStageNumber;
  name: string;
  subName: string;
  timeWindow: string;
  colorHex: string;
  bgHex: string;
  borderHex: string;
  textHex: string;
  pulse: boolean;
  description: string;
  actionSummary: string;
  colorBadgeClass: string;
}

export type SeverityTier = "catastrophic" | "severe" | "moderate" | "minor";

export type EvacuationPriorityLevel = "IMMEDIATE" | "HIGH" | "STANDBY" | "MONITOR";

export interface DistrictVulnerability {
  id: string;
  name: string;
  state: "Odisha" | "West Bengal" | "Andhra Pradesh" | "Tamil Nadu" | "Gujarat";
  severity: SeverityTier;
  peakGustKmh: number;
  rainfall24hMm: number;
  stormSurgeM: number;
  evacuationPriority: EvacuationPriorityLevel;
  distanceToCoastKm: number;
  populationAtRisk: number;
  sheltersTotal: number;
  sheltersOccupancy: number; // percentage
  shelterBedsAvailable: number;
  coastalZoneLabel: string; // e.g. "0 - 5 km Shoreline"
  coordinates: {
    lat: number;
    lng: number;
  };
  keyAssets: {
    hospitals: number;
    substations: number;
    shelters: number;
  };
  recommendedAction: string;
}

export type InfrastructureType = "hospital" | "shelter" | "substation" | "highway";

export interface InfrastructureNode {
  id: string;
  name: string;
  type: InfrastructureType;
  districtId: string;
  districtName: string;
  lat: number;
  lng: number;
  mapX: number; // Normalized coordinate for 2D canvas (0 - 100)
  mapY: number; // Normalized coordinate for 2D canvas (0 - 100)
  status: "critical" | "warning" | "operational" | "offline";
  // Specific properties
  floodRiskM: number;
  generatorHealth?: "100% Ready (Diesel 72h)" | "85% Operational" | "Warning: Low Fuel" | "Inundated / Offline";
  shelterCapacity?: number;
  shelterOccupants?: number;
  rampStatus?: "All-Weather Elevated" | "Ground-Level Barrier" | "Ramp Blocked";
  voltageTier?: "33kV" | "11kV" | "132kV Grid Node";
  shutdownScheduled?: boolean;
  shutdownStatus?: "Active" | "Scheduled Trip in 2h" | "Precautionary Cutoff" | "Substation Safe";
  highwayCode?: string;
  highwayCondition?: "Flooded (Water Depth 0.8m)" | "Critical Watch (0.3m)" | "Dry Evacuation Arterial" | "Rerouting Mandated";
  detourRoute?: string;
}

export type SurgeContourLevel = 0.5 | 1.5 | 3.0 | 5.0;

export type BulletinLanguageCode = "en" | "hi" | "bn" | "or" | "ta" | "te" | "gu";

export interface BulletinLanguageMeta {
  code: BulletinLanguageCode;
  label: string;
  nativeLabel: string;
  region: string;
}

export interface MultiLingualBulletin {
  language: BulletinLanguageCode;
  bulletinNumber: string;
  issueDateTimeIst: string;
  warningStage: string;
  stormName: string;
  intensityCategory: string;
  centerCoordinates: string;
  currentWindKnots: number;
  currentWindKmh: number;
  centralPressureHpa: number;
  landfallForecast: {
    expectedWindow: string;
    coastalTarget: string;
    peakSurgeHeightM: number;
    inundationReachKm: number;
  };
  damageExpectation: {
    thatchedHouses: string;
    powerLines: string;
    standingCrops: string;
    transportRoads: string;
  };
  civilAdvisory: {
    fishermenWarning: string;
    portSignals: string;
    evacuationMandate: string;
    emergencyHelpline: string;
  };
  fullDispatchParagraphs: string[];
}

export interface CapXmlPayload {
  identifier: string;
  sender: string;
  sentIso: string;
  status: "Actual" | "Exercise" | "Test";
  msgType: "Alert" | "Update" | "Cancel";
  scope: "Public" | "Restricted";
  category: "Met" | "Safety" | "Security";
  event: string;
  urgency: "Immediate" | "Expected" | "Future";
  severity: "Extreme" | "Severe" | "Moderate";
  certainty: "Observed" | "Likely" | "Possible";
  headline: string;
  description: string;
  instruction: string;
  areaDesc: string;
  circleCoordinates: string;
  contact: string;
  web: string;
}

export interface EvacuationOrderData {
  orderId: string;
  timestampIst: string;
  districtId: string;
  districtName: string;
  stateName: string;
  mandatedBy: string;
  priorityScore: EvacuationPriorityLevel;
  totalPopulationToEvacuate: number;
  designatedSheltersCount: number;
  ndrfBattalionsDeployed: number;
  odrafTeamsDeployed: number;
  transportBusesAssigned: number;
  medicalTriageTeams: number;
  curfewDeclared: boolean;
  cutoffDeadlineIst: string;
  assemblyPoints: string[];
  authorizedOfficer: string;
}
