import { promises as fs } from "fs";
import path from "path";
import { Redis } from "@upstash/redis";

const VIEW_COUNT_KEY = "ecourt-automate:pageviews";

function viewsFile(): string {
  const dir = process.env.VERCEL
    ? path.join("/tmp", "ecourt-automate")
    : path.join(process.cwd(), "data");
  return path.join(dir, "views.json");
}

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function readFileCount(): Promise<number> {
  try {
    const raw = await fs.readFile(viewsFile(), "utf-8");
    const parsed = JSON.parse(raw) as { count?: number };
    return typeof parsed.count === "number" && parsed.count >= 0 ? parsed.count : 0;
  } catch {
    return 0;
  }
}

async function writeFileCount(count: number): Promise<void> {
  const file = viewsFile();
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify({ count }), "utf-8");
}

function isBot(userAgent: string): boolean {
  return /bot|crawler|spider|slurp|facebookexternalhit|preview|headless|vercel-screenshot/i.test(
    userAgent
  );
}

export async function getViewCount(): Promise<number> {
  const redis = getRedis();
  if (redis) {
    const count = await redis.get<number>(VIEW_COUNT_KEY);
    return typeof count === "number" ? count : 0;
  }
  return readFileCount();
}

export async function incrementViewCount(userAgent: string): Promise<number> {
  if (isBot(userAgent)) {
    return getViewCount();
  }
  const redis = getRedis();
  if (redis) {
    return redis.incr(VIEW_COUNT_KEY);
  }
  const next = (await readFileCount()) + 1;
  await writeFileCount(next);
  return next;
}
