import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Currency } from "./types";

let _currencies: Currency[] | null = null;

function ensureCurrencies(): Currency[] {
  if (_currencies) return _currencies;
  const text = readFileSync(
    join(import.meta.dir, "../data/currencies.csv"),
    "utf-8",
  );
  _currencies = text
    .trim()
    .split("\n")
    .filter(Boolean)
    .slice(1)
    .map((line): Currency => {
      const parts = line.split(",");
      return {
        code: parts[0]!.trim(),
        name: parts[1]!.trim(),
        country: parts[2]!.trim(),
        country_code: parts[3]?.trim() ?? null,
      };
    });
  return _currencies;
}

export function getAllCurrencies(): Currency[] {
  return ensureCurrencies();
}
