/**
 * CYCLO-AI Server-Side Cryptographic Utilities: PBKDF2-SHA512 & HS256 JWT.
 * Uses Node.js built-in crypto module; 100% compatible with backend/auth/crypto.py.
 */

import crypto from "crypto";

const PBKDF2_ITERATIONS = 120_000;
const PBKDF2_DKLEN = 64;
const JWT_SECRET = process.env.CYCLO_JWT_SECRET || "cyclo-ai-eoc-gateway-sha512-secret-2026-v1";

export const SESSION_COOKIE_NAME = "cyclo_session";

export function hashPassword(password: string, saltHex?: string): string {
  const salt = saltHex ? Buffer.from(saltHex, "hex") : crypto.randomBytes(16);
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, PBKDF2_DKLEN, "sha512");
  return `pbkdf2_sha512$${PBKDF2_ITERATIONS}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) return false;
  const parts = storedHash.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2_sha512") return false;

  const iterations = Number.parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1000) return false;

  try {
    const salt = Buffer.from(parts[2], "hex");
    const expected = Buffer.from(parts[3], "hex");
    const derived = crypto.pbkdf2Sync(password, salt, iterations, expected.length, "sha512");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(segment: string): Buffer {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(normalized + padding, "base64");
}

export interface JwtClaims {
  sub: string;
  email: string;
  name: string;
  role: string;
  clearance_tier: number;
  iat: number;
  exp: number;
}

export function signJwt(
  payload: Omit<JwtClaims, "iat" | "exp">,
  ttlSeconds: number = 3600
): string {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const claims: JwtClaims = { ...payload, iat: now, exp: now + ttlSeconds };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const bodyB64 = base64UrlEncode(JSON.stringify(claims));
  const signingInput = `${headerB64}.${bodyB64}`;
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(signingInput).digest();
  return `${signingInput}.${base64UrlEncode(sig)}`;
}

export function verifyJwt(token: string): JwtClaims | null {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, bodyB64, sigB64] = parts;
  const signingInput = `${headerB64}.${bodyB64}`;
  const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(signingInput).digest();

  try {
    const providedSig = base64UrlDecode(sigB64);
    if (providedSig.length !== expectedSig.length || !crypto.timingSafeEqual(expectedSig, providedSig)) {
      return null;
    }
    const claims = JSON.parse(base64UrlDecode(bodyB64).toString("utf8")) as JwtClaims;
    if (!claims || typeof claims.exp !== "number") return null;
    if (Math.floor(Date.now() / 1000) > claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}

