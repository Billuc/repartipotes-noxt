import type { SplitMethod } from "./types";
import { tryGetCurrency, convert as convertCurrency } from "./currencies";

export function buildSplitMethod(
  expenseAmount: number,
  payedFor: string[],
  splitMethod: string,
  amountsValue: number[],
): SplitMethod {
  switch (splitMethod) {
    case "Evenly":
      return { method: "Evenly", details: "" };
    case "Amounts": {
      const amounts = buildAmountsMap(payedFor, amountsValue);
      validateAmounts(expenseAmount, amounts);
      return { method: "Amounts", details: JSON.stringify(amounts) };
    }
    default:
      throw new Error("Méthode de répartition inconnue");
  }
}

function buildAmountsMap(
  payedFor: string[],
  amountsValue: number[],
): Record<string, number> {
  if (payedFor.length !== amountsValue.length) {
    throw new Error("Les montants par participant sont invalides");
  }

  const amounts: Record<string, number> = {};

  for (let i = 0; i < payedFor.length; i++) {
    const person = payedFor[i]!;
    const value = amountsValue[i]!;

    if (person === "") continue;

    if (value < 0) {
      throw new Error("Les montants ne peuvent pas être négatifs");
    }

    amounts[person] = value;
  }

  return amounts;
}

function validateAmounts(
  expenseAmount: number,
  amounts: Record<string, number>,
): void {
  const total = Object.values(amounts).reduce((sum, v) => sum + v, 0);
  if (Math.abs(total - expenseAmount) > 0.01) {
    throw new Error(
      "La somme des montants doit être égale au montant de la dépense",
    );
  }
}

export async function convertSplitMethodAmounts(
  splitMethod: SplitMethod,
  expenseCurrencyCode: string,
  defaultCurrencyCode: string,
): Promise<SplitMethod> {
  if (splitMethod.method === "Evenly") return splitMethod;

  const from = tryGetCurrency(expenseCurrencyCode);
  const to = tryGetCurrency(defaultCurrencyCode);
  const amounts: Record<string, number> = splitMethod.details
    ? JSON.parse(splitMethod.details)
    : {};
  const convertedAmounts: Record<string, number> = {};

  for (const [participant, amount] of Object.entries(amounts)) {
    convertedAmounts[participant] = await convertCurrency(amount, from, to);
  }

  return {
    method: "Amounts",
    details: JSON.stringify(convertedAmounts),
  };
}
