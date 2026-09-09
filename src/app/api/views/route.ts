import { NextRequest, NextResponse } from "next/server";
import { getViewCount, incrementViewCount } from "@/lib/views";

export const dynamic = "force-dynamic";

export async function GET() {
  const count = await getViewCount();
  return NextResponse.json({ count });
}

export async function POST(req: NextRequest) {
  const ua = req.headers.get("user-agent") || "";
  const count = await incrementViewCount(ua);
  return NextResponse.json({ count });
}
