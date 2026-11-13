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

