import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "cyclo_session";
const JWT_SECRET =
  process.env.CYCLO_JWT_SECRET || "cyclo-ai-eoc-gateway-sha512-secret-2026-v1";

function base64UrlToUint8Array(segment: string): Uint8Array<ArrayBuffer> {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(normalized + padding);
  const buffer = new ArrayBuffer(binary.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function verifySessionJwt(token: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [headerB64, bodyB64, sigB64] = parts;
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(JWT_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signingInput = encoder.encode(`${headerB64}.${bodyB64}`);
    const signature = base64UrlToUint8Array(sigB64);
    const isValidSig = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      signingInput
    );
    if (!isValidSig) return false;

    const payloadJson = new TextDecoder().decode(base64UrlToUint8Array(bodyB64));
    const claims = JSON.parse(payloadJson) as { exp?: number; sub?: string };
    if (!claims || typeof claims.exp !== "number" || !claims.sub) return false;

    const nowSec = Math.floor(Date.now() / 1000);
    return nowSec < claims.exp;
  } catch {
    return false;
  }
}

const AUTH_PATHS = new Set(["/login", "/register"]);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth pages directly
  if (AUTH_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  // Verify cryptographic HttpOnly session token
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const valid = await verifySessionJwt(token);
    if (valid) {
      return NextResponse.next();
    }
  }

  // Unauthenticated or expired session -> gate to /login before homepage
  const loginUrl = new URL("/login", request.url);
  const response = NextResponse.redirect(loginUrl);
  if (token) {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Protect homepage (/) and all operational application routes.
     * Exclude API routes, Next.js internals, and static media/assets.
     */
    "/((?!api|_next/static|_next/image|favicon|apple-touch-icon|icon\\.png|logo\\.png|videos|images|fonts|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|css|js|map|woff|woff2|otf|ttf|json)$).*)",
  ],
};
