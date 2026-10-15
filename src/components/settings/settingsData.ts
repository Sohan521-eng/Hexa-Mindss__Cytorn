import { SystemSettingsState } from "./types";

/**
 * CYCLO-AI Page 8: System Settings & Data Connectors
 * Initial Operational Ground Truth & Mock Telemetry State
 */
export const initialSettingsState: SystemSettingsState = {
  mosdac: {
    endpointUrl: "https://api.mosdac.gov.in/v2/insat3d/open",
    apiKey: "mosdac_live_98f4a1c720d6b83e491f0c29ae883f91",
    isKeyMasked: true,
    channels: {
      tir1: true,
      tir2: true,
      wv: true,
      vis: true,
      oscat: false,
    },
    healthStatus: "online",
    latencyMs: 18,
    lastPingTime: "2 mins ago",
  },
  noaaS3: {
    bucketUri: "s3://noaa-goes16/abi-l2-cmip/",
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    region: "us-east-1",
    isAnonymousRead: true,
    syncFrequency: "15m",
    lastSynced: "14 mins ago",
    stagingUsedGb: 18.4,
    stagingMaxGb: 50.0,
    autoPurgeOlderThan48h: true,
  },
  checkpoints: [
    {
      id: "v2.4-convnext-vit-ensemble",
      name: "v2.4-convnext-vit-ensemble",
      tag: "ACTIVE & RECOMMENDED",
      description: "Dual-branch multi-spectral feature extractor fused with spatial Vision Transformer. Optimized for North Indian Ocean cyclone tracks.",
      parametersCount: "87.4M params",
      backboneArchitecture: "ConvNeXt-V2-Base + ViT-B/16 Multi-Head Cross Attention",
      trainingLoss: 0.0038,
      pinnTargetLoss: 0.0050,
      recommended: true,
      isActive: true,
    },
    {
      id: "v2.3-swin-transformer-large",
      name: "v2.3-swin-transformer-large",
      tag: "HIGH RESOLUTION",
      description: "Hierarchical Shifted-Window Attention network specialized in large-radius curved spiral cloud bands and eye boundary localization.",
      parametersCount: "112.1M params",
      backboneArchitecture: "Swin-L with Cross-Scale Cyclic Patch Merging",
      trainingLoss: 0.0049,
      pinnTargetLoss: 0.0050,
      recommended: false,
      isActive: false,
    },
    {
      id: "v2.1-resnet50-baseline",
      name: "v2.1-resnet50-baseline",
      tag: "LEGACY BENCHMARK",
      description: "Standard deep residual convolutional baseline with Squeeze-and-Excitation channel gating for regression comparisons.",
      parametersCount: "25.6M params",
      backboneArchitecture: "ResNet-50-SE with 7x7 Multi-Spectral Stem",
      trainingLoss: 0.0092,
      pinnTargetLoss: 0.0100,
      recommended: false,
      isActive: false,
    },
    {
      id: "v3.0-experimental-mamba-vision",
      name: "v3.0-experimental-mamba-vision",
      tag: "EXPERIMENTAL SSM",
      description: "State-Space Model (SSM) enabling linear-time compute scaling across 72-hour temporal sequence satellite image series.",
      parametersCount: "64.2M params",
      backboneArchitecture: "Bidirectional 2D-Selective-Scan Mamba State-Space Block",
      trainingLoss: 0.0034,
      pinnTargetLoss: 0.0050,
      recommended: false,
      isActive: false,
    },
  ],
  pinnWeights: {
    navierStokesPenalty: 0.05,
    coriolisCoeff: 0.02,
    sstThermalCoupling: 0.03,
  },
  hardware: {
    gpuModel: "NVIDIA RTX 4090 / A100 SXM4 (24 GB VRAM)",
    gpuCoreLoadPercent: 68,
    gpuTempCelsius: 62,
    fanRpm: 2450,
    vramUsedGb: 14.2,
    vramTotalGb: 24.0,
    inferenceLatencyMs: 24.8,
    fpsThroughput: 40.3,
    precisionMode: "FP16",
  },
  webhooks: [
    {
      id: "sdma-odisha",
      name: "Odisha SDMA (OSDMA)",
      agency: "Special Relief Commissioner, Government of Odisha",
      url: "https://osdma.odisha.gov.in/api/v1/cyclone-alerts",
      status: "connected",
      lastStatusCode: 200,
      lastLatencyMs: 34,
      triggers: {
        genesis: true,
        rapidIntensification: true,
        stage3Warning: true,
        coastalInundation: true,
      },
      payloadStandard: "cap-xml",
      hmacSecret: "cyclo_sec_99a84f3e12bc44d0",
    },
    {
      id: "sdma-wb",
      name: "West Bengal Disaster Management (WBDMD)",
      agency: "Department of Disaster Management & Civil Defence, West Bengal",
      url: "https://wbdmd.gov.in/hooks/early-warning",
      status: "connected",
      lastStatusCode: 200,
      lastLatencyMs: 41,
      triggers: {
        genesis: true,
        rapidIntensification: true,
        stage3Warning: true,
        coastalInundation: true,
      },
      payloadStandard: "cyclo-json",
      hmacSecret: "cyclo_sec_b4109e2fa875d19c",
    },
    {
      id: "sdma-ap",
      name: "Andhra Pradesh SDMA (APSDMA)",
      agency: "Revenue (Disaster Management) Department, Andhra Pradesh",
      url: "https://apsdma.ap.gov.in/telemetry/inbound",
      status: "connected",
      lastStatusCode: 200,
      lastLatencyMs: 52,
      triggers: {
        genesis: true,
        rapidIntensification: true,
        stage3Warning: true,
        coastalInundation: false,
      },
      payloadStandard: "cyclo-json",
      hmacSecret: "cyclo_sec_7a23c01bf668e4a9",
    },
    {
      id: "sdma-tn",
      name: "Tamil Nadu Disaster Agency (TNDMA)",
      agency: "State Emergency Operations Centre, Chennai",
      url: "https://tndma.tn.gov.in/cap-listener",
      status: "connected",
      lastStatusCode: 200,
      lastLatencyMs: 39,
      triggers: {
        genesis: false,
        rapidIntensification: true,
        stage3Warning: true,
        coastalInundation: true,
      },
      payloadStandard: "cap-xml",
      hmacSecret: "cyclo_sec_ee5108c9d2f47a61",
    },
  ],
  apiTokens: [
    {
      id: "tok-1",
      name: "IMD Institutional EOC Stream",
      tokenPrefix: "cyc_live_98e1••••••••420b",
      scope: "read:active_storms",
      rateLimitPerMin: 1200,
      createdDate: "2026-09-01",
      lastUsedDate: "1 min ago",
      isRevoked: false,
    },
    {
      id: "tok-2",
      name: "INCOIS Coastal Surge Modeler",
      tokenPrefix: "cyc_live_73a2••••••••91cf",
      scope: "predict:trajectory",
      rateLimitPerMin: 600,
      createdDate: "2026-09-18",
      lastUsedDate: "14 mins ago",
      isRevoked: false,
    },
    {
      id: "tok-3",
      name: "Odisha EOC Mission Command",
      tokenPrefix: "cyc_live_12c9••••••••550a",
      scope: "admin:configuration",
      rateLimitPerMin: 300,
      createdDate: "2026-10-02",
      lastUsedDate: "3 hours ago",
      isRevoked: false,
    },
  ],
  auditLogs: [
    {
      id: "log-1",
      timestamp: "2026-10-15 08:30:12 UTC",
      operator: "Dr. S. Mukherjee",
      action: "Model checkpoint swapped to v2.4-convnext-vit-ensemble [Hot-Swap Online]",
      category: "model",
      ipAddress: "10.244.12.8",
      status: "success",
    },
    {
      id: "log-2",
      timestamp: "2026-10-15 07:15:40 UTC",
      operator: "Dr. S. Mukherjee",
      action: "MOSDAC API Key credential rotated with AES-256 seal",
      category: "satellite",
      ipAddress: "10.244.12.8",
      status: "success",
    },
    {
      id: "log-3",
      timestamp: "2026-10-15 06:00:00 UTC",
      operator: "System Daemon",
      action: "Dispatched automated Stage 3 warning payload to Odisha SDMA (HTTP 200 OK)",
      category: "webhook",
      ipAddress: "127.0.0.1",
      status: "success",
    },
    {
      id: "log-4",
      timestamp: "2026-10-15 04:45:19 UTC",
      operator: "Dr. P. Roy",
      action: "Adjusted PINN Navier-Stokes loss penalty weight to λ_NS = 0.05",
      category: "model",
      ipAddress: "10.244.15.19",
      status: "success",
    },
    {
      id: "log-5",
      timestamp: "2026-10-15 03:12:00 UTC",
      operator: "System Watchdog",
      action: "NOAA S3 Ingestion Pipeline auto-sync executed (3.2 GB NetCDF ingested)",
      category: "satellite",
      ipAddress: "127.0.0.1",
      status: "success",
    },
    {
      id: "log-6",
      timestamp: "2026-10-14 22:50:33 UTC",
      operator: "Admin EOC",
      action: "Generated scoped Bearer token 'INCOIS Coastal Surge Modeler'",
      category: "api",
      ipAddress: "10.244.12.8",
      status: "success",
    },
  ],
};

