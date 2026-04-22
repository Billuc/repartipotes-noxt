/**
 * Split-related database operations
 */

import { db, generateId } from "./connection";
import type { Split, CreateSplitInput } from "../types";

/**
 * Create a new split
 */
export function createSplit(input: CreateSplitInput): Split {
  const id = generateId();
  const now = Date.now();

  const stmt = db.prepare(`
    INSERT INTO splits (id, description, participants, default_currency, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    input.description,
    input.participants.join(","),
    input.defaultCurrency,
    now,
  );

  return {
    id,
    description: input.description,
    participants: input.participants,
    defaultCurrency: input.defaultCurrency,
    createdAt: now,
  };
}

/**
 * Get a split by ID
 */
export function getSplit(id: string): Split | null {
  const stmt = db.prepare(`
    SELECT id, description, participants, default_currency, created_at
    FROM splits
    WHERE id = ?
  `);

  const row = stmt.get(id) as any;
  if (!row) return null;

  return {
    id: row.id,
    description: row.description,
    participants: row.participants.split(","),
    defaultCurrency: row.default_currency,
    createdAt: row.created_at,
  };
}

/**
 * Get all splits
 */
export function getAllSplits(): Split[] {
  const stmt = db.prepare(`
    SELECT id, description, participants, default_currency, created_at
    FROM splits
    ORDER BY created_at DESC
  `);

  const rows = stmt.all() as any[];
  return rows.map((row) => ({
    id: row.id,
    description: row.description,
    participants: row.participants.split(","),
    defaultCurrency: row.default_currency,
    createdAt: row.created_at,
  }));
}

/**
 * Delete a split and all its expenses
 */
export function deleteSplit(id: string): boolean {
  const stmt = db.prepare("DELETE FROM splits WHERE id = ?");
  stmt.run(id);
  return true;
}
