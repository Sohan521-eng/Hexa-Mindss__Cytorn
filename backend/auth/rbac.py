"""
CYCLO-AI Role-Based Access Control (RBAC) Matrix & Input Validators.
Matches SIH2K26/AUTH.md operational clearance specifications.
"""

import re
from typing import Dict, Any, Tuple

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$")
BADGE_PIN_REGEX = re.compile(r"^(IMD|ISRO|NDMA|SDMA|EOC|ADMIN|INCOIS|NOAA)-[A-Z0-9\-]{3,24}$")

COMMON_WEAK_PASSWORDS = {
    "password",
    "password123",
    "12345678",
    "1234567890",
    "qwerty1234",
    "cyclone2026",
    "cycloai2026",
    "admin12345",
}

RBAC_MATRIX: Dict[str, Dict[str, Any]] = {
    "admin": {
        "role": "admin",
        "label": "System Administrator (EOC Root)",
        "clearance_tier": 1,
        "default_route": "/settings",
        "permissions": [
            "satellite:read",
            "satellite:write",
            "inference:tune",
            "alerts:read",
            "alerts:broadcast",
            "settings:read",
            "settings:admin",
            "audit:export",
            "dashboard:read",
            "forecast:read",
        ],
    },
    "scientist": {
        "role": "scientist",
        "label": "Meteorologist / Scientific Researcher",
        "clearance_tier": 2,
        "default_route": "/satellite-analyzer",
        "permissions": [
            "satellite:read",
            "satellite:write",
            "inference:tune",
            "alerts:read",
            "settings:read",
            "audit:self",
            "dashboard:read",
            "forecast:read",
        ],
    },
    "disaster": {
        "role": "disaster",
        "label": "Disaster Response Official (NDMA/SDMA)",
        "clearance_tier": 3,
        "default_route": "/alerts",
        "permissions": [
            "satellite:read",
            "alerts:read",
            "alerts:broadcast",
            "settings:webhook_read",
            "audit:broadcasts",
            "dashboard:read",
            "forecast:read",
        ],
    },
    "public": {
        "role": "public",
        "label": "General Public / Student",
        "clearance_tier": 4,
        "default_route": "/dashboard",
        "permissions": [
            "alerts:read",
            "dashboard:read",
            "forecast:read",
        ],
    },
}


def is_valid_role(role: str) -> bool:
    return role in RBAC_MATRIX


def get_role_profile(role: str) -> Dict[str, Any]:
    return RBAC_MATRIX.get(role, RBAC_MATRIX["public"])


def validate_email(email: str) -> Tuple[bool, str]:
    if not email or not isinstance(email, str):
        return False, "Email address is required."
    cleaned = email.strip().lower()
    if len(cleaned) > 120 or not EMAIL_REGEX.match(cleaned):
        return False, "Please enter a valid institutional or personal email address."
    return True, cleaned


def validate_badge_pin(badge_id: str, role: str) -> Tuple[bool, str]:
    if not badge_id:
        return True, ""
    cleaned = badge_id.strip().upper()
    if role == "public":
        return True, ""
    if not BADGE_PIN_REGEX.match(cleaned):
        return (
            False,
            "Agency Badge PIN must match format PREFIX-XXXX (e.g., IMD-2026-9812, NDMA-OD-2026-01, ISRO-SAC-441).",
        )
    return True, cleaned


def evaluate_password_strength(password: str) -> Dict[str, Any]:
    """
    Evaluates password entropy across 4 criteria:
    1. Length >= 8 characters (10+ preferred)
    2. Mixed case (upper + lower)
    3. Numeric digit
    4. Special character
    Also rejects known weak meteorological dictionary strings.
    """
    if not password or not isinstance(password, str):
        return {"score": 0, "label": "Empty", "valid": False, "reason": "Password is required."}

    if password.lower() in COMMON_WEAK_PASSWORDS:
        return {
            "score": 1,
            "label": "Compromised Pattern",
            "valid": False,
            "reason": "Common or predictable meteorological password rejected.",
        }

    score = 0
    if len(password) >= 8:
        score += 1
    if any(c.islower() for c in password) and any(c.isupper() for c in password):
        score += 1
    if any(c.isdigit() for c in password):
        score += 1
    if any(not c.isalnum() for c in password):
        score += 1

    labels = {0: "Critical", 1: "Weak", 2: "Moderate", 3: "Strong", 4: "Cryptographic"}
    valid = len(password) >= 8 and score >= 2
    reason = "" if valid else "Password must be at least 8 characters and combine letters with numbers or symbols."
    return {"score": score, "label": labels[score], "valid": valid, "reason": reason}

