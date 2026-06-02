import { html } from "htm/preact";
import { defineIsland } from "noxt";
import { useFetch } from "noxt/runtime";

interface Currency {
  code: string;
  name: string;
  country: string;
  country_code: string | null;
}

interface CurrencySelectProps {
  name?: string;
  selected?: string;
  onChange?: (code: string) => void;
}

function CurrencySelectRaw({ name, selected = "EUR", onChange }: CurrencySelectProps) {
  const { data: currencies, loading } = useFetch<Currency[]>("/api/currencies");

  if (loading) {
    return html`<select name=${name ?? ""} class="currency-select" required><option>Loading...</option></select>`;
  }

  return html`
    <select
      name=${name ?? ""}
      value=${selected}
      onChange=${(e: Event) => onChange?.((e.target as HTMLSelectElement).value)}
      class="currency-select"
      autocomplete="off"
      required
    >
      ${(currencies ?? []).map(
        (opt) => html`
          <option value=${opt.code}>
            ${opt.country_code
              ? html`<img
                  src="https://flagcdn.com/16x12/${opt.country_code}.png"
                  width="16"
                  height="12"
                  alt=${opt.country}
                />`
              : null}
            ${opt.name}
          </option>
        `,
      )}
    </select>
  `;
}

export default defineIsland(CurrencySelectRaw, import.meta.path);
export { CurrencySelectRaw };
