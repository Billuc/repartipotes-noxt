import { getDb } from "@/lib/database";
import { convertSplitMethodAmounts } from "@/lib/expenses";
import { createCurrencyRepository } from "@/lib/repositories/currency_repository";
import { createExpenseRepository } from "@/lib/repositories/expense_repository";
import { createSplitRepository } from "@/lib/repositories/split_repository";
import {
  VCreateExpenseInput,
  type CreateExpenseInput,
  type SplitMethod,
} from "@/lib/types";
import { mutation } from "noxt";
import * as v from "valibot";

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
  .input(VCreateExpenseInput)
  .output(v.number())
  .endpoint(async ({ input, response }) => {
    const split = splitRepo.getSplit(input.split_id);
    if (!split) {
      response.status = 404;
      response.statusText = "Groupe introuvable";
      return -1;
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

    const create: CreateExpenseInput = {
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

    const id = expenseRepo.createExpense(create);
    response.status = 201;
    return id;
  });
