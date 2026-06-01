import { getAllCurrencies, tryGetCurrency, convert } from "../currencies";
import type { Currency } from "../types";

export interface ICurrencyRepository {
  getAllCurrencies(): Currency[];
  tryGetCurrency(code: string): Currency;
  convert(amount: number, from: Currency, to: Currency): Promise<number>;
}

export function createCurrencyRepository(): ICurrencyRepository {
  return { getAllCurrencies, tryGetCurrency, convert };
}
