import fs from "fs";
import path from "path";

type Row = { count: number };

function dataDir(): string {
  if (process.env.VERCEL) {
    return "/tmp";
  }
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function sqlitePath(): string {
  return path.join(dataDir(), "views.sqlite");
}

function jsonPath(): string {
  return path.join(dataDir(), "views.json");
}

let sqlite: ReturnType<typeof import("better-sqlite3")> | null | undefined;

function trySqlite(): NonNullable<typeof sqlite> | null {
  if (sqlite !== undefined) return sqlite;
  try {
    // Native module — may fail on some hosts; JSON file is the fallback.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3") as typeof import("better-sqlite3");
    const db = new Database(sqlitePath());
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS page_views (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        count INTEGER NOT NULL DEFAULT 0
      );
      INSERT OR IGNORE INTO page_views (id, count) VALUES (1, 0);
    `);
    sqlite = db;
    return db;
  } catch {
    sqlite = null;
    return null;
  }
}

function readJson(): number {
  try {
    const parsed = JSON.parse(fs.readFileSync(jsonPath(), "utf-8")) as { count?: number };
    return typeof parsed.count === "number" && parsed.count >= 0 ? parsed.count : 0;
  } catch {
    return 0;
  }
}

function writeJson(count: number): void {
  fs.writeFileSync(jsonPath(), JSON.stringify({ count }), "utf-8");
}

export function dbGetCount(): number {
  const db = trySqlite();
  if (db) {
    const row = db.prepare("SELECT count FROM page_views WHERE id = 1").get() as Row | undefined;
    return row?.count ?? 0;
  }
  return readJson();
}

export function dbIncrement(): number {
  const db = trySqlite();
  if (db) {
    const row = db
      .prepare("UPDATE page_views SET count = count + 1 WHERE id = 1 RETURNING count")
      .get() as Row;
    return row.count;
  }
  const next = readJson() + 1;
  writeJson(next);
  return next;
}
