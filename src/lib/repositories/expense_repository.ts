import type { IDatabase } from "../database";
import type {
  Expense,
  CreateExpenseInput,
  UpdateExpenseInput,
  SplitMethod,
} from "../types";

interface ExpenseRow {
  id: number;
  split_id: string;
  name: string;
  amount: number;
  currency: string;
  original_amount: number;
  original_currency: string;
  payed_by: string;
  payed_for: string;
  expense_date: number;
  split_method: string;
}

function rowToExpense(row: ExpenseRow): Expense {
  return {
    id: row.id,
    split_id: row.split_id,
    name: row.name,
    amount: row.amount,
    currency: row.currency,
    original_amount: row.original_amount,
    original_currency: row.original_currency,
    payed_by: row.payed_by,
    payed_for: row.payed_for ? row.payed_for.split(",") : [],
    expense_date: row.expense_date,
    split_method: JSON.parse(row.split_method) as SplitMethod,
  };
}

export interface IExpenseRepository {
  getExpenses(splitId: string): Expense[];
  createExpense(input: CreateExpenseInput): number;
  updateExpense(input: UpdateExpenseInput): void;
  deleteExpense(id: number, splitId: string): void;
}

class ExpenseRepository implements IExpenseRepository {
  constructor(private db: IDatabase) {}

  getExpenses(splitId: string): Expense[] {
    const rows = this.db.query<ExpenseRow>(
      "SELECT * FROM expenses WHERE split_id = ?"
    ).all(splitId);
    return rows.map(rowToExpense);
  }

  createExpense(input: CreateExpenseInput): number {
    const result = this.db.query(
      `INSERT INTO expenses (split_id, name, amount, currency, original_amount, original_currency, payed_by, payed_for, expense_date, split_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      input.split_id,
      input.name,
      input.amount,
      input.currency,
      input.original_amount,
      input.original_currency,
      input.payed_by,
      input.payed_for.join(","),
      input.expense_date,
      JSON.stringify(input.split_method),
    );
    return Number(result.lastInsertRowid);
  }

  updateExpense(input: UpdateExpenseInput): void {
    this.db.query(
      `UPDATE expenses
       SET name = ?, amount = ?, currency = ?, original_amount = ?,
           original_currency = ?, payed_by = ?, payed_for = ?,
           expense_date = ?, split_method = ?
       WHERE id = ?`
    ).run(
      input.name,
      input.amount,
      input.currency,
      input.original_amount,
      input.original_currency,
      input.payed_by,
      input.payed_for.join(","),
      input.expense_date,
      JSON.stringify(input.split_method),
      input.id,
    );
  }

  deleteExpense(id: number, splitId: string): void {
    this.db.query(
      "DELETE FROM expenses WHERE id = ? AND split_id = ?"
    ).run(id, splitId);
  }
}

export function createExpenseRepository(db: IDatabase): IExpenseRepository {
  return new ExpenseRepository(db);
}
