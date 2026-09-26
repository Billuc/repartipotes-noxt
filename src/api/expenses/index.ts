import { getDb } from "@/lib/database";
import { createSplitRepository } from "@/lib/repositories/split_repository";
import { createExpenseRepository } from "@/lib/repositories/expense_repository";
import { createCurrencyRepository } from "@/lib/repositories/currency_repository";
import { VUpdateExpenseInput, type UpdateExpenseInput } from "@/lib/types";
import { convertSplitMethodAmounts } from "@/lib/expenses";
import type { SplitMethod } from "@/lib/types";
import { mutation } from "noxt/api";
import * as s from "superstruct";

const db = getDb();

const splitRepo = createSplitRepository(db);
const expenseRepo = createExpenseRepository(db);
const currencyRepo = createCurrencyRepository();

async function convertExpenseAmount(
  amount: number,
  currencyCode: string,
  defaultCurrencyCode: string,
): Promise<number> {
  const from = currencyRepo.tryGetCurrency(currencyCode);
  const to = currencyRepo.tryGetCurrency(defaultCurrencyCode);
  return await currencyRepo.convert(amount, from, to);
}

export const POST = mutation()
  .input(VUpdateExpenseInput)
  .output(s.object({ success: s.boolean() }))
  .endpoint(async ({ input, response }) => {
    const split = splitRepo.getSplit(input.split_id);
    if (!split) {
      response.status = 404;
      response.statusText = "Groupe introuvable";
      return { success: false };
    }

    let defaultCurrencyAmount: number;
    let convertedSplitMethod: SplitMethod;

    try {
      defaultCurrencyAmount = await convertExpenseAmount(
        input.amount,
        input.currency,
        split.default_currency,
      );
      convertedSplitMethod = await convertSplitMethodAmounts(
        input.split_method,
        input.currency,
        split.default_currency,
      );
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : "Données de dépense invalides",
      );
    }

    const update: UpdateExpenseInput = {
      id: input.id,
      split_id: input.split_id,
      name: input.name,
      amount: defaultCurrencyAmount,
      currency: split.default_currency,
      original_amount: input.amount,
      original_currency: input.currency,
      payed_by: input.payed_by,
      payed_for: input.payed_for,
      expense_date: input.expense_date ?? Math.floor(Date.now() / 1000),
      split_method: convertedSplitMethod,
    };

    expenseRepo.updateExpense(update);
    return { success: true };
  });

export const DELETE = mutation()
  .input(s.object({ id: s.number(), split_id: s.string() }))
  .output(s.object({ success: s.boolean() }))
  .endpoint(({ input }) => {
    expenseRepo.deleteExpense(input.id, input.split_id);
    return { success: true };
  });
