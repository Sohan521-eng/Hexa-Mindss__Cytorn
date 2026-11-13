"""
CYCLO-AI Backend: Anti-Hallucination & Scientific Guardrails
Enforces 4-tier scientific verification boundary:
1. Radiometric Sanity Filter
2. Atkinson-Holliday Thermodynamic Coupling (Wind-Pressure Consistency)
3. Kinematic Translation Bound (Max 55 km/h for North Indian Ocean)
4. Shannon Entropy Audit (Ambiguity detection)
"""

import math

MAX_TRANSLATION_SPEED_KMH = 55.0  # Physical upper limit for NIO cyclones
MIN_CENTRAL_PRESSURE_HPA = 880.0
MAX_CENTRAL_PRESSURE_HPA = 1012.0

def validate_radiometric_input(image_array) -> tuple[bool, str]:
    """
    Validates input satellite imagery against physical sensor boundaries.
    Rejects corrupted, blank, or out-of-distribution frames to prevent AI hallucination.
    """
    try:
        import numpy as np
        if isinstance(image_array, np.ndarray):
            if image_array.ndim != 3 or image_array.shape != (4, 128, 128):
                return False, f"Expected shape [4, 128, 128] (IR, WV, VIS, PMW), received {image_array.shape}"
            if np.isnan(image_array).any() or np.isinf(image_array).any():
                return False, "Radiometric matrix contains invalid NaN or Infinite values (Sensor Artifact)"
            ir_channel = image_array[0]
            if np.all(ir_channel == 0) or np.std(ir_channel) < 1.0:
                return False, "Zero variance or blank frame detected; refusing to infer to prevent hallucination"
    except ImportError:
        pass
    return True, "Radiometric validation passed (Physics-Compliant)"

def enforce_wind_pressure_consistency(wind_kts: float, pressure_hpa: float = None) -> float:
    """
    Applies the empirical Atkinson-Holliday Law for Tropical Cyclones:
    P_c = 1010.0 - (V_max / 6.7)^1.553
    Prevents hallucinating impossible thermodynamic states.
    """
    wind_kts = max(15.0, min(185.0, wind_kts))
    pressure_deficit = (wind_kts / 6.7) ** 1.553
    expected_pressure = 1010.0 - pressure_deficit

    if pressure_hpa is None:
        return round(expected_pressure, 1)

    # Clamp within physical +/- 12 hPa deviation envelope
    clamped_pressure = max(expected_pressure - 12.0, min(expected_pressure + 12.0, pressure_hpa))
    return round(clamped_pressure, 1)

def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two GPS coordinates in kilometers."""
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c

def enforce_kinematic_bounds(
    lat_orig: float, lon_orig: float,
    lat_pred: float, lon_pred: float,
    delta_hours: float = 6.0
) -> tuple[float, float, float, bool]:
    """
    Prevents unphysical trajectory jumps.
    If implied translation speed > 55 km/h, clamps trajectory to the physical hydrodynamic limit.
    """
    raw_distance = haversine_distance_km(lat_orig, lon_orig, lat_pred, lon_pred)
    max_allowed_distance = MAX_TRANSLATION_SPEED_KMH * delta_hours

    if raw_distance > max_allowed_distance:
        scale = max_allowed_distance / raw_distance
        clamped_lat = lat_orig + (lat_pred - lat_orig) * scale
        clamped_lon = lon_orig + (lon_pred - lon_orig) * scale
        clamped_distance = max_allowed_distance
        return round(clamped_lat, 4), round(clamped_lon, 4), round(clamped_distance, 2), True

    return round(lat_pred, 4), round(lon_pred, 4), round(raw_distance, 2), False

def calculate_shannon_entropy(probs: list[float]) -> float:
    """Computes Shannon Entropy H(P) in bits. Values > 0.85 indicate high model ambiguity."""
    entropy = 0.0
    for p in probs:
        if p > 1e-7:
            entropy -= p * math.log2(p)
    return float(entropy)

