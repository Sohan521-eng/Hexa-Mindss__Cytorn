"""
CYCLO-AI Backend: Configuration & Settings
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
MODEL_1_DIR = MODELS_DIR / "01_cyclone_identification_efficientnet_b0"
MODEL_2_DIR = MODELS_DIR / "02_cyclone_prediction_lstm"

# Server Settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
VERSION = "1.0.0"
APP_NAME = "CYCLO-AI Real-Time ML Backend"

# CORS Configuration
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "*"
]

# Primary Storm Active Focus (Landing Page / Hero Video / Ticker Synchronization)
PRIMARY_STORM = {
    "cyclone_id": "BOB-02-ARNAB",
    "storm_name": 'CYCLONE "ARNAB"',
    "basin": "Bay of Bengal",
    "active_category": "VSCS Cat-3",
    "intensity_label": "Very Severe Cyclonic Storm",
    "current_state": {
        "lat": 16.2,
        "lon": 88.4,
        "wind_kts": 99.9,
        "wind_kmh": 185.0,
        "pressure_hpa": 942.0,
        "speed_kmh": 18.5,
        "bearing_deg": 335.0
    },
    "telemetry_hud": {
        "name": 'CYCLONE "ARNAB"',
        "category": "VSCS Cat-3",
        "minPressure": "942 hPa",
        "maxWind": "185 km/h",
        "satelliteFeed": "INSAT-3DR TIR-1 10.8µm",
        "latency": "12s",
        "coverage": "BoB & NIO"
    }
}

# Live Dashboard Telemetry & Micro-Parameters Configuration
DASHBOARD_DATA = {
    "sector": "BAY OF BENGAL • SECTOR BOB-02",
    "satellite_cycle": "INSAT-3DR Rapid Scan (15m)",
    "mosdac_status": "Synced",
    "storm": {
        "id": "BOB-02-ARNAB",
        "name": 'CYCLONE "ARNAB"',
        "warningStage": "Stage 3 Warning",
        "warningTier": "warning",
        "location": "Bay of Bengal • East Coast Threat Sector",
        "intensity": "VSCS Cat-3",
        "categoryDisplay": "Category 4 Severe",
        "confidence": "96.4%",
        "confidenceScore": 96.4,
        "landfallCountdown": "T-24h (Puri-Dhamra Sector)",
        "coordinates": {"lat": 16.2, "lon": 88.4}
    },
    "parameters": [
        {"id": "wind", "label": "Max Wind Speed", "value": "185 km/h", "change": "+15 km/h in 3h", "colorKey": "ai-cyan"},
        {"id": "pressure", "label": "Central Pressure", "value": "942 hPa", "change": "-8 hPa rapid drop", "colorKey": "solar-coral"},
        {"id": "sst", "label": "Sea Surface Temp", "value": "30.4 °C", "change": "Above threshold (28°C)", "colorKey": "stage-2-alert"},
        {"id": "shear", "label": "Vertical Wind Shear", "value": "8.5 kts", "change": "Favorable (<10 kts)", "colorKey": "stage-1-watch"},
        {"id": "humidity", "label": "Relative Humidity", "value": "86%", "change": "Mid-troposphere saturated", "colorKey": "cloud-low"},
        {"id": "rainfall", "label": "Estimated Rainfall", "value": "220 mm/24h", "change": "Extreme core band", "colorKey": "cloud-deep"}
    ],
    "trends": [
        {"time": "-24h", "wind": 45, "pressure": 998, "isForecast": False},
        {"time": "-18h", "wind": 55, "pressure": 990, "isForecast": False},
        {"time": "-12h", "wind": 85, "pressure": 980, "isForecast": False},
        {"time": "-6h", "wind": 140, "pressure": 955, "isForecast": False},
        {"time": "Now", "wind": 185, "pressure": 942, "isForecast": False},
        {"time": "+6h", "wind": 195, "pressure": 936, "isForecast": True},
        {"time": "+12h", "wind": 205, "pressure": 930, "isForecast": True},
        {"time": "+18h", "wind": 195, "pressure": 938, "isForecast": True},
        {"time": "+24h", "wind": 165, "pressure": 952, "isForecast": True}
    ]
}

