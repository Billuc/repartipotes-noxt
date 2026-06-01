import type { IDatabase } from "../lib/database";
import { createSplitRepository } from "../lib/repositories/split_repository";
import { createExpenseRepository } from "../lib/repositories/expense_repository";
import type { CreateExpenseInput, UpdateExpenseInput } from "../lib/types";
import { tryGetCurrency, convert as convertCurrency } from "../lib/currencies";
import { buildSplitMethod, convertSplitMethodAmounts } from "../lib/expenses";
import type { SplitMethod } from "../lib/types";
import { jsonResponse, NotFoundError, BadRequestError } from "./utils";

export function createExpenseHandlers(db: IDatabase) {
  const splitRepo = createSplitRepository(db);
  const expenseRepo = createExpenseRepository(db);

  async function convertExpenseAmount(
    amount: number,
    currencyCode: string,
    defaultCurrencyCode: string,
  ): Promise<number> {
    const from = tryGetCurrency(currencyCode);
    const to = tryGetCurrency(defaultCurrencyCode);
    return await convertCurrency(amount, from, to);
  }

  async function handleCreateExpense(body: Record<string, unknown>): Promise<Response> {
    const {
      split_id, name, amount, currency, payed_by, payed_for,
      split_method, amounts_value, expense_date,
    } = body as any;

    if (!split_id || !name || amount == null || !currency || !payed_by || !payed_for || !split_method) {
      throw new BadRequestError("Missing required fields");
    }

    const split = splitRepo.getSplit(split_id);
    if (!split) {
      throw new NotFoundError("Split not found");
    }

    let defaultCurrencyAmount: number;
    let builtSplitMethod: SplitMethod;
    let convertedSplitMethod: SplitMethod;

    try {
      defaultCurrencyAmount = await convertExpenseAmount(amount, currency, split.default_currency);
      builtSplitMethod = buildSplitMethod(amount, payed_for, split_method, amounts_value ?? []);
      convertedSplitMethod = await convertSplitMethodAmounts(
        builtSplitMethod,
        currency,
        split.default_currency,
      );
    } catch (err) {
      throw new BadRequestError(err instanceof Error ? err.message : "Invalid expense data");
    }

    const input: CreateExpenseInput = {
      split_id,
      name,
      amount: defaultCurrencyAmount,
      currency: split.default_currency,
      original_amount: amount,
      original_currency: currency,
      payed_by,
      payed_for,
      expense_date: expense_date ?? Math.floor(Date.now() / 1000),
      split_method: convertedSplitMethod,
    };

    const id = expenseRepo.createExpense(input);
    return jsonResponse({ id }, 201);
  }

  async function handleUpdateExpense(id: number, body: Record<string, unknown>): Promise<Response> {
    const {
      split_id, name, amount, currency, payed_by, payed_for,
      split_method, amounts_value, expense_date,
    } = body as any;

    if (!split_id) {
      throw new BadRequestError("Missing required field: split_id");
    }

    const split = splitRepo.getSplit(split_id);
    if (!split) {
      throw new NotFoundError("Split not found");
    }

    let defaultCurrencyAmount: number;
    let builtSplitMethod: SplitMethod;
    let convertedSplitMethod: SplitMethod;

    try {
      defaultCurrencyAmount = await convertExpenseAmount(amount, currency, split.default_currency);
      builtSplitMethod = buildSplitMethod(amount, payed_for, split_method, amounts_value ?? []);
      convertedSplitMethod = await convertSplitMethodAmounts(
        builtSplitMethod,
        currency,
        split.default_currency,
      );
    } catch (err) {
      throw new BadRequestError(err instanceof Error ? err.message : "Invalid expense data");
    }

    const input: UpdateExpenseInput = {
      id,
      split_id,
      name,
      amount: defaultCurrencyAmount,
      currency: split.default_currency,
      original_amount: amount,
      original_currency: currency,
      payed_by,
      payed_for,
      expense_date: expense_date ?? Math.floor(Date.now() / 1000),
      split_method: convertedSplitMethod,
    };

    expenseRepo.updateExpense(input);
    return jsonResponse({ success: true });
  }

  function handleDeleteExpense(id: number, body: Record<string, unknown>): Response {
    const { split_id } = body as any;
    if (!split_id) {
      throw new BadRequestError("Missing required field: split_id");
    }

    expenseRepo.deleteExpense(id, split_id);
    return jsonResponse({ success: true });
  }

  return { handleCreateExpense, handleUpdateExpense, handleDeleteExpense };
}
