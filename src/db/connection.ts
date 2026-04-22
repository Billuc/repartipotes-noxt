/**
 * Database connection and initialization for split-the-bob using Bun's sqlite
 */

import { Database } from "bun:sqlite";
import * as fs from "fs";
import * as path from "path";

// Database instance - created once when module is loaded
const dbPath = Bun.env.DATABASE_URL || "./split-the-bob.db";
const db = new Database(dbPath);
initializeDatabase(db);

/**
 * Initialize database schema
 */
function initializeDatabase(db: Database): void {
  const schemaPath = path.join(import.meta.dir, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute schema statements
  const statements = schema.split(";").filter((s) => s.trim());
  for (const statement of statements) {
    try {
      db.run(statement);
    } catch (e) {
      // Table may already exist
      console.debug("Schema statement:", e);
    }
  }
}

export { db };

/**
 * Generate ID from noun-adjective pairs (simple version)
 */
export function generateId(): string {
  const adjectives = [
    "colorful",
    "shiny",
    "quiet",
    "brave",
    "clever",
    "elegant",
    "fancy",
    "gentle",
    "happy",
    "kind",
  ];
  const nouns = [
    "elephant",
    "tiger",
    "dolphin",
    "penguin",
    "butterfly",
    "eagle",
    "panda",
    "fox",
    "otter",
    "koala",
  ];

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}-${noun}`;
}