/**
 * OpenAPI 3.1 Documentation Sample Endpoints
 */
export const openApiEndpoints = [
  {
    method: "GET",
    path: "/api/v1/cyclone/active",
    summary: "Query Active Indian Ocean Cyclonic Storms & Dvorak T-Numbers",
    description: "Returns currently tracked Low Level Circulation Centers (LLCC), maximum sustained surface wind speeds, central pressure estimates, and warning stage designations.",
    sampleRequest: `curl -X GET "https://api.cyclo-ai.imd.gov.in/api/v1/cyclone/active" \\
  -H "Authorization: Bearer cyc_live_98e1••••••••420b" \\
  -H "Accept: application/json"`,
    sampleResponse: {
      system: "CYCLO-AI Operational Core v2.4",
      timestamp: "2026-10-15T09:30:00Z",
      active_cyclones_count: 1,
      data: [
        {
          storm_id: "BOB-02-2020",
          name: "Super Cyclone AMPHAN",
          basin: "North Indian Ocean (Bay of Bengal)",
          current_llcc: {
            latitude: 19.8,
            longitude: 86.9,
            coordinates_string: "19.8°N, 86.9°E",
          },
          intensity: {
            max_sustained_wind_kts: 130,
            max_sustained_wind_kmh: 240,
            central_pressure_hpa: 926,
            dvorak_t_number: "T-6.5",
            category: "Super Cyclonic Storm (SuCS)",
          },
          warning_stage: "Stage 3 (Cyclone Warning - Red Alert)",
          projected_landfall: {
            location: "Digha, West Bengal Coast",
            eta: "2020-05-20T11:30:00Z",
            surge_height_m: 3.8,
          },
        },
      ],
    },
  },
  {
    method: "POST",
    path: "/api/v1/predict/trajectory",
    summary: "Deep Learning Forward Trajectory & Intensity Prediction",
    description: "Submits current cyclone coordinate state and multi-spectral satellite tensor to generate 120-hour forecast points with cone-of-uncertainty polygons.",
    sampleRequest: `curl -X POST "https://api.cyclo-ai.imd.gov.in/api/v1/predict/trajectory" \\
  -H "Authorization: Bearer cyc_live_98e1••••••••420b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "storm_id": "BOB-02-2020",
    "forecast_horizon_hours": 72,
    "model_checkpoint": "v2.4-convnext-vit-ensemble",
    "include_uncertainty_cone": true,
    "current_state": {
      "lat": 19.8,
      "lon": 86.9,
      "v_max_kts": 130,
      "p_c_hpa": 926
    }
  }'`,
    sampleResponse: {
      storm_id: "BOB-02-2020",
      generated_at: "2026-10-15T09:30:00Z",
      inference_latency_ms: 24.8,
      model_checkpoint: "v2.4-convnext-vit-ensemble",
      trajectory_points_count: 6,
      forecast: [
        { step_hours: 12, lat: 20.3, lon: 87.2, v_max_kts: 125, cone_radius_km: 28 },
        { step_hours: 24, lat: 21.0, lon: 87.7, v_max_kts: 115, cone_radius_km: 45 },
        { step_hours: 36, lat: 21.6, lon: 88.1, v_max_kts: 100, cone_radius_km: 62 },
        { step_hours: 48, lat: 22.3, lon: 88.4, v_max_kts: 85, cone_radius_km: 84 },
        { step_hours: 60, lat: 23.2, lon: 88.8, v_max_kts: 65, cone_radius_km: 110 },
        { step_hours: 72, lat: 24.1, lon: 89.2, v_max_kts: 45, cone_radius_km: 140 },
      ],
    },
  },
  {
    method: "GET",
    path: "/api/v1/telemetry/hardware",
    summary: "Query Live GPU Compute Telemetry & Model Engine Runtime",
    description: "Returns live metrics for GPU core compute utilization, VRAM allocation, temperature, precision mode, and current active PyTorch/TensorRT model checkpoint.",
    sampleRequest: `curl -X GET "https://api.cyclo-ai.imd.gov.in/api/v1/telemetry/hardware" \\
  -H "Authorization: Bearer cyc_live_98e1••••••••420b" \\
  -H "Accept: application/json"`,
    sampleResponse: {
      system_node: "CYCLO-AI-HPC-NODE-01",
      timestamp: "2026-10-15T09:30:00Z",
      gpu_model: "NVIDIA RTX 4090 / A100 SXM4 (24 GB)",
      gpu_load_percent: 68,
      gpu_temp_celsius: 62,
      fan_rpm: 2450,
      vram_allocated_gb: 14.2,
      vram_total_gb: 24.0,
      vram_utilization_percent: 59.1,
      average_latency_ms: 24.8,
      throughput_fps: 40.3,
      precision_mode: "FP16 (TensorRT Mixed Precision)",
      active_checkpoint: "v2.4-convnext-vit-ensemble",
    },
  },
];

