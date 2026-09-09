import { getDb } from "@/lib/db";

function isBot(userAgent: string): boolean {
  return /bot|crawler|spider|slurp|facebookexternalhit|preview|headless|vercel-screenshot/i.test(
    userAgent
  );
}

export function getViewCount(): number {
  const row = getDb()
    .prepare("SELECT count FROM page_views WHERE id = 1")
    .get() as { count: number } | undefined;
  return row?.count ?? 0;
}

export function incrementViewCount(userAgent: string): number {
  if (isBot(userAgent)) {
    return getViewCount();
  }
  const row = getDb()
    .prepare(
      "UPDATE page_views SET count = count + 1 WHERE id = 1 RETURNING count"
    )
    .get() as { count: number };
  return row.count;
}
