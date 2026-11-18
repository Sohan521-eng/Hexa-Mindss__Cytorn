"""
CYCLO-AI Authentication Service, Persistent Store, Rate Limiter, & Audit Logger.
Persists users and security audit logs to backend/data/auth_store.json so both
the Python backend and Next.js API routes share identical state.
"""

import json
import os
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from auth.crypto import hash_password, verify_password, sign_jwt, verify_jwt
from auth.rbac import (
    evaluate_password_strength,
    get_role_profile,
    is_valid_role,
    validate_badge_pin,
    validate_email,
)

BACKEND_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BACKEND_DIR / "data"
STORE_PATH = DATA_DIR / "auth_store.json"

RATE_LIMIT_MAX_ATTEMPTS = 5
RATE_LIMIT_WINDOW_SEC = 15 * 60
MAX_AUDIT_LOGS = 500

# In-memory sliding window for failed login attempts keyed by f"{email}|{ip}"
_failed_attempts: Dict[str, List[float]] = {}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _build_seed_users() -> List[Dict[str, Any]]:
    """Pre-seeded institutional accounts (1 per RBAC role) for immediate verification."""
    created_at = _now_iso()
    return [
        {
            "id": "usr-imd-001",
            "name": "Dr. Ananya Mukherjee",
            "email": "dr.mukherjee@imd.gov.in",
            "password_hash": hash_password("Imd@2026#Sci"),
            "role": "scientist",
            "badge_id": "IMD-2026-9812",
            "agency": "India Meteorological Department (IMD)",
            "created_at": created_at,
        },
        {
            "id": "usr-ndma-002",
            "name": "Commander Vikram Rathore",
            "email": "eoc.odisha@ndma.gov.in",
            "password_hash": hash_password("Ndma@2026#Eoc"),
            "role": "disaster",
            "badge_id": "NDMA-OD-2026-412",
            "agency": "NDMA / Odisha SDMA EOC",
            "created_at": created_at,
        },
        {
            "id": "usr-pub-003",
            "name": "Aarav Sen",
            "email": "citizen@cyclo-ai.in",
            "password_hash": hash_password("Public@2026#View"),
            "role": "public",
            "badge_id": "",
            "agency": "General Public / Maritime Advisory",
            "created_at": created_at,
        },
        {
            "id": "usr-adm-004",
            "name": "Chief EOC Systems Admin",
            "email": "root.admin@isro.gov.in",
            "password_hash": hash_password("Admin@2026#Root"),
            "role": "admin",
            "badge_id": "ISRO-SAC-0001",
            "agency": "ISRO MOSDAC Mission Control",
            "created_at": created_at,
        },
    ]


def _load_store() -> Dict[str, Any]:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not STORE_PATH.exists():
        initial = {
            "version": 1,
            "users": _build_seed_users(),
            "audit_logs": [
                {
                    "id": f"aud-{uuid.uuid4().hex[:10]}",
                    "timestamp_utc": _now_iso(),
                    "category": "AUTH",
                    "action": "SYSTEM_BOOTSTRAP",
                    "email": "system@cyclo-ai.in",
                    "role": "admin",
                    "status": "SUCCESS",
                    "ip": "127.0.0.1",
                    "detail": "Initialized encrypted PBKDF2-SHA512 RBAC identity store",
                }
            ],
        }
        _save_store(initial)
        return initial

    try:
        with open(STORE_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            if not isinstance(data.get("users"), list):
                data["users"] = _build_seed_users()
            if not isinstance(data.get("audit_logs"), list):
                data["audit_logs"] = []
            return data
    except Exception:
        fallback = {"version": 1, "users": _build_seed_users(), "audit_logs": []}
        _save_store(fallback)
        return fallback


def _save_store(data: Dict[str, Any]) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp_path = STORE_PATH.with_suffix(".tmp")
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    os.replace(tmp_path, STORE_PATH)


def _append_audit(
    store: Dict[str, Any],
    action: str,
    email: str,
    role: str,
    status: str,
    ip: str,
    detail: str,
) -> None:
    entry = {
        "id": f"aud-{uuid.uuid4().hex[:10]}",
        "timestamp_utc": _now_iso(),
        "category": "AUTH",
        "action": action,
        "email": email,
        "role": role,
        "status": status,
        "ip": ip or "127.0.0.1",
        "detail": detail,
    }
    logs = store.setdefault("audit_logs", [])
    logs.insert(0, entry)
    if len(logs) > MAX_AUDIT_LOGS:
        del logs[MAX_AUDIT_LOGS:]


def _sanitize_user(user: Dict[str, Any]) -> Dict[str, Any]:
    role_profile = get_role_profile(user.get("role", "public"))
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": role_profile["role"],
        "role_label": role_profile["label"],
        "clearance_tier": role_profile["clearance_tier"],
        "default_route": role_profile["default_route"],
        "permissions": role_profile["permissions"],
        "badge_id": user.get("badge_id", ""),
        "agency": user.get("agency", ""),
        "created_at": user.get("created_at", ""),
    }


