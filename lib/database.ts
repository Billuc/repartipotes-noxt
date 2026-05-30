import { Database } from "bun:sqlite";

let db: Database | null = null;

export function getDb(): Database {
  if (!db) {
    const url = process.env.DATABASE_URL ?? "sqlite://stb.data";
    const path = url.replace("sqlite://", "");
    db = new Database(path);
    db.run("PRAGMA journal_mode=WAL");
    initTables();
  }
  return db;
}

function initTables(): void {
  const d = db!;
  d.run(`
    CREATE TABLE IF NOT EXISTS splits (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      participants TEXT,
      default_currency TEXT NOT NULL
    )
  `);
  d.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      split_id TEXT NOT NULL,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      original_amount REAL NOT NULL,
      original_currency TEXT NOT NULL,
      payed_by TEXT NOT NULL,
      payed_for TEXT NOT NULL,
      expense_date REAL NOT NULL,
      split_method TEXT NOT NULL
    )
  `);
}
