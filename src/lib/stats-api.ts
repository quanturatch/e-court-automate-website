import { NextRequest, NextResponse } from "next/server";
import { getStats, incrementCopies, incrementViews, isBot } from "@/lib/stats";

function json(stats: { views: number; copies: number }) {
  return NextResponse.json({
    views: stats.views,
    copies: stats.copies,
    count: stats.views,
  });
}

export async function GET() {
  try {
    return json(await getStats());
  } catch {
    return json({ views: 0, copies: 0 });
  }
}

export async function POST(req: NextRequest) {
  try {
    let kind = "view";
    try {
      const body = (await req.json()) as { kind?: string };
      if (body?.kind === "copy") kind = "copy";
    } catch {
      /* empty body = page view */
    }
    if (kind === "copy") {
      return json(await incrementCopies());
    }
    const ua = req.headers.get("user-agent") || "";
    if (isBot(ua)) return json(await getStats());
    return json(await incrementViews());
  } catch {
    return json({ views: 0, copies: 0 });
  }
}
