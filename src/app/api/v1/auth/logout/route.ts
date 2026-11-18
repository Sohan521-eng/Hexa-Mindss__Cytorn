import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie, extractClientIp, extractSessionToken } from "@/lib/auth/http";
import { logoutUser } from "@/lib/auth/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const token = extractSessionToken(request);
  const result = logoutUser(token, extractClientIp(request));
  const response = NextResponse.json(result.body, { status: result.httpStatus });
  clearSessionCookie(response);
  return response;
}

