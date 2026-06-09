export interface Split {
  id: string;
  description: string;
  participants: string[];
  default_currency: string;
}

export interface CreateSplitInput {
  description: string;
  participants: string[];
  default_currency: string;
}

export interface UpdateSplitInput {
  id: string;
  description?: string;
  participants?: string[];
  default_currency?: string;
}

export interface Expense {
  id: number;
  split_id: string;
  name: string;
  amount: number;
  currency: string;
  original_amount: number;
  original_currency: string;
  payed_by: string;
  payed_for: string[];
  expense_date: number;
  split_method: SplitMethod;
}

export type SplitMethod =
  | { method: "Evenly"; details: string }
  | { method: "Amounts"; details: string };

export interface CreateExpenseInput {
  split_id: string;
  name: string;
  amount: number;
  currency: string;
  original_amount: number;
  original_currency: string;
  payed_by: string;
  payed_for: string[];
  expense_date: number;
  split_method: SplitMethod;
}

export interface UpdateExpenseInput extends CreateExpenseInput {
  id: number;
}

export interface Currency {
  code: string;
  name: string;
  country: string;
  country_code: string | null;
}

export interface Balance {
  debtor: string;
  amount: number;
  currency: string;
  creditor: string;
}

export interface SplitData {
  id: string;
  description: string;
  participants: string[];
  default_currency: string;
  expenses: Expense[];
  individualBalances: Record<string, number>;
  balances: Balance[];
}
