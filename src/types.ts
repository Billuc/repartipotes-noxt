/**
 * Type definitions for split-the-bob
 * Ported from Rust data structures
 */

export type SplitMethod = "Evenly" | "Amounts";

export interface SplitMethodData {
  method: SplitMethod;
  amounts?: Record<string, number>; // For "Amounts" method
}

/**
 * Represents a split (trip/event)
 */
export interface Split {
  id: string;
  description: string;
  participants: string[];
  defaultCurrency: string;
  createdAt: number; // Unix timestamp in ms
}

/**
 * Represents an expense within a split
 */
export interface Expense {
  id: number;
  splitId: string;
  name: string;
  amount: number; // Normalized to default currency
  currency: string;
  originalAmount: number;
  originalCurrency: string;
  payedBy: string;
  payedFor: string[]; // List of participants who benefit
  expenseDate: number; // Unix timestamp in ms
  splitMethod: SplitMethodData;
  createdAt: number; // Unix timestamp in ms
}

/**
 * Calculated balance between two participants
 */
export interface Balance {
  debtor: string;
  creditor: string;
  amount: number;
  currency: string;
}

/**
 * Currency information
 */
export interface Currency {
  code: string;
  name: string;
  country: string;
  countryCode?: string;
}

/**
 * Form input for creating a split
 */
export interface CreateSplitInput {
  description: string;
  participants: string[];
  defaultCurrency: string;
}

/**
 * Form input for adding an expense
 */
export interface AddExpenseInput {
  splitId: string;
  name: string;
  amount: number;
  currency: string;
  payedBy: string;
  payedFor: string[];
  splitMethod: SplitMethod;
  amounts?: Record<string, number>; // For "Amounts" split method
  expenseDate?: number; // Unix timestamp, defaults to now
}

/**
 * Form input for updating an expense
 */
export interface UpdateExpenseInput extends AddExpenseInput {
  id: number;
}

/**
 * Form input for updating a split
 */
export interface UpdateSplitInput {
  splitId: string;
  description?: string;
  participants?: string[];
  defaultCurrency?: string;
}
