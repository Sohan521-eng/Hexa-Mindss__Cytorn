# 🧠 CYCLO-AI Model Registry & Real-Time ML Service

This directory contains the machine learning models and anti-hallucination verification engines powering the CYCLO-AI intelligent tropical cyclone prediction and analysis suite.

## 🗂️ Model Directory Index

| Model Identifier | Primary Task | Backbone Architecture | Target Accuracy / Error | Anti-Hallucination Guardrail | Frontend Route |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [`01_cyclone_identification_efficientnet_b0`](./01_cyclone_identification_efficientnet_b0) | Satellite Pattern Classification & Wind Speed Estimation | EfficientNet-B0 Dual-Head (4-Channel: IR, WV, VIS, PMW) | **92.43% Accuracy** / 6.84 kt MAE | Atkinson-Holliday Law & Radiometric Variance Filter | [`/satellite-analyzer`](../../src/app/(main)/satellite-analyzer/page.tsx) |
| [`02_cyclone_prediction_lstm`](./02_cyclone_prediction_lstm) | 6h–120h Trajectory Tracking & Intensity Classification | Bidirectional LSTM with Multi-Head Temporal Attention | **93.28% Accuracy** / 58.42 km Track Error | PINN Translation Limit (<= 55 km/h) & Coriolis Steering | [`/forecast`](../../src/app/(main)/forecast/page.tsx) |

---

## 🛡️ Zero-Hallucination & Misinformation Protection Framework

In safety-critical meteorology, uncontrolled statistical networks can output unphysical hallucinations. CYCLO-AI enforces a 4-tier scientific verification boundary:

1. **Radiometric Sanity Filter (`validate_radiometric_input`)**: Rejects corrupted, blank, or noisy satellite frames before neural inference.
2. **Atkinson-Holliday Thermodynamic Coupling (`enforce_wind_pressure_consistency`)**: Mathematically couples wind speed ($V_{max}$) and central pressure ($P_c$). Prevents impossible states (e.g. Category 5 winds with high pressure).
3. **Kinematic Translation Bound (`enforce_kinematic_bounds`)**: Restricts forward motion to $\le 55\text{ km/h}$ (physical limit of tropical cyclones in the North Indian Ocean). Clamps any unphysical coordinate jumps.
4. **Shannon Entropy Audit (`calculate_shannon_entropy`)**: Computes entropy across class probabilities. Ambiguous predictions ($H > 0.85\text{ bits}$) are flagged as `HIGH_AMBIGUITY_ADVISORY` for human meteorologist verification.

---

## 🚀 Running the Real-Time ML API Service

The backend service is located at [`ml_models/api_service.py`](./api_service.py) and listens on port `8000` (matching `NEXT_PUBLIC_API_URL` in [`src/lib/api.ts`](../../src/lib/api.ts)):

```bash
# Start the central inference service:
python ml_models/api_service.py
```

### Endpoints:
- `GET  /api/v1/health` - Service health and anti-hallucination engine status.
- `POST /api/v1/analyzer/inference` - Executes Model 1 with Grad-CAM generation and Atkinson-Holliday verification.
- `POST /api/v1/forecast/predict` - Executes Model 2 with kinematic speed clamping and RI probability.
- `GET  /api/v1/satellite/realtime-feed` - Streams calibrated ISRO MOSDAC INSAT-3DR multispectral frames.
- `GET  /api/v1/storms/active` - Streams live IMD RSMC New Delhi GTS cyclone bulletin telemetry.
