import { dbGetCount, dbIncrement } from "@/lib/db";

function isBot(userAgent: string): boolean {
  return /bot|crawler|spider|slurp|facebookexternalhit|preview|headless|vercel-screenshot/i.test(
    userAgent
  );
}

export function getViewCount(): number {
  try {
    return dbGetCount();
  } catch {
    return 0;
  }
}

export function incrementViewCount(userAgent: string): number {
  try {
    if (isBot(userAgent)) {
      return getViewCount();
    }
    return dbIncrement();
  } catch {
    return 0;
  }
}
