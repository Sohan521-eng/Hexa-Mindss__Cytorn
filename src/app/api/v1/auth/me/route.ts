import { NextRequest, NextResponse } from "next/server";
import { extractSessionToken } from "@/lib/auth/http";
import { getSessionUser } from "@/lib/auth/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = extractSessionToken(request);
  const result = getSessionUser(token);
  return NextResponse.json(result.body, { status: result.httpStatus });
}