def _check_rate_limit(key: str) -> Tuple[bool, int]:
    now = time.time()
    attempts = [t for t in _failed_attempts.get(key, []) if now - t < RATE_LIMIT_WINDOW_SEC]
    _failed_attempts[key] = attempts
    if len(attempts) >= RATE_LIMIT_MAX_ATTEMPTS:
        retry_after = max(1, int(RATE_LIMIT_WINDOW_SEC - (now - attempts[0])))
        return False, retry_after
    return True, 0


def _record_failed_attempt(key: str) -> int:
    now = time.time()
    attempts = [t for t in _failed_attempts.get(key, []) if now - t < RATE_LIMIT_WINDOW_SEC]
    attempts.append(now)
    _failed_attempts[key] = attempts
    return max(0, RATE_LIMIT_MAX_ATTEMPTS - len(attempts))


def register_user(payload: Dict[str, Any], client_ip: str = "127.0.0.1") -> Tuple[int, Dict[str, Any], Optional[str], int]:
    """Registers a new user with PBKDF2-SHA512 hashing and issues a signed JWT."""
    name = str(payload.get("name", "")).strip()
    if len(name) < 2 or len(name) > 80:
        return 400, {"status": "error", "code": "INVALID_NAME", "message": "Full name must be between 2 and 80 characters."}, None, 0

    ok_email, email_or_err = validate_email(payload.get("email", ""))
    if not ok_email:
        return 400, {"status": "error", "code": "INVALID_EMAIL", "message": email_or_err}, None, 0
    email = email_or_err

    role = str(payload.get("role", "public")).strip().lower()
    if not is_valid_role(role):
        return 400, {"status": "error", "code": "INVALID_ROLE", "message": "Invalid operational role selected."}, None, 0

    password = str(payload.get("password", ""))
    pw_eval = evaluate_password_strength(password)
    if not pw_eval["valid"]:
        return 400, {"status": "error", "code": "WEAK_PASSWORD", "message": pw_eval["reason"]}, None, 0

    ok_badge, badge_or_err = validate_badge_pin(str(payload.get("badgeId") or payload.get("badge_id") or ""), role)
    if not ok_badge:
        return 400, {"status": "error", "code": "INVALID_BADGE", "message": badge_or_err}, None, 0
    badge_id = badge_or_err

    store = _load_store()
    if any(u.get("email", "").lower() == email for u in store["users"]):
        _append_audit(store, "REGISTER_CONFLICT", email, role, "REJECTED", client_ip, "Email already registered")
        _save_store(store)
        return 409, {"status": "error", "code": "EMAIL_EXISTS", "message": "An account with this email already exists. Please sign in."}, None, 0

    user_record = {
        "id": f"usr-{uuid.uuid4().hex[:10]}",
        "name": name,
        "email": email,
        "password_hash": hash_password(password),
        "role": role,
        "badge_id": badge_id,
        "agency": str(payload.get("agency") or ("Verified Agency Terminal" if badge_id else "Standard Operational Access")),
        "created_at": _now_iso(),
    }
    store["users"].append(user_record)
    _append_audit(store, "REGISTER_SUCCESS", email, role, "SUCCESS", client_ip, f"Provisioned Tier {get_role_profile(role)['clearance_tier']} clearance")
    _save_store(store)

    safe_user = _sanitize_user(user_record)
    ttl = 30 * 24 * 3600 if payload.get("rememberMe", True) else 4 * 3600
    token = sign_jwt(
        {
            "sub": safe_user["id"],
            "email": safe_user["email"],
            "name": safe_user["name"],
            "role": safe_user["role"],
            "clearance_tier": safe_user["clearance_tier"],
        },
        ttl_seconds=ttl,
    )

    return (
        201,
        {
            "status": "success",
            "message": "Clearance provisioned and session authenticated.",
            "user": safe_user,
            "redirect_to": safe_user["default_route"],
            "token_type": "Bearer",
            "expires_in": ttl,
        },
        token,
        ttl,
    )


