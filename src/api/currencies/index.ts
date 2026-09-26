import { query } from "noxt/api";
import { createCurrencyRepository } from "@/lib/repositories/currency_repository";
import * as s from "superstruct";
import { VCurrency } from "@/lib/types";

const currencyRepo = createCurrencyRepository();

export const GET = query()
  .output(s.array(VCurrency))
  .endpoint((_data) => {
    const currencies = currencyRepo.getAllCurrencies();
    return currencies;
  });
