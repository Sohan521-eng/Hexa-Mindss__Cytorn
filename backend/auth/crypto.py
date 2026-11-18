"""
CYCLO-AI Cryptographic Utilities: PBKDF2-SHA512 Password Hashing & HS256 JWT.
100% standard-library implementation, byte-for-byte compatible with src/lib/auth/crypto.ts.
"""

import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Dict, Optional

PBKDF2_ITERATIONS = 120_000
PBKDF2_DKLEN = 64
JWT_SECRET = os.getenv("CYCLO_JWT_SECRET", "cyclo-ai-eoc-gateway-sha512-secret-2026-v1")


def hash_password(password: str, salt_hex: Optional[str] = None) -> str:
    """Hashes a plaintext password with a cryptographic 16-byte random salt using PBKDF2-HMAC-SHA512."""
    salt_bytes = bytes.fromhex(salt_hex) if salt_hex else os.urandom(16)
    dk = hashlib.pbkdf2_hmac(
        "sha512",
        password.encode("utf-8"),
        salt_bytes,
        PBKDF2_ITERATIONS,
        dklen=PBKDF2_DKLEN,
    )
    return f"pbkdf2_sha512${PBKDF2_ITERATIONS}${salt_bytes.hex()}${dk.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    """Verifies a plaintext password against a stored PBKDF2-SHA512 hash in constant time."""
    if not password or not stored_hash:
        return False
    parts = stored_hash.split("$")
    if len(parts) != 4 or parts[0] != "pbkdf2_sha512":
        return False
    try:
        iterations = int(parts[1])
        salt_bytes = bytes.fromhex(parts[2])
        expected_hash = bytes.fromhex(parts[3])
    except ValueError:
        return False

    derived = hashlib.pbkdf2_hmac(
        "sha512",
        password.encode("utf-8"),
        salt_bytes,
        iterations,
        dklen=len(expected_hash),
    )
    return hmac.compare_digest(derived, expected_hash)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(segment: str) -> bytes:
    padding = "=" * (-len(segment) % 4)
    return base64.urlsafe_b64decode(segment + padding)


def sign_jwt(payload: Dict[str, Any], ttl_seconds: int = 3600) -> str:
    """Signs a compact HS256 JWT token."""
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    body = {**payload, "iat": now, "exp": now + ttl_seconds}

    header_b64 = _b64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    body_b64 = _b64url_encode(json.dumps(body, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{body_b64}".encode("ascii")
    signature = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{header_b64}.{body_b64}.{_b64url_encode(signature)}"


def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
    """Verifies HS256 JWT signature and expiration. Returns payload dict or None."""
    if not token or not isinstance(token, str):
        return None
    parts = token.split(".")
    if len(parts) != 3:
        return None
    header_b64, body_b64, sig_b64 = parts
    signing_input = f"{header_b64}.{body_b64}".encode("ascii")
    expected_sig = hmac.new(JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    try:
        provided_sig = _b64url_decode(sig_b64)
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None
        payload = json.loads(_b64url_decode(body_b64).decode("utf-8"))
    except Exception:
        return None

    if not isinstance(payload, dict):
        return None
    exp = payload.get("exp")
    if not isinstance(exp, (int, float)) or time.time() > exp:
        return None
    return payload

