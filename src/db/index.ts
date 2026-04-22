/**
 * Database layer exports
 * Re-exports all database functions for backward compatibility
 */

export { db, generateId } from "./connection";

export { createSplit, getSplit, getAllSplits, deleteSplit } from "./splits";

export {
  addExpense,
  getExpensesBySplitId,
  getExpense,
  updateExpense,
  deleteExpense,
} from "./expenses";
