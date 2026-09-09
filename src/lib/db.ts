import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

let db: Database.Database | null = null;

function dbPath(): string {
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, "views.sqlite");
}

export function getDb(): Database.Database {
  if (db) return db;
  const file = dbPath();
  db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      count INTEGER NOT NULL DEFAULT 0
    );
    INSERT OR IGNORE INTO page_views (id, count) VALUES (1, 0);
  `);
  return db;
}
