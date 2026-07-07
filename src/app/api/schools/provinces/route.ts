import { NextRequest, NextResponse } from "next/server";
import { getProvinces } from "@/lib/schools";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  return NextResponse.json({ provinces: getProvinces(query) });
}