/**
 * Multi-Language SDK Snippets
 */
export const sdkSnippets: Record<string, { title: string; language: string; code: string }> = {
  curl: {
    title: "cURL",
    language: "bash",
    code: `curl -X POST "https://api.cyclo-ai.imd.gov.in/api/v1/predict/trajectory" \\
  -H "Authorization: Bearer cyc_live_98e1••••••••420b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "storm_id": "BOB-02-2020",
    "forecast_horizon_hours": 72,
    "model_checkpoint": "v2.4-convnext-vit-ensemble",
    "include_uncertainty_cone": true,
    "current_state": {
      "lat": 19.8,
      "lon": 86.9,
      "v_max_kts": 130,
      "p_c_hpa": 926
    }
  }'`,
  },
  python: {
    title: "Python (requests)",
    language: "python",
    code: `import requests

url = "https://api.cyclo-ai.imd.gov.in/api/v1/predict/trajectory"
headers = {
    "Authorization": "Bearer cyc_live_98e1••••••••420b",
    "Content-Type": "application/json"
}
payload = {
    "storm_id": "BOB-02-2020",
    "forecast_horizon_hours": 72,
    "model_checkpoint": "v2.4-convnext-vit-ensemble",
    "include_uncertainty_cone": True,
    "current_state": {
        "lat": 19.8,
        "lon": 86.9,
        "v_max_kts": 130,
        "p_c_hpa": 926
    }
}

response = requests.post(url, json=payload, headers=headers)
forecast_data = response.json()
print(f"Lat: {forecast_data['forecast'][0]['lat']}, Lon: {forecast_data['forecast'][0]['lon']}")`,
  },
  javascript: {
    title: "JavaScript / TypeScript",
    language: "typescript",
    code: `const response = await fetch("https://api.cyclo-ai.imd.gov.in/api/v1/predict/trajectory", {
  method: "POST",
  headers: {
    "Authorization": "Bearer cyc_live_98e1••••••••420b",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    storm_id: "BOB-02-2020",
    forecast_horizon_hours: 72,
    model_checkpoint: "v2.4-convnext-vit-ensemble",
    include_uncertainty_cone: true,
    current_state: { lat: 19.8, lon: 86.9, v_max_kts: 130, p_c_hpa: 926 }
  })
});

const forecast = await response.json();
console.log("Predicted trajectory:", forecast.forecast);`,
  },
  go: {
    title: "Go",
    language: "go",
    code: `package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func main() {
	url := "https://api.cyclo-ai.imd.gov.in/api/v1/predict/trajectory"
	payload := map[string]interface{}{
		"storm_id":               "BOB-02-2020",
		"forecast_horizon_hours": 72,
		"model_checkpoint":       "v2.4-convnext-vit-ensemble",
		"include_uncertainty_cone": true,
		"current_state": map[string]interface{}{
			"lat":       19.8,
			"lon":       86.9,
			"v_max_kts": 130,
			"p_c_hpa":   926,
		},
	}
	body, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
	req.Header.Set("Authorization", "Bearer cyc_live_98e1••••••••420b")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	fmt.Println("Response Status:", resp.Status)
}`,
  },
};
