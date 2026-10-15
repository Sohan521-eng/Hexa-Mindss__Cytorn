/**
 * CYCLO-AI Page 8: System Settings & Data Connectors (/settings)
 * Type Definitions & System Architecture Interfaces
 */

export type SettingsCategory = 
  | "satellite-feeds" 
  | "model-engine" 
  | "webhooks" 
  | "api-hub" 
  | "security";

export type FeedHealthStatus = "online" | "degraded" | "unreachable";
export type PrecisionMode = "FP16" | "FP32" | "INT8";
export type SyncFrequency = "15m" | "30m" | "1h" | "manual";
export type WebhookPayloadStandard = "cap-xml" | "cyclo-json";
export type SdkLanguage = "curl" | "python" | "javascript" | "go";

export interface MosdacConfig {
  endpointUrl: string;
  apiKey: string;
  isKeyMasked: boolean;
  channels: {
    tir1: boolean;
    tir2: boolean;
    wv: boolean;
    vis: boolean;
    oscat: boolean;
  };
  healthStatus: FeedHealthStatus;
  latencyMs: number;
  lastPingTime: string;
}

export interface NoaaS3Config {
  bucketUri: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  isAnonymousRead: boolean;
  syncFrequency: SyncFrequency;
  lastSynced: string;
  stagingUsedGb: number;
  stagingMaxGb: number;
  autoPurgeOlderThan48h: boolean;
}

export interface ModelCheckpoint {
  id: string;
  name: string;
  tag: string;
  description: string;
  parametersCount: string;
  backboneArchitecture: string;
  trainingLoss: number;
  pinnTargetLoss: number;
  recommended: boolean;
  isActive: boolean;
}

export interface PinnWeights {
  navierStokesPenalty: number; // lambda_NS (default 0.05)
  coriolisCoeff: number;        // lambda_Coriolis (default 0.02)
  sstThermalCoupling: number;   // lambda_SST (default 0.03)
}

export interface HardwareTelemetry {
  gpuModel: string;
  gpuCoreLoadPercent: number;
  gpuTempCelsius: number;
  fanRpm: number;
  vramUsedGb: number;
  vramTotalGb: number;
  inferenceLatencyMs: number;
  fpsThroughput: number;
  precisionMode: PrecisionMode;
}

export interface WebhookEndpoint {
  id: string;
  name: string;
  agency: string;
  url: string;
  status: "connected" | "retry" | "disabled";
  lastStatusCode: number;
  lastLatencyMs: number;
  triggers: {
    genesis: boolean;
    rapidIntensification: boolean;
    stage3Warning: boolean;
    coastalInundation: boolean;
  };
  payloadStandard: WebhookPayloadStandard;
  hmacSecret: string;
}

export interface ApiToken {
  id: string;
  name: string;
  tokenPrefix: string;
  scope: "read:active_storms" | "predict:trajectory" | "admin:configuration" | "full:institutional";
  rateLimitPerMin: number;
  createdDate: string;
  lastUsedDate: string;
  isRevoked: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  operator: string;
  action: string;
  category: "satellite" | "model" | "webhook" | "api" | "auth";
  ipAddress: string;
  status: "success" | "warning" | "error";
}

export interface SystemSettingsState {
  mosdac: MosdacConfig;
  noaaS3: NoaaS3Config;
  checkpoints: ModelCheckpoint[];
  pinnWeights: PinnWeights;
  hardware: HardwareTelemetry;
  webhooks: WebhookEndpoint[];
  apiTokens: ApiToken[];
  auditLogs: AuditLogEntry[];
}
