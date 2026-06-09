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
      setError("Missing split_id");
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
          throw new Error(`Failed to load split (${res.status})`);
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
              setError("Expense not found");
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
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
        return `The sum of individual amounts (${total.toFixed(2)}) must equal the total amount (${totalAmount.toFixed(2)})`;
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
      setFormError("Please fill in all required fields.");
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
        throw new Error((errData.error as string) ?? "Failed to save expense");
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
    if (!confirm("Are you sure you want to delete this expense?")) return;

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
          (errData.error as string) ?? "Failed to delete expense",
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
      class="vstack"
      style="align-items:center;padding:var(--space-8)"
    >
      <div aria-busy="true" data-spinner="large"></div>
      <p>Loading...</p>
    </div>`;
  }

  if (error) {
    return html`<div role="alert" data-variant="error">${error}</div>`;
  }

  if (!splitData) {
    return html`<p>No split data found.</p>`;
  }

  return html`
    <div class="vstack" style="gap:var(--space-4)">
      <a href="/split?split_id=${splitId}" data-variant="secondary">
        ${"<"} Return to split
      </a>

      <h2>${isEditing ? "Edit expense" : "New expense"}</h2>

      <form onSubmit=${handleSubmit}>
        <div class="vstack">
          ${formError
            ? html`<div role="alert" data-variant="error">${formError}</div>`
            : null}

          <label data-field>
            Name:
            <input
              type="text"
              value=${name}
              onInput=${(e: Event) =>
                setName((e.target as HTMLInputElement).value)}
              placeholder="Expense name"
              required
            />
          </label>

          <label data-field>
            Amount:
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
            Currency:
            <${CurrencySelect}
              selected=${currency}
              onChange=${(code: string) => setCurrency(code)}
            />
          </label>

          <label data-field>
            Paid by:
            <select
              value=${payedBy}
              onChange=${(e: Event) =>
                setPayedBy((e.target as HTMLSelectElement).value)}
              required
            >
              <option value="">Select payer</option>
              ${splitData.participants.map(
                (p) => html`
                  <option value=${p} selected=${p === payedBy}>${p}</option>
                `,
              )}
            </select>
          </label>

          <label data-field>
            Split method:
            <select
              value=${splitMethod}
              onChange=${(e: Event) =>
                setSplitMethod(
                  (e.target as HTMLSelectElement).value as "Evenly" | "Amounts",
                )}
            >
              <option value="Evenly">Evenly</option>
              <option value="Amounts">By amount</option>
            </select>
          </label>

          <fieldset>
            <legend>Split between:</legend>
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
                    disabled=${splitMethod === "Evenly" ||
                    !payedFor.includes(p)}
                    style="width:100px"
                  />
                </div>
              `,
            )}
          </fieldset>

          <label data-field>
            Date:
            <input
              type="datetime-local"
              value=${dateTime}
              onChange=${(e: Event) =>
                setDateTime((e.target as HTMLInputElement).value)}
            />
          </label>
        </div>

        <div
          class="hstack"
          style="justify-content:flex-end;gap:var(--space-2);margin-top:var(--space-4)"
        >
          <button type="submit" disabled=${submitting}>
            ${submitting ? "Saving..." : isEditing ? "Save" : "Add expense"}
          </button>
          ${isEditing
            ? html`
                <button
                  type="button"
                  data-variant="danger"
                  onClick=${handleDelete}
                  disabled=${submitting}
                >
                  Delete
                </button>
              `
            : null}
          <a
            href="/split?split_id=${splitId}"
            class="outline"
            data-variant="secondary"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  `;
}

export default defineIsland(EditExpense, import.meta.path);
