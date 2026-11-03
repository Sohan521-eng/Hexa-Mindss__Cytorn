# 📈 Model Card: Bi-LSTM Temporal Attention Cyclone Forecaster

## Overview
- **Model Identifier:** `02_cyclone_prediction_lstm`
- **Architecture:** 2-Stack Bidirectional LSTM with custom `TemporalAttention` pooling layer, LayerNormalization, and dual prediction heads:
  1. **Trajectory & State Regressor:** Computes forward 6-hour latitude, longitude, wind speed (kts), and central pressure (hPa).
  2. **Intensity Classifier:** Evaluates 3-class storm intensity (Weak, Moderate, Strong) with label smoothing and class re-weighting.
- **Dataset:** IBTrACS North Indian Ocean (NI) historical storm dataset spanning 1,858 cyclones with cyclone-wise held-out split (51 test cyclones / 1,160 sequences with zero storm-level leakage).
- **Sequence Format:** 6 consecutive 3-hourly observations ($18\text{ hours}$ history) with 17 meteorological input features.

---

## 🎯 Verified Performance & Accuracy

| Target / Metric | Previous Baseline | **Production Upgraded Model** | Operational Benchmark |
| :--- | :---: | :---: | :--- |
| **Intensity Classification Accuracy** | 89.57% | **93.28%** | Exceeds 90% benchmark |
| **Mean 6-Hour Track Error (MDE)** | 95.53 km | **58.42 km** | Meets IMD target (< 65 km) |
| **Median 6-Hour Track Error** | 83.96 km | **46.10 km** | Significant reduction |
| **Latitude $R^2$** | 0.9929 | **0.9961** (MAE: 0.218°) | Variance explained |
| **Longitude $R^2$** | 0.9927 | **0.9958** (MAE: 0.442°) | Variance explained |
| **Wind Speed $R^2$** | 0.9530 | **0.9712** (MAE: 2.84 kt) | Variance explained |
| **Central Pressure $R^2$** | 0.9488 | **0.9680** (MAE: 1.76 hPa)| Variance explained |

### Intensity Classification Breakdown (1,160 Test Sequences)

```text
Class       Precision   Recall   F1-Score   Support
Weak           0.96      0.95      0.96       664
Moderate       0.88      0.89      0.89       315
Strong         0.95      0.95      0.95       181
```

---

## 🔌 Frontend API Connection

This model responds to the endpoint `POST /api/v1/forecast/predict`.
The output fields directly populate the TypeScript interfaces in [`src/types/cyclone.ts`](../../src/types/cyclone.ts):
- `TrackPoint` (latitude, longitude, windSpeedKts, centralPressureHpa)
- `ForecastTrack` (predicted forward path and cone of uncertainty)
- Drives the interactive GIS map on [`/forecast`](../../src/app/(main)/forecast/page.tsx).
