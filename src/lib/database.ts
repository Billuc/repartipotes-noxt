import { Database } from "bun:sqlite";
import type { Changes, SQLQueryBindings } from "bun:sqlite";

export interface IDatabase {
  query<Row>(sql: string): {
    all(...params: SQLQueryBindings[]): Row[];
    get(...params: SQLQueryBindings[]): Row | null;
    run(...params: SQLQueryBindings[]): Changes;
  };
}

class BunDatabase implements IDatabase {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  query<Row>(sql: string) {
    const stmt = this.db.query<Row, SQLQueryBindings[]>(sql);
    return {
      all: (...params: SQLQueryBindings[]) => stmt.all(...params),
      get: (...params: SQLQueryBindings[]) => stmt.get(...params),
      run: (...params: SQLQueryBindings[]) => stmt.run(...params),
    };
  }
}

let db: IDatabase | null = null;

export function getDb(): IDatabase {
  if (!db) {
    const url = process.env.DATABASE_URL ?? "sqlite://stb.data";
    const path = url.replace("sqlite://", "");
    const d = new Database(path);
    d.run("PRAGMA journal_mode=WAL");
    initTables(d);
    db = new BunDatabase(d);
  }
  return db;
}

function initTables(d: Database): void {
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
