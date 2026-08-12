import type { Expense, Balance, SplitMethod } from "./types";

export function balancesFromExpenses(
  expenses: Expense[],
  defaultCurrency: string,
): [Balance[], Record<string, number>] {
  const individualBalances = getIndividualBalances(expenses);
  const [debts, credits] = getCreditsAndDebts(individualBalances);
  const balances = calculateBalances(debts, credits, defaultCurrency);

  return [balances, individualBalances];
}

function getIndividualBalances(
  expenses: Expense[],
): Record<string, number> {
  const balancePerParticipant: Record<string, number> = {};

  for (const expense of expenses) {
    for (const [participant, amount] of splitExpense(expense)) {
      balancePerParticipant[participant] =
        (balancePerParticipant[participant] ?? 0) + amount;
    }
  }

  return balancePerParticipant;
}

function getCreditsAndDebts(
  balancePerParticipant: Record<string, number>,
): [Array<[string, number]>, Array<[string, number]>] {
  const debts: Array<[string, number]> = [];
  const credits: Array<[string, number]> = [];

  for (const [participant, balance] of Object.entries(balancePerParticipant)) {
    if (balance < 0) {
      credits.push([participant, -balance]);
    } else if (balance > 0) {
      debts.push([participant, balance]);
    }
  }

  debts.sort((a, b) => b[1] - a[1]);
  credits.sort((a, b) => b[1] - a[1]);

  return [debts, credits];
}

function splitExpense(expense: Expense): Array<[string, number]> {
  if (expense.split_method.method === "Evenly") {
    return splitEvenly(
      expense.amount,
      expense.payed_by,
      expense.payed_for,
    );
  }

  return splitByAmount(
    expense.amount,
    expense.payed_by,
    expense.split_method,
  );
}

function splitEvenly(
  amount: number,
  payer: string,
  participants: string[],
): Array<[string, number]> {
  const amountPerPerson = amount / participants.length;

  return [
    ...participants.map((p) => [p, amountPerPerson] as [string, number]),
    [payer, -amount],
  ];
}

function splitByAmount(
  amount: number,
  payer: string,
  splitMethod: SplitMethod,
): Array<[string, number]> {
  const amounts: Record<string, number> = splitMethod.details
    ? JSON.parse(splitMethod.details)
    : {};

  return [
    ...Object.entries(amounts).map(
      ([participant, participantAmount]) =>
        [participant, participantAmount] as [string, number],
    ),
    [payer, -amount],
  ];
}

function calculateBalances(
  debts: Array<[string, number]>,
  credits: Array<[string, number]>,
  currency: string,
): Balance[] {
  const balances: Balance[] = [];
  const remainingCredits = [...credits];

  for (const [debtor, debtAmount] of debts) {
    let remainingDebt = debtAmount;

    for (const credit of remainingCredits) {
      if (remainingDebt <= 0) break;

      const [creditor, creditAmount] = credit;
      const amountToPay = Math.min(remainingDebt, creditAmount);

      if (amountToPay > 0) {
        balances.push({
          debtor,
          amount: amountToPay,
          currency,
          creditor,
        });

        remainingDebt -= amountToPay;
        credit[1] -= amountToPay;
      }
    }
  }

  return balances;
}
