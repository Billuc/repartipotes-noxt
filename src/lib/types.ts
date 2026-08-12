import * as v from "valibot";

export interface Split {
  id: string;
  description: string;
  participants: string[];
  default_currency: string;
}

export const VSplit: v.GenericSchema<Split> = v.object({
  id: v.string(),
  description: v.string(),
  participants: v.array(v.string()),
  default_currency: v.string(),
});

export interface CreateSplitInput {
  description: string;
  participants: string[];
  default_currency: string;
}

export const VCreateSplitInput: v.GenericSchema<CreateSplitInput> = v.object({
  description: v.string(),
  participants: v.array(v.string()),
  default_currency: v.string(),
});

export interface UpdateSplitInput {
  id: string;
  description?: string;
  participants?: string[];
  default_currency?: string;
}

export const VUpdateSplitInput: v.GenericSchema<UpdateSplitInput> = v.object({
  id: v.string(),
  description: v.optional(v.string()),
  participants: v.optional(v.array(v.string())),
  default_currency: v.optional(v.string()),
});

export type SplitMethod =
  | { method: "Evenly"; details: string }
  | { method: "Amounts"; details: string };

const VSplitMethod: v.GenericSchema<SplitMethod> = v.union([
  v.object({ method: v.literal("Evenly"), details: v.string() }),
  v.object({ method: v.literal("Amounts"), details: v.string() }),
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

export const VExpense: v.GenericSchema<Expense> = v.object({
  id: v.number(),
  split_id: v.string(),
  name: v.string(),
  amount: v.number(),
  currency: v.string(),
  original_amount: v.number(),
  original_currency: v.string(),
  payed_by: v.string(),
  payed_for: v.array(v.string()),
  expense_date: v.number(),
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

export const VCreateExpenseInput: v.GenericSchema<CreateExpenseInput> =
  v.object({
    split_id: v.string(),
    name: v.string(),
    amount: v.number(),
    currency: v.string(),
    original_amount: v.number(),
    original_currency: v.string(),
    payed_by: v.string(),
    payed_for: v.array(v.string()),
    expense_date: v.number(),
    split_method: VSplitMethod,
  });

export interface UpdateExpenseInput extends CreateExpenseInput {
  id: number;
}

export const VUpdateExpenseInput: v.GenericSchema<UpdateExpenseInput> =
  v.object({
    id: v.number(),
    split_id: v.string(),
    name: v.string(),
    amount: v.number(),
    currency: v.string(),
    original_amount: v.number(),
    original_currency: v.string(),
    payed_by: v.string(),
    payed_for: v.array(v.string()),
    expense_date: v.number(),
    split_method: VSplitMethod,
  });

export interface Currency {
  code: string;
  name: string;
  country: string;
  country_code: string | null;
}

export const VCurrency: v.GenericSchema<Currency> = v.object({
  code: v.string(),
  name: v.string(),
  country: v.string(),
  country_code: v.nullable(v.string()),
});

export interface Balance {
  debtor: string;
  amount: number;
  currency: string;
  creditor: string;
}

export const VBalance: v.GenericSchema<Balance> = v.object({
  debtor: v.string(),
  amount: v.number(),
  currency: v.string(),
  creditor: v.string(),
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

export const VSplitData: v.GenericSchema<SplitData> = v.object({
  id: v.string(),
  description: v.string(),
  participants: v.array(v.string()),
  default_currency: v.string(),
  expenses: v.array(VExpense),
  individualBalances: v.record(v.string(), v.number()),
  balances: v.array(VBalance),
});