def login_user(payload: Dict[str, Any], client_ip: str = "127.0.0.1") -> Tuple[int, Dict[str, Any], Optional[str], int]:
    """Authenticates credentials, enforces RBAC & rate limiting, and issues a signed JWT."""
    ok_email, email_or_err = validate_email(payload.get("email", ""))
    if not ok_email:
        return 400, {"status": "error", "code": "INVALID_EMAIL", "message": email_or_err}, None, 0
    email = email_or_err

    password = str(payload.get("password", ""))
    requested_role = str(payload.get("role", "")).strip().lower()
    if requested_role and not is_valid_role(requested_role):
        return 400, {"status": "error", "code": "INVALID_ROLE", "message": "Invalid operational role specified."}, None, 0

    rate_key = f"{email}|{client_ip}"
    allowed, retry_after = _check_rate_limit(rate_key)
    store = _load_store()
    if not allowed:
        _append_audit(store, "LOGIN_RATE_LIMITED", email, requested_role or "unknown", "BLOCKED", client_ip, f"Locked for {retry_after}s after repeated failures")
        _save_store(store)
        return (
            429,
            {
                "status": "error",
                "code": "RATE_LIMITED",
                "message": f"Too many failed attempts. Terminal locked for {max(1, retry_after // 60)} minute(s).",
                "retry_after_seconds": retry_after,
            },
            None,
            0,
        )

    user = next((u for u in store["users"] if u.get("email", "").lower() == email), None)
    if not user or not verify_password(password, user.get("password_hash", "")):
        remaining = _record_failed_attempt(rate_key)
        _append_audit(store, "LOGIN_FAILED", email, requested_role or "unknown", "DENIED", client_ip, f"Invalid credentials ({remaining} attempts left)")
        _save_store(store)
        return (
            401,
            {
                "status": "error",
                "code": "INVALID_CREDENTIALS",
                "message": f"Invalid email or password. {remaining} attempt(s) remaining before lockout.",
            },
            None,
            0,
        )

    # Enforce role clearance alignment if user explicitly selected a higher role than their account owns
    user_role = user.get("role", "public")
    if requested_role and requested_role != user_role and user_role != "admin":
        _append_audit(store, "RBAC_ROLE_MISMATCH", email, requested_role, "DENIED", client_ip, f"Account role '{user_role}' attempted '{requested_role}' clearance")
        _save_store(store)
        return (
            403,
            {
                "status": "error",
                "code": "ROLE_CLEARANCE_DENIED",
                "message": f"Your account holds '{get_role_profile(user_role)['label']}' clearance. Please select the matching role tab.",
                "assigned_role": user_role,
            },
            None,
            0,
        )

    # Clear failure counter on valid login
    _failed_attempts.pop(rate_key, None)

    safe_user = _sanitize_user(user)
    effective_route = get_role_profile(requested_role)["default_route"] if (user_role == "admin" and requested_role) else safe_user["default_route"]
    ttl = 30 * 24 * 3600 if payload.get("rememberMe", True) else 4 * 3600
    token = sign_jwt(
        {
            "sub": safe_user["id"],
            "email": safe_user["email"],
            "name": safe_user["name"],
            "role": safe_user["role"],
            "clearance_tier": safe_user["clearance_tier"],
        },
        ttl_seconds=ttl,
    )

    _append_audit(store, "LOGIN_SUCCESS", email, safe_user["role"], "SUCCESS", client_ip, f"Authenticated via PBKDF2-SHA512; routed to {effective_route}")
    _save_store(store)

    return (
        200,
        {
            "status": "success",
            "message": "Identity verified. Command gateway unlocked.",
            "user": safe_user,
            "redirect_to": effective_route,
            "token_type": "Bearer",
            "expires_in": ttl,
        },
        token,
        ttl,
    )


def get_session_user(token: Optional[str]) -> Tuple[int, Dict[str, Any]]:
    """Validates a JWT session token and returns the active user & RBAC claims."""
    if not token:
        return 401, {"status": "error", "code": "UNAUTHENTICATED", "message": "No active session token."}

    claims = verify_jwt(token)
    if not claims:
        return 401, {"status": "error", "code": "INVALID_SESSION", "message": "Session token is invalid or expired."}

    store = _load_store()
    user = next((u for u in store["users"] if u.get("id") == claims.get("sub")), None)
    if not user:
        return 401, {"status": "error", "code": "USER_NOT_FOUND", "message": "Authenticated account no longer exists."}

    return 200, {"status": "success", "authenticated": True, "user": _sanitize_user(user)}


def logout_user(token: Optional[str], client_ip: str = "127.0.0.1") -> Tuple[int, Dict[str, Any]]:
    """Logs session termination in audit trail."""
    claims = verify_jwt(token) if token else None
    store = _load_store()
    if claims:
        _append_audit(
            store,
            "LOGOUT",
            str(claims.get("email", "unknown")),
            str(claims.get("role", "unknown")),
            "SUCCESS",
            client_ip,
            "Operator terminated session cleanly",
        )
        _save_store(store)
    return 200, {"status": "success", "message": "Session terminated cleanly."}


def get_audit_logs(limit: int = 50) -> Dict[str, Any]:
    store = _load_store()
    safe_limit = max(1, min(200, int(limit)))
    return {
        "status": "success",
        "timestamp_utc": _now_iso(),
        "total_events": len(store.get("audit_logs", [])),
        "audit_logs": store.get("audit_logs", [])[:safe_limit],
    }

