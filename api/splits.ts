import type { IDatabase } from "../lib/database";
import { createSplitRepository } from "../lib/repositories/split_repository";
import { createExpenseRepository } from "../lib/repositories/expense_repository";
import type { CreateSplitInput, UpdateSplitInput } from "../lib/types";
import { balancesFromExpenses } from "../lib/balances";
import { jsonResponse, NotFoundError, BadRequestError } from "./utils";

export function createSplitHandlers(db: IDatabase) {
  const splitRepo = createSplitRepository(db);
  const expenseRepo = createExpenseRepository(db);

  function distinctParticipants(participants: string[]): string[] {
    const seen = new Set<string>();
    return participants.filter((p) => {
      const key = p.trim().toUpperCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function handleCreateSplit(body: Record<string, unknown>): Response {
    const { description, participants, default_currency } = body as any;

    if (!description || !participants || !default_currency) {
      throw new BadRequestError("Champs obligatoires manquants : description, participants, devise par défaut");
    }

    const input: CreateSplitInput = {
      description,
      participants: distinctParticipants(participants),
      default_currency,
    };

    const id = splitRepo.createSplit(input);
    const split = splitRepo.getSplit(id);
    return jsonResponse(split, 201);
  }

  function handleGetSplit(id: string): Response {
    const split = splitRepo.getSplit(id);
    if (!split) {
      throw new NotFoundError("Groupe introuvable");
    }

    const expenses = expenseRepo.getExpenses(id);
    const [balances, individualBalances] = balancesFromExpenses(expenses, split.default_currency);

    return jsonResponse({
      ...split,
      expenses,
      individualBalances,
      balances,
    });
  }

  function handleUpdateSplit(id: string, body: Record<string, unknown>): Response {
    const existing = splitRepo.getSplit(id);
    if (!existing) {
      throw new NotFoundError("Groupe introuvable");
    }

    const input: UpdateSplitInput = { id };

    if (body.description !== undefined) input.description = body.description as string;
    if (body.participants !== undefined) input.participants = distinctParticipants(body.participants as string[]);
    if (body.default_currency !== undefined) input.default_currency = body.default_currency as string;

    splitRepo.updateSplit(input);
    const split = splitRepo.getSplit(id);
    return jsonResponse(split);
  }

  return { handleCreateSplit, handleGetSplit, handleUpdateSplit };
}
