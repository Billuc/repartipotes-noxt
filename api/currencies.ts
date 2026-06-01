import { createCurrencyRepository } from "../lib/repositories/currency_repository";
import { jsonResponse } from "./utils";

export function createCurrencyHandlers() {
  const currencyRepo = createCurrencyRepository();
  function handleListCurrencies(): Response {
    const currencies = currencyRepo.getAllCurrencies();
    return jsonResponse(currencies);
  }

  return { handleListCurrencies };
}
