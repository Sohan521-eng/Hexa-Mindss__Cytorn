import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/lib/auth/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : 50;
  return NextResponse.json(getAuditLogs(limit), { status: 200 });
}

