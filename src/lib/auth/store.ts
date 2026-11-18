/**
 * CYCLO-AI Persistent Authentication Store, Rate Limiter, & Security Audit Trail.
 * Shares backend/data/auth_store.json directly with backend/auth/service.py.
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { hashPassword, signJwt, verifyJwt, verifyPassword } from "./crypto";
import {
  AuditLogEntry,
  AuthRole,
  SanitizedUser,
  evaluatePasswordStrength,
  getRoleProfile,
  isValidRole,
  validateBadgePin,
  validateEmail,
} from "./rbac";

interface StoredUser {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: AuthRole;
  badge_id: string;
  agency: string;
  created_at: string;
}

interface AuthStoreData {
  version: number;
  users: StoredUser[];
  audit_logs: AuditLogEntry[];
}

const DATA_DIR = path.join(process.cwd(), "backend", "data");
const STORE_PATH = path.join(DATA_DIR, "auth_store.json");

const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_AUDIT_LOGS = 500;

// Persist failed attempts across Next.js hot reloads via globalThis
const globalForRateLimit = globalThis as unknown as {
  __cycloAuthFailedAttempts?: Map<string, number[]>;
};
const failedAttempts =
  globalForRateLimit.__cycloAuthFailedAttempts ?? new Map<string, number[]>();
globalForRateLimit.__cycloAuthFailedAttempts = failedAttempts;

function buildSeedUsers(): StoredUser[] {
  const createdAt = new Date().toISOString();
  return [
    {
      id: "usr-imd-001",
      name: "Dr. Ananya Mukherjee",
      email: "dr.mukherjee@imd.gov.in",
      password_hash: hashPassword("Imd@2026#Sci"),
      role: "scientist",
      badge_id: "IMD-2026-9812",
      agency: "India Meteorological Department (IMD)",
      created_at: createdAt,
    },
    {
      id: "usr-ndma-002",
      name: "Commander Vikram Rathore",
      email: "eoc.odisha@ndma.gov.in",
      password_hash: hashPassword("Ndma@2026#Eoc"),
      role: "disaster",
      badge_id: "NDMA-OD-2026-412",
      agency: "NDMA / Odisha SDMA EOC",
      created_at: createdAt,
    },
    {
      id: "usr-pub-003",
      name: "Aarav Sen",
      email: "citizen@cyclo-ai.in",
      password_hash: hashPassword("Public@2026#View"),
      role: "public",
      badge_id: "",
      agency: "General Public / Maritime Advisory",
      created_at: createdAt,
    },
    {
      id: "usr-adm-004",
      name: "Chief EOC Systems Admin",
      email: "root.admin@isro.gov.in",
      password_hash: hashPassword("Admin@2026#Root"),
      role: "admin",
      badge_id: "ISRO-SAC-0001",
      agency: "ISRO MOSDAC Mission Control",
      created_at: createdAt,
    },
  ];
}

function saveStore(data: AuthStoreData): void {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmpPath = `${STORE_PATH}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmpPath, STORE_PATH);
}

function loadStore(): AuthStoreData {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    const initial: AuthStoreData = {
      version: 1,
      users: buildSeedUsers(),
      audit_logs: [
        {
          id: `aud-${crypto.randomBytes(5).toString("hex")}`,
          timestamp_utc: new Date().toISOString(),
          category: "AUTH",
          action: "SYSTEM_BOOTSTRAP",
          email: "system@cyclo-ai.in",
          role: "admin",
          status: "SUCCESS",
          ip: "127.0.0.1",
          detail: "Initialized encrypted PBKDF2-SHA512 RBAC identity store",
        },
      ],
    };
    saveStore(initial);
    return initial;
  }

  try {
    const raw = fs.readFileSync(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<AuthStoreData>;
    return {
      version: parsed.version ?? 1,
      users: Array.isArray(parsed.users) ? parsed.users : buildSeedUsers(),
      audit_logs: Array.isArray(parsed.audit_logs) ? parsed.audit_logs : [],
    };
  } catch {
    const fallback: AuthStoreData = {
      version: 1,
      users: buildSeedUsers(),
      audit_logs: [],
    };
    saveStore(fallback);
    return fallback;
  }
}

function appendAudit(
  store: AuthStoreData,
  action: string,
  email: string,
  role: string,
  status: AuditLogEntry["status"],
  ip: string,
  detail: string
): void {
  const entry: AuditLogEntry = {
    id: `aud-${crypto.randomBytes(5).toString("hex")}`,
    timestamp_utc: new Date().toISOString(),
    category: "AUTH",
    action,
    email,
    role,
    status,
    ip: ip || "127.0.0.1",
    detail,
  };
  store.audit_logs.unshift(entry);
  if (store.audit_logs.length > MAX_AUDIT_LOGS) {
    store.audit_logs.length = MAX_AUDIT_LOGS;
  }
}

function sanitizeUser(user: StoredUser): SanitizedUser {
  const profile = getRoleProfile(user.role);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: profile.role,
    role_label: profile.label,
    clearance_tier: profile.clearance_tier,
    default_route: profile.default_route,
    permissions: profile.permissions,
    badge_id: user.badge_id || "",
    agency: user.agency || "",
    created_at: user.created_at || "",
  };
}

function checkRateLimit(key: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const attempts = (failedAttempts.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  failedAttempts.set(key, attempts);
  if (attempts.length >= RATE_LIMIT_MAX_ATTEMPTS) {
    const retryAfterSec = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - attempts[0])) / 1000));
    return { allowed: false, retryAfterSec };
  }
  return { allowed: true, retryAfterSec: 0 };
}

function recordFailedAttempt(key: string): number {
  const now = Date.now();
  const attempts = (failedAttempts.get(key) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  attempts.push(now);
  failedAttempts.set(key, attempts);
  return Math.max(0, RATE_LIMIT_MAX_ATTEMPTS - attempts.length);
}

export interface AuthActionResult {
  httpStatus: number;
  body: Record<string, unknown>;
  token?: string;
  ttlSeconds?: number;
}

export function registerUser(
  payload: Record<string, unknown>,
  clientIp: string = "127.0.0.1"
): AuthActionResult {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (name.length < 2 || name.length > 80) {
    return {
      httpStatus: 400,
      body: {
        status: "error",
        code: "INVALID_NAME",
        message: "Full name must be between 2 and 80 characters.",
      },
    };
  }

  const emailRes = validateEmail(payload.email);
  if (!emailRes.ok) {
    return {
      httpStatus: 400,
      body: { status: "error", code: "INVALID_EMAIL", message: emailRes.error },
    };
  }
  const email = emailRes.value;

  const rawRole = typeof payload.role === "string" ? payload.role.trim().toLowerCase() : "public";
  if (!isValidRole(rawRole)) {
    return {
      httpStatus: 400,
      body: { status: "error", code: "INVALID_ROLE", message: "Invalid operational role selected." },
    };
  }
  const role: AuthRole = rawRole;

  const password = typeof payload.password === "string" ? payload.password : "";
  const pwEval = evaluatePasswordStrength(password);
  if (!pwEval.valid) {
    return {
      httpStatus: 400,
      body: { status: "error", code: "WEAK_PASSWORD", message: pwEval.reason },
    };
  }

  const badgeRes = validateBadgePin(payload.badgeId ?? payload.badge_id, role);
  if (!badgeRes.ok) {
    return {
      httpStatus: 400,
      body: { status: "error", code: "INVALID_BADGE", message: badgeRes.error },
    };
  }
  const badgeId = badgeRes.value;

  const store = loadStore();
  if (store.users.some((u) => u.email.toLowerCase() === email)) {
    appendAudit(store, "REGISTER_CONFLICT", email, role, "REJECTED", clientIp, "Email already registered");
    saveStore(store);
    return {
      httpStatus: 409,
      body: {
        status: "error",
        code: "EMAIL_EXISTS",
        message: "An account with this email already exists. Please sign in.",
      },
    };
  }

  const record: StoredUser = {
    id: `usr-${crypto.randomBytes(5).toString("hex")}`,
    name,
    email,
    password_hash: hashPassword(password),
    role,
    badge_id: badgeId,
    agency:
      typeof payload.agency === "string" && payload.agency.trim()
        ? payload.agency.trim()
        : badgeId
        ? "Verified Agency Terminal"
        : "Standard Operational Access",
    created_at: new Date().toISOString(),
  };

  store.users.push(record);
  const safeUser = sanitizeUser(record);
  appendAudit(
    store,
    "REGISTER_SUCCESS",
    email,
    role,
    "SUCCESS",
    clientIp,
    `Provisioned Tier ${safeUser.clearance_tier} clearance`
  );
  saveStore(store);

  const ttlSeconds = payload.rememberMe === false ? 4 * 3600 : 30 * 24 * 3600;
  const token = signJwt(
    {
      sub: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
      clearance_tier: safeUser.clearance_tier,
    },
    ttlSeconds
  );

  return {
    httpStatus: 201,
    body: {
      status: "success",
      message: "Clearance provisioned. Entering CYTORN Command Home.",
      user: safeUser,
      redirect_to: "/",
      default_workspace: safeUser.default_route,
      token_type: "Bearer",
      expires_in: ttlSeconds,
    },
    token,
    ttlSeconds,
  };
}

export function loginUser(
  payload: Record<string, unknown>,
  clientIp: string = "127.0.0.1"
): AuthActionResult {
  const emailRes = validateEmail(payload.email);
  if (!emailRes.ok) {
    return {
      httpStatus: 400,
      body: { status: "error", code: "INVALID_EMAIL", message: emailRes.error },
    };
  }
  const email = emailRes.value;

  const password = typeof payload.password === "string" ? payload.password : "";
  const rawRole = typeof payload.role === "string" ? payload.role.trim().toLowerCase() : "";
  if (rawRole && !isValidRole(rawRole)) {
    return {
      httpStatus: 400,
      body: { status: "error", code: "INVALID_ROLE", message: "Invalid operational role specified." },
    };
  }
  const requestedRole = rawRole ? (rawRole as AuthRole) : undefined;

  const rateKey = `${email}|${clientIp}`;
  const rate = checkRateLimit(rateKey);
  const store = loadStore();

  if (!rate.allowed) {
    appendAudit(
      store,
      "LOGIN_RATE_LIMITED",
      email,
      requestedRole ?? "unknown",
      "BLOCKED",
      clientIp,
      `Locked for ${rate.retryAfterSec}s after repeated failures`
    );
    saveStore(store);
    return {
      httpStatus: 429,
      body: {
        status: "error",
        code: "RATE_LIMITED",
        message: `Too many failed attempts. Terminal locked for ${Math.max(1, Math.ceil(rate.retryAfterSec / 60))} minute(s).`,
        retry_after_seconds: rate.retryAfterSec,
      },
    };
  }

  const user = store.users.find((u) => u.email.toLowerCase() === email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    const remaining = recordFailedAttempt(rateKey);
    appendAudit(
      store,
      "LOGIN_FAILED",
      email,
      requestedRole ?? "unknown",
      "DENIED",
      clientIp,
      `Invalid credentials (${remaining} attempts left)`
    );
    saveStore(store);
    return {
      httpStatus: 401,
      body: {
        status: "error",
        code: "INVALID_CREDENTIALS",
        message: `Invalid email or password. ${remaining} attempt(s) remaining before lockout.`,
      },
    };
  }

  // Enforce RBAC role alignment (admins can assume any workspace view)
  if (requestedRole && requestedRole !== user.role && user.role !== "admin") {
    appendAudit(
      store,
      "RBAC_ROLE_MISMATCH",
      email,
      requestedRole,
      "DENIED",
      clientIp,
      `Account role '${user.role}' attempted '${requestedRole}' clearance`
    );
    saveStore(store);
    return {
      httpStatus: 403,
      body: {
        status: "error",
        code: "ROLE_CLEARANCE_DENIED",
        message: `Your account holds '${getRoleProfile(user.role).label}' clearance. Please select the matching role tab.`,
        assigned_role: user.role,
      },
    };
  }

  failedAttempts.delete(rateKey);

  const safeUser = sanitizeUser(user);
  const effectiveRoute =
    user.role === "admin" && requestedRole
      ? getRoleProfile(requestedRole).default_route
      : safeUser.default_route;

  const ttlSeconds = payload.rememberMe === false ? 4 * 3600 : 30 * 24 * 3600;
  const token = signJwt(
    {
      sub: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
      role: safeUser.role,
      clearance_tier: safeUser.clearance_tier,
    },
    ttlSeconds
  );

  appendAudit(
    store,
    "LOGIN_SUCCESS",
    email,
    safeUser.role,
    "SUCCESS",
    clientIp,
    `Authenticated via PBKDF2-SHA512; routed to ${effectiveRoute}`
  );
  saveStore(store);

  return {
    httpStatus: 200,
    body: {
      status: "success",
      message: "Identity verified. Entering CYTORN Command Home.",
      user: safeUser,
      redirect_to: "/",
      default_workspace: effectiveRoute,
      token_type: "Bearer",
      expires_in: ttlSeconds,
    },
    token,
    ttlSeconds,
  };
}

export function getSessionUser(token: string | null | undefined): AuthActionResult {
  if (!token) {
    return {
      httpStatus: 401,
      body: { status: "error", code: "UNAUTHENTICATED", message: "No active session token." },
    };
  }

  const claims = verifyJwt(token);
  if (!claims) {
    return {
      httpStatus: 401,
      body: { status: "error", code: "INVALID_SESSION", message: "Session token is invalid or expired." },
    };
  }

  const store = loadStore();
  const user = store.users.find((u) => u.id === claims.sub);
  if (!user) {
    return {
      httpStatus: 401,
      body: { status: "error", code: "USER_NOT_FOUND", message: "Authenticated account no longer exists." },
    };
  }

  return {
    httpStatus: 200,
    body: {
      status: "success",
      authenticated: true,
      user: sanitizeUser(user),
    },
  };
}

export function logoutUser(token: string | null | undefined, clientIp: string = "127.0.0.1"): AuthActionResult {
  const claims = token ? verifyJwt(token) : null;
  if (claims) {
    const store = loadStore();
    appendAudit(
      store,
      "LOGOUT",
      claims.email,
      claims.role,
      "SUCCESS",
      clientIp,
      "Operator terminated session cleanly"
    );
    saveStore(store);
  }
  return {
    httpStatus: 200,
    body: { status: "success", message: "Session terminated cleanly." },
  };
}

export function getAuditLogs(limit: number = 50): {
  status: "success";
  timestamp_utc: string;
  total_events: number;
  audit_logs: AuditLogEntry[];
} {
  const store = loadStore();
  const safeLimit = Math.max(1, Math.min(200, Number.isFinite(limit) ? Math.floor(limit) : 50));
  return {
    status: "success",
    timestamp_utc: new Date().toISOString(),
    total_events: store.audit_logs.length,
    audit_logs: store.audit_logs.slice(0, safeLimit),
  };
}

