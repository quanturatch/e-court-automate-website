import { NextRequest, NextResponse } from "next/server";
import { getViewCount, incrementViewCount } from "@/lib/views";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ count: getViewCount() });
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  const count = incrementViewCount(ua);
  return NextResponse.json({ count });
}
