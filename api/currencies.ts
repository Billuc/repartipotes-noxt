import type { ICurrencyRepository } from "../lib/repositories/currency_repository";
import { jsonResponse } from "./utils";

export function createCurrencyHandlers(currencyRepo: ICurrencyRepository) {
  function handleListCurrencies(): Response {
    const currencies = currencyRepo.getAllCurrencies();
    return jsonResponse(currencies);
  }

  return { handleListCurrencies };
}
