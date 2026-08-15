import { h } from "preact";
import { useApi } from "noxt/runtime";
import { apiRouter } from "@/lib/runtime";

interface CurrencySelectProps {
  name?: string;
  selected?: string;
  onChange?: (code: string) => void;
}

export default function CurrencySelect({
  name,
  selected = "EUR",
  onChange,
}: CurrencySelectProps) {
  const { data: currencies, loading } = useApi(
    apiRouter.api("/api/currencies", "GET"),
    {},
  );

  if (loading) {
    return (
      <select name={name ?? ""} required>
        <option>Chargement...</option>
      </select>
    );
  }

  return (
    <select
      name={name ?? ""}
      value={selected}
      onChange={(e: Event) => onChange?.((e.target as HTMLSelectElement).value)}
      autocomplete="off"
      required
    >
      {(currencies ?? []).map((opt) => (
        <option value={opt.code}>
          {opt.country_code ? (
            <img
              src={`https://flagcdn.com/16x12/${opt.country_code}.png`}
              width="16"
              height="12"
              alt={opt.country}
            />
          ) : null}
          {opt.name}
        </option>
      ))}
    </select>
  );
}
