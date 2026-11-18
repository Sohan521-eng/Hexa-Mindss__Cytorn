import { NextRequest, NextResponse } from "next/server";
import { attachSessionCookie, extractClientIp } from "@/lib/auth/http";
import { loginUser } from "@/lib/auth/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const result = loginUser(payload, extractClientIp(request));
    const response = NextResponse.json(result.body, { status: result.httpStatus });

    if (result.token && result.ttlSeconds) {
      attachSessionCookie(response, result.token, result.ttlSeconds);
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      { status: "error", code: "INTERNAL_ERROR", message: "Authentication failed.", detail: String(error) },
      { status: 500 }
    );
  }
}

