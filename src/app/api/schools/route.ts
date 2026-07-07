import { NextRequest, NextResponse } from "next/server";
import { getSchools } from "@/lib/schools";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const province = request.nextUrl.searchParams.get("province") ?? "";
  const query = request.nextUrl.searchParams.get("q") ?? undefined;
  if (!province) {
    return NextResponse.json({ schools: [] });
  }
  return NextResponse.json({ schools: getSchools(province, query) });
}
