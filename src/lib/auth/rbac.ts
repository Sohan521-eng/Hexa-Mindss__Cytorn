/**
 * CYCLO-AI Role-Based Access Control (RBAC) Matrix & Input Validators.
 * Strictly synchronized with backend/auth/rbac.py and SIH2K26/AUTH.md.
 */

export type AuthRole = "scientist" | "disaster" | "public" | "admin";

export interface RoleProfile {
  role: AuthRole;
  label: string;
  clearance_tier: 1 | 2 | 3 | 4;
  default_route: string;
  permissions: string[];
}

export interface SanitizedUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  role_label: string;
  clearance_tier: 1 | 2 | 3 | 4;
  default_route: string;
  permissions: string[];
  badge_id: string;
  agency: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp_utc: string;
  category: "AUTH" | "API" | "MODEL";
  action: string;
  email: string;
  role: string;
  status: "SUCCESS" | "DENIED" | "REJECTED" | "BLOCKED";
  ip: string;
  detail: string;
}

const EMAIL_REGEX = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
const BADGE_PIN_REGEX = /^(IMD|ISRO|NDMA|SDMA|EOC|ADMIN|INCOIS|NOAA)-[A-Z0-9\-]{3,24}$/;

const COMMON_WEAK_PASSWORDS = new Set([
  "password",
  "password123",
  "12345678",
  "1234567890",
  "qwerty1234",
  "cyclone2026",
  "cycloai2026",
  "admin12345",
]);

export const RBAC_MATRIX: Record<AuthRole, RoleProfile> = {
  admin: {
    role: "admin",
    label: "System Administrator (EOC Root)",
    clearance_tier: 1,
    default_route: "/settings",
    permissions: [
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
  scientist: {
    role: "scientist",
    label: "Meteorologist / Scientific Researcher",
    clearance_tier: 2,
    default_route: "/satellite-analyzer",
    permissions: [
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
  disaster: {
    role: "disaster",
    label: "Disaster Response Official (NDMA/SDMA)",
    clearance_tier: 3,
    default_route: "/alerts",
    permissions: [
      "satellite:read",
      "alerts:read",
      "alerts:broadcast",
      "settings:webhook_read",
      "audit:broadcasts",
      "dashboard:read",
      "forecast:read",
    ],
  },
  public: {
    role: "public",
    label: "General Public / Student",
    clearance_tier: 4,
    default_route: "/dashboard",
    permissions: ["alerts:read", "dashboard:read", "forecast:read"],
  },
};

export function isValidRole(role: string): role is AuthRole {
  return role === "scientist" || role === "disaster" || role === "public" || role === "admin";
}

export function getRoleProfile(role: string): RoleProfile {
  return isValidRole(role) ? RBAC_MATRIX[role] : RBAC_MATRIX.public;
}

export function validateEmail(email: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof email !== "string" || !email.trim()) {
    return { ok: false, error: "Email address is required." };
  }
  const cleaned = email.trim().toLowerCase();
  if (cleaned.length > 120 || !EMAIL_REGEX.test(cleaned)) {
    return { ok: false, error: "Please enter a valid institutional or personal email address." };
  }
  return { ok: true, value: cleaned };
}

export function validateBadgePin(
  badgeId: unknown,
  role: AuthRole
): { ok: true; value: string } | { ok: false; error: string } {
  if (role === "public" || typeof badgeId !== "string" || !badgeId.trim()) {
    return { ok: true, value: "" };
  }
  const cleaned = badgeId.trim().toUpperCase();
  if (!BADGE_PIN_REGEX.test(cleaned)) {
    return {
      ok: false,
      error: "Agency Badge PIN must match PREFIX-XXXX (e.g. IMD-2026-9812, NDMA-OD-2026-01, ISRO-SAC-441).",
    };
  }
  return { ok: true, value: cleaned };
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  valid: boolean;
  reason: string;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password || typeof password !== "string") {
    return { score: 0, label: "Empty", valid: false, reason: "Password is required." };
  }

  if (COMMON_WEAK_PASSWORDS.has(password.toLowerCase())) {
    return {
      score: 1,
      label: "Compromised Pattern",
      valid: false,
      reason: "Common or predictable meteorological password rejected.",
    };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  const labels: Record<number, string> = {
    0: "Critical",
    1: "Weak",
    2: "Moderate",
    3: "Strong",
    4: "Cryptographic",
  };
  const valid = password.length >= 8 && score >= 2;
  return {
    score: score as 0 | 1 | 2 | 3 | 4,
    label: labels[score],
    valid,
    reason: valid ? "" : "Password must be at least 8 characters and combine letters with numbers or symbols.",
  };
}

