/**
 * Expense-related database operations
 */

import { db } from "./connection";
import type {
  Expense,
  AddExpenseInput,
  UpdateExpenseInput,
  SplitMethodData,
} from "../types";

/**
 * Add an expense to a split
 */
export function addExpense(input: AddExpenseInput): Expense {
  const now = Date.now();
  const expenseDate = input.expenseDate || now;

  const splitMethodData: SplitMethodData = {
    method: input.splitMethod,
  };

  if (input.splitMethod === "Amounts" && input.amounts) {
    splitMethodData.amounts = input.amounts;
  }

  const stmt = db.prepare(`
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
  const stmt = db.prepare(`
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
  const stmt = db.prepare(`
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
  const splitMethodData: SplitMethodData = {
    method: input.splitMethod,
  };

  if (input.splitMethod === "Amounts" && input.amounts) {
    splitMethodData.amounts = input.amounts;
  }

  const stmt = db.prepare(`
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
  const stmt = db.prepare("DELETE FROM expenses WHERE id = ?");
  stmt.run(id);
  return true;
}
