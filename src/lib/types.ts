import * as s from "superstruct";

export interface Split {
  id: string;
  description: string;
  participants: string[];
  default_currency: string;
}

export const VSplit: s.Struct<Split> = s.object({
  id: s.string(),
  description: s.string(),
  participants: s.array(s.string()),
  default_currency: s.string(),
});

export interface CreateSplitInput {
  description: string;
  participants: string[];
  default_currency: string;
}

export const VCreateSplitInput: s.Struct<CreateSplitInput> = s.object({
  description: s.string(),
  participants: s.array(s.string()),
  default_currency: s.string(),
});

export interface UpdateSplitInput {
  id: string;
  description?: string;
  participants?: string[];
  default_currency?: string;
}

export const VUpdateSplitInput: s.Struct<UpdateSplitInput> = s.object({
  id: s.string(),
  description: s.optional(s.string()),
  participants: s.optional(s.array(s.string())),
  default_currency: s.optional(s.string()),
});

export type SplitMethod =
  | { method: "Evenly"; details: string }
  | { method: "Amounts"; details: string };

const VSplitMethod: s.Struct<SplitMethod> = s.union([
  s.object({ method: s.literal("Evenly"), details: s.string() }),
  s.object({ method: s.literal("Amounts"), details: s.string() }),
]);

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

export const VExpense: s.Struct<Expense> = s.object({
  id: s.number(),
  split_id: s.string(),
  name: s.string(),
  amount: s.number(),
  currency: s.string(),
  original_amount: s.number(),
  original_currency: s.string(),
  payed_by: s.string(),
  payed_for: s.array(s.string()),
  expense_date: s.number(),
  split_method: VSplitMethod,
});

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

export const VCreateExpenseInput = s.object({
  split_id: s.string(),
  name: s.string(),
  amount: s.number(),
  currency: s.string(),
  payed_by: s.string(),
  payed_for: s.array(s.string()),
  expense_date: s.number(),
  split_method: VSplitMethod,
});

export interface UpdateExpenseInput extends CreateExpenseInput {
  id: number;
}

export const VUpdateExpenseInput = s.object({
  id: s.number(),
  split_id: s.string(),
  name: s.string(),
  amount: s.number(),
  currency: s.string(),
  payed_by: s.string(),
  payed_for: s.array(s.string()),
  expense_date: s.number(),
  split_method: VSplitMethod,
});

export interface Currency {
  code: string;
  name: string;
  country: string;
  country_code: string | null;
}

export const VCurrency: s.Struct<Currency> = s.object({
  code: s.string(),
  name: s.string(),
  country: s.string(),
  country_code: s.nullable(s.string()),
});

export interface Balance {
  debtor: string;
  amount: number;
  currency: string;
  creditor: string;
}

export const VBalance: s.Struct<Balance> = s.object({
  debtor: s.string(),
  amount: s.number(),
  currency: s.string(),
  creditor: s.string(),
});

export interface SplitData {
  id: string;
  description: string;
  participants: string[];
  default_currency: string;
  expenses: Expense[];
  individualBalances: Record<string, number>;
  balances: Balance[];
}

export const VSplitData: s.Struct<SplitData> = s.object({
  id: s.string(),
  description: s.string(),
  participants: s.array(s.string()),
  default_currency: s.string(),
  expenses: s.array(VExpense),
  individualBalances: s.record(s.string(), s.number()),
  balances: s.array(VBalance),
});
