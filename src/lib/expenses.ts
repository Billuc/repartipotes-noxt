import type { SplitMethod } from "./types";
import { tryGetCurrency, convert as convertCurrency } from "./currencies";

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
