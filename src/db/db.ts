/**
 * Database layer for split-the-bob using Bun's sqlite
 */

import { Database } from "bun:sqlite";
import * as fs from "fs";
import * as path from "path";
import type {
  Split,
  Expense,
  SplitMethodData,
  CreateSplitInput,
  AddExpenseInput,
  UpdateExpenseInput,
} from "../types";

let db: Database | null = null;

/**
 * Get or initialize the database connection
 */
export function getDatabase(): Database {
  if (!db) {
    const dbPath = Bun.env.DATABASE_URL || "./split-the-bob.db";
    db = new Database(dbPath);
    initializeDatabase();
  }
  return db;
}

/**
 * Initialize database schema
 */
function initializeDatabase(): void {
  if (!db) return;

  const schemaPath = path.join(import.meta.dir, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");

  // Execute schema statements
  const statements = schema.split(";").filter((s) => s.trim());
  for (const statement of statements) {
    try {
      db.exec(statement);
    } catch (e) {
      // Table may already exist
      console.debug("Schema statement:", e);
    }
  }
}

/**
 * Generate ID from noun-adjective pairs (simple version)
 */
function generateId(): string {
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

/**
 * Create a new split
 */
export function createSplit(input: CreateSplitInput): Split {
  const database = getDatabase();
  const id = generateId();
  const now = Date.now();

  const stmt = database.prepare(`
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
  const database = getDatabase();
  const stmt = database.prepare(`
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
  const database = getDatabase();
  const stmt = database.prepare(`
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
 * Add an expense to a split
 */
export function addExpense(input: AddExpenseInput): Expense {
  const database = getDatabase();
  const now = Date.now();
  const expenseDate = input.expenseDate || now;

  const splitMethodData: SplitMethodData = {
    method: input.splitMethod,
  };

  if (input.splitMethod === "Amounts" && input.amounts) {
    splitMethodData.amounts = input.amounts;
  }

  const stmt = database.prepare(`
    INSERT INTO expenses (
      split_id, name, amount, currency, original_amount, original_currency,
      payed_by, payed_for, expense_date, split_method, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    input.splitId,
    input.name,
    input.amount,
    input.currency,
    input.originalAmount || input.amount,
    input.originalCurrency || input.currency,
    input.payedBy,
    input.payedFor.join(","),
    expenseDate,
    JSON.stringify(splitMethodData),
    now,
  );

  return {
    id: result.lastInsertRowid as number,
    splitId: input.splitId,
    name: input.name,
    amount: input.amount,
    currency: input.currency,
    originalAmount: input.originalAmount || input.amount,
    originalCurrency: input.originalCurrency || input.currency,
    payedBy: input.payedBy,
    payedFor: input.payedFor,
    expenseDate,
    splitMethod: splitMethodData,
    createdAt: now,
  };
}

/**
 * Get expenses for a split
 */
export function getExpensesBySplitId(splitId: string): Expense[] {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT 
      id, split_id, name, amount, currency, original_amount, original_currency,
      payed_by, payed_for, expense_date, split_method, created_at
    FROM expenses
    WHERE split_id = ?
    ORDER BY created_at DESC
  `);

  const rows = stmt.all(splitId) as any[];
  return rows.map((row) => ({
    id: row.id,
    splitId: row.split_id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    originalAmount: row.original_amount,
    originalCurrency: row.original_currency,
    payedBy: row.payed_by,
    payedFor: row.payed_for.split(","),
    expenseDate: row.expense_date,
    splitMethod: JSON.parse(row.split_method),
    createdAt: row.created_at,
  }));
}

/**
 * Get a single expense by ID
 */
export function getExpense(id: number): Expense | null {
  const database = getDatabase();
  const stmt = database.prepare(`
    SELECT 
      id, split_id, name, amount, currency, original_amount, original_currency,
      payed_by, payed_for, expense_date, split_method, created_at
    FROM expenses
    WHERE id = ?
  `);

  const row = stmt.get(id) as any;
  if (!row) return null;

  return {
    id: row.id,
    splitId: row.split_id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    originalAmount: row.original_amount,
    originalCurrency: row.original_currency,
    payedBy: row.payed_by,
    payedFor: row.payed_for.split(","),
    expenseDate: row.expense_date,
    splitMethod: JSON.parse(row.split_method),
    createdAt: row.created_at,
  };
}

/**
 * Update an expense
 */
export function updateExpense(input: UpdateExpenseInput): Expense | null {
  const database = getDatabase();

  const splitMethodData: SplitMethodData = {
    method: input.splitMethod,
  };

  if (input.splitMethod === "Amounts" && input.amounts) {
    splitMethodData.amounts = input.amounts;
  }

  const stmt = database.prepare(`
    UPDATE expenses
    SET
      name = ?,
      amount = ?,
      currency = ?,
      original_amount = ?,
      original_currency = ?,
      payed_by = ?,
      payed_for = ?,
      expense_date = ?,
      split_method = ?
    WHERE id = ? AND split_id = ?
  `);

  stmt.run(
    input.name,
    input.amount,
    input.currency,
    input.originalAmount || input.amount,
    input.originalCurrency || input.currency,
    input.payedBy,
    input.payedFor.join(","),
    input.expenseDate || Date.now(),
    JSON.stringify(splitMethodData),
    input.id,
    input.splitId,
  );

  return getExpense(input.id);
}

/**
 * Delete an expense
 */
export function deleteExpense(id: number): boolean {
  const database = getDatabase();
  const stmt = database.prepare("DELETE FROM expenses WHERE id = ?");
  stmt.run(id);
  return true;
}

/**
 * Delete a split and all its expenses
 */
export function deleteSplit(id: string): boolean {
  const database = getDatabase();
  const stmt = database.prepare("DELETE FROM splits WHERE id = ?");
  stmt.run(id);
  return true;
}
