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

export function tryGetCurrency(code: string): Currency {
  const currency = ensureCurrencies().find(
    (c) => c.code.toUpperCase() === code.toUpperCase(),
  );
  if (!currency) {
    throw new Error(`Unknown currency: ${code}`);
  }
  return currency;
}

export async function convert(
  amount: number,
  from: Currency,
  to: Currency,
): Promise<number> {
  if (from.code === to.code) return amount;

  const token = process.env.EXCHANGE_RATE_API_KEY;
  if (!token) {
    throw new Error("Missing env var: EXCHANGE_RATE_API_KEY");
  }

  const endpoint = `https://v6.exchangerate-api.com/v6/${token}/pair/${from.code}/${to.code}/${amount.toFixed(2)}`;

  const response = await fetch(endpoint);
  const data: any = await response.json();

  if (data.result === "success") {
    return data.conversion_result as number;
  }

  if (data.result === "error") {
    throw new Error(`API error: ${data["error-type"] ?? "unknown"}`);
  }

  throw new Error("Incorrect API data");
}
