import fs from "fs";
import path from "path";

export type Stats = { views: number; copies: number };

/** Displayed installer copies start here; stored `copies` is extra after that. */
export const DOWNLOAD_BASE = 101;

const ZERO: Stats = { views: 0, copies: 0 };

export function shownDownloads(copies: number): number {
  return DOWNLOAD_BASE + Math.max(0, copies);
}
const NS = "quanturatech-ecourt";
const ABACUS = "https://abacus.jasoncameron.dev";

function dataDir(): string {
  if (process.env.VERCEL) return "/tmp";
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function statsPath(): string {
  return path.join(dataDir(), "stats.json");
}

function clamp(n: unknown): number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function readFileStats(): Stats {
  try {
    const parsed = JSON.parse(fs.readFileSync(statsPath(), "utf-8")) as Partial<Stats> & {
      count?: number;
    };
    const views = clamp(parsed.views ?? parsed.count);
    const copies = clamp(parsed.copies);
    return { views, copies };
  } catch {
    /* try legacy views.json */
  }
  try {
    const legacy = path.join(dataDir(), "views.json");
    const parsed = JSON.parse(fs.readFileSync(legacy, "utf-8")) as { count?: number };
    return { views: clamp(parsed.count), copies: 0 };
  } catch {
    return { ...ZERO };
  }
}

function writeFileStats(stats: Stats): void {
  fs.mkdirSync(dataDir(), { recursive: true });
  fs.writeFileSync(statsPath(), JSON.stringify(stats), "utf-8");
}

function useRemote(): boolean {
  return Boolean(process.env.VERCEL);
}

async function abacusGet(key: string): Promise<number | null> {
  try {
    const r = await fetch(`${ABACUS}/get/${NS}/${key}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (r.status === 404) return 0;
    if (!r.ok) return null;
    const d = (await r.json()) as { value?: number };
    return clamp(d.value);
  } catch {
    return null;
  }
}

async function abacusHit(key: string): Promise<number | null> {
  try {
    const r = await fetch(`${ABACUS}/hit/${NS}/${key}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return null;
    const d = (await r.json()) as { value?: number };
    return clamp(d.value);
  } catch {
    return null;
  }
}

export async function getStats(): Promise<Stats> {
  if (useRemote()) {
    const [views, copies] = await Promise.all([abacusGet("views"), abacusGet("copies")]);
    if (views !== null || copies !== null) {
      return { views: views ?? 0, copies: copies ?? 0 };
    }
  }
  return readFileStats();
}

export async function incrementViews(): Promise<Stats> {
  if (useRemote()) {
    const [views, copies] = await Promise.all([abacusHit("views"), abacusGet("copies")]);
    if (views !== null) {
      return { views, copies: copies ?? 0 };
    }
  }
  const cur = readFileStats();
  const next = { ...cur, views: cur.views + 1 };
  writeFileStats(next);
  return next;
}

export async function incrementCopies(): Promise<Stats> {
  if (useRemote()) {
    const [copies, views] = await Promise.all([abacusHit("copies"), abacusGet("views")]);
    if (copies !== null) {
      return { views: views ?? 0, copies };
    }
  }
  const cur = readFileStats();
  const next = { ...cur, copies: cur.copies + 1 };
  writeFileStats(next);
  return next;
}

export function isBot(userAgent: string): boolean {
  return /bot|crawler|spider|slurp|facebookexternalhit|preview|headless|vercel-screenshot/i.test(
    userAgent
  );
}
