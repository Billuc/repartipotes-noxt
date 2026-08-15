import { query } from "noxt";
import { createCurrencyRepository } from "@/lib/repositories/currency_repository";
import * as v from "valibot";
import { VCurrency } from "@/lib/types";

const currencyRepo = createCurrencyRepository();

export const GET = query()
  .output(v.array(VCurrency))
  .endpoint((_data) => {
    const currencies = currencyRepo.getAllCurrencies();
    return currencies;
  });
