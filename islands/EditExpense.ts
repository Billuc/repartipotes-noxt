import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { defineIsland } from "noxt";
import CurrencySelect from "./CurrencySelect";
import type { SplitData } from "../lib/types.ts";

function timestampToDateTimeLocal(ts: number): string {
  const d = new Date(ts * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateTimeLocalToTimestamp(val: string): number {
  return Math.floor(new Date(val).getTime() / 1000);
}

function EditExpense() {
  const [splitId, setSplitId] = useState<string | null>(null);
  const [expenseId, setExpenseId] = useState<number | null>(null);
  const [splitData, setSplitData] = useState<SplitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("");
  const [payedBy, setPayedBy] = useState("");
  const [payedFor, setPayedFor] = useState<string[]>([]);
  const [splitMethod, setSplitMethod] = useState<"Evenly" | "Amounts">(
    "Evenly",
  );
  const [amountsValue, setAmountsValue] = useState<Record<string, string>>({});
  const [dateTime, setDateTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isEditing = expenseId !== null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sId = params.get("split_id");
    const eId = params.get("expense_id");
    if (sId) {
      setSplitId(sId);
      if (eId) setExpenseId(Number(eId));
    } else {
      setError("Identifiant de groupe manquant");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!splitId) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/splits/${splitId}`);
        if (!res.ok) {
          throw new Error(`Échec du chargement du groupe (${res.status})`);
        }
        const json = (await res.json()) as SplitData;
        if (!cancelled) {
          setSplitData(json);
          setCurrency(json.default_currency);
          setPayedFor([...json.participants]);
          setDateTime(timestampToDateTimeLocal(Math.floor(Date.now() / 1000)));

          if (expenseId) {
            const found = json.expenses.find((e) => e.id === expenseId);
            if (found) {
              setName(found.name);
              setAmount(found.original_amount.toString());
              setCurrency(found.original_currency);
              setPayedBy(found.payed_by);
              setPayedFor([...found.payed_for]);
              setSplitMethod(
                found.split_method.method === "Amounts" ? "Amounts" : "Evenly",
              );
              if (
                found.split_method.method === "Amounts" &&
                found.split_method.details
              ) {
                setAmountsValue(JSON.parse(found.split_method.details));
              }
              setDateTime(timestampToDateTimeLocal(found.expense_date));
            } else {
              setError("Dépense introuvable");
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Échec du chargement des données");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [splitId, expenseId]);

  const toggleParticipant = (participant: string) => {
    setPayedFor((prev) =>
      prev.includes(participant)
        ? prev.filter((p) => p !== participant)
        : [...prev, participant],
    );
  };

  const updateAmountValue = (participant: string, value: string) => {
    setAmountsValue((prev) => ({ ...prev, [participant]: value }));
  };

  const totalAmount = parseFloat(amount) || 0;
  const checkedCount = payedFor.length;
  const perPerson = checkedCount > 0 ? totalAmount / checkedCount : 0;

  const validateAmounts = (): string | null => {
    if (splitMethod === "Amounts") {
      const total = payedFor.reduce(
        (sum, p) => sum + (parseFloat(amountsValue[p] ?? "0") || 0),
        0,
      );
      if (Math.abs(total - totalAmount) > 0.01) {
        return `La somme des montants individuels (${total.toFixed(2)}) doit être égale au montant total (${totalAmount.toFixed(2)})`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const validationError = validateAmounts();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (!name.trim() || !amount || !payedBy || payedFor.length === 0) {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const amountsArray = payedFor.map((p) =>
      splitMethod === "Amounts"
        ? parseFloat(amountsValue[p] ?? "0") || 0
        : perPerson,
    );

    const body = {
      split_id: splitId,
      name: name.trim(),
      amount: totalAmount,
      currency,
      payed_by: payedBy,
      payed_for: payedFor,
      split_method: splitMethod,
      amounts_value: amountsArray,
      expense_date: dateTimeLocalToTimestamp(dateTime),
    };

    try {
      const url = isEditing ? `/api/expenses/${expenseId}` : "/api/expenses";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        throw new Error((errData.error as string) ?? "Échec de l'enregistrement de la dépense");
      }

      window.location.href = `/split?split_id=${splitId}`;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!expenseId) return;
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette dépense ?")) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ split_id: splitId }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as Record<
          string,
          unknown
        >;
        throw new Error(
          (errData.error as string) ?? "Échec de la suppression de la dépense",
        );
      }

      window.location.href = `/split?split_id=${splitId}`;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const getAmountFor = (participant: string): string => {
    if (splitMethod === "Evenly") {
      return checkedCount > 0 ? perPerson.toFixed(2) : "0.00";
    }
    return amountsValue[participant] ?? "0";
  };

  if (loading) {
    return html`<div
      class="vstack items-center p-8"
    >
      <div aria-busy="true" data-spinner="large"></div>
      <p>Chargement...</p>
    </div>`;
  }

  if (error) {
    return html`<div role="alert" data-variant="error">${error}</div>`;
  }

  if (!splitData) {
    return html`<p>Aucune donnée de groupe trouvée.</p>`;
  }

  return html`
    <div class="vstack gap-4">
      <a href="/split?split_id=${splitId}" data-variant="secondary">
        ${"<"} Retour au groupe
      </a>

      <h2>${isEditing ? "Modifier la dépense" : "Nouvelle dépense"}</h2>

      <form onSubmit=${handleSubmit}>
        ${formError
          ? html`<div role="alert" data-variant="error">${formError}</div>`
          : null}

        <label data-field>
          Nom :
          <input
            type="text"
            value=${name}
            onInput=${(e: Event) =>
              setName((e.target as HTMLInputElement).value)}
            placeholder="Nom de la dépense"
            required
          />
        </label>

        <label data-field>
          Montant :
          <input
            type="number"
            value=${amount}
            onInput=${(e: Event) =>
              setAmount((e.target as HTMLInputElement).value)}
            step="0.01"
            min="0"
            placeholder="0.00"
            required
          />
        </label>

        <label data-field>
          Devise :
          <${CurrencySelect}
            selected=${currency}
            onChange=${(code: string) => setCurrency(code)}
          />
        </label>

        <label data-field>
          Payé par :
          <select
            value=${payedBy}
            onChange=${(e: Event) =>
              setPayedBy((e.target as HTMLSelectElement).value)}
            required
          >
            <option value="">Sélectionner le payeur</option>
            ${splitData.participants.map(
              (p) => html`
                <option value=${p} selected=${p === payedBy}>${p}</option>
              `,
            )}
          </select>
        </label>

        <label data-field>
          Méthode de répartition :
          <select
            value=${splitMethod}
            onChange=${(e: Event) =>
              setSplitMethod(
                (e.target as HTMLSelectElement).value as "Evenly" | "Amounts",
              )}
          >
            <option value="Evenly">Équitablement</option>
            <option value="Amounts">Par montant</option>
          </select>
        </label>

        <fieldset>
          <legend>Répartir entre :</legend>
          ${splitData.participants.map(
            (p) => html`
              <div class="hstack">
                <label>
                  <input
                    type="checkbox"
                    checked=${payedFor.includes(p)}
                    onChange=${() => toggleParticipant(p)}
                  />
                  ${p}
                </label>
                <input
                  type="number"
                  value=${getAmountFor(p)}
                  onInput=${(e: Event) => {
                    if (splitMethod === "Amounts") {
                      updateAmountValue(
                        p,
                        (e.target as HTMLInputElement).value,
                      );
                    }
                  }}
                  min="0"
                  step="0.01"
                  disabled=${splitMethod === "Evenly" || !payedFor.includes(p)}
                  class="w-100px"
                />
              </div>
            `,
          )}
        </fieldset>

        <label data-field>
          Date :
          <input
            type="datetime-local"
            value=${dateTime}
            onChange=${(e: Event) =>
              setDateTime((e.target as HTMLInputElement).value)}
          />
        </label>

        <div class="hstack justify-end gap-2 mt-4">
          <button type="submit" disabled=${submitting}>
            ${submitting ? "Enregistrement..." : isEditing ? "Enregistrer" : "Ajouter une dépense"}
          </button>
          ${isEditing
            ? html`
                <button
                  type="button"
                  data-variant="danger"
                  onClick=${handleDelete}
                  disabled=${submitting}
                >
                  Supprimer
                </button>
              `
            : null}
          <a
            href="/split?split_id=${splitId}"
            class="outline"
            data-variant="secondary"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  `;
}

export default defineIsland(EditExpense, import.meta.path);
