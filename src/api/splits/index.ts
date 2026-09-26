import { balancesFromExpenses } from "@/lib/balances";
import { getDb } from "@/lib/database";
import { createExpenseRepository } from "@/lib/repositories/expense_repository";
import { createSplitRepository } from "@/lib/repositories/split_repository";
import { VSplit, VSplitData, VUpdateSplitInput } from "@/lib/types";
import { mutation, query } from "noxt/api";
import * as s from "superstruct";

const db = getDb();
const splitRepo = createSplitRepository(db);
const expenseRepo = createExpenseRepository(db);

export const GET = query()
  .input(s.object({ id: s.string() }))
  .output(VSplitData)
  .endpoint((data) => {
    const split = splitRepo.getSplit(data.input.id);
    if (!split) {
      data.response.status = 404;
      data.response.statusText = "Groupe introuvable";
      return {
        id: "",
        description: "",
        participants: [],
        default_currency: "",
        expenses: [],
        individualBalances: {},
        balances: [],
      };
    }

    const expenses = expenseRepo.getExpenses(data.input.id);
    const [balances, individualBalances] = balancesFromExpenses(
      expenses,
      split.default_currency,
    );

    return {
      ...split,
      expenses,
      individualBalances,
      balances,
    };
  });

export const POST = mutation()
  .input(VUpdateSplitInput)
  .output(VSplit)
  .endpoint((data) => {
    const existing = splitRepo.getSplit(data.input.id);
    if (!existing) {
      data.response.status = 404;
      data.response.statusText = "Groupe introuvable";
      return {
        id: "",
        description: "",
        participants: [],
        default_currency: "",
      };
    }

    splitRepo.updateSplit(data.input);
    const split = splitRepo.getSplit(data.input.id)!;
    return split;
  });
