import { html } from "htm/preact";
import { useState, useEffect } from "preact/hooks";
import { defineIsland } from "noxt";
import CurrencySelect from "./CurrencySelect";

interface SplitMethod {
  method: "Evenly" | "Amounts";
  details: string;
}

interface Expense {
  id: number;
  name: string;
  amount: number;
  currency: string;
  original_amount: number;
  original_currency: string;
  payed_by: string;
  payed_for: string[];
  expense_date: number;
  split_method: SplitMethod;
}

interface ExpenseFormProps {
  split: { id: string; participants: string[]; default_currency: string };
  expense?: Expense;
  onSaved: () => void;
}

function timestampToDateTimeLocal(ts: number): string {
  const d = new Date(ts * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateTimeLocalToTimestamp(val: string): number {
  return Math.floor(new Date(val).getTime() / 1000);
}

function ExpenseForm({ split, expense, onSaved }: ExpenseFormProps) {
  const isEditing = !!expense;
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(expense?.name ?? "");
  const [amount, setAmount] = useState(
    expense?.original_amount?.toString() ?? "",
  );
  const [currency, setCurrency] = useState(
    expense?.original_currency ?? split.default_currency,
  );
  const [payedBy, setPayedBy] = useState(expense?.payed_by ?? "");
  const [payedFor, setPayedFor] = useState<string[]>(
    expense?.payed_for ?? [...split.participants],
  );
  const [splitMethod, setSplitMethod] = useState<"Evenly" | "Amounts">(
    expense?.split_method.method === "Amounts" ? "Amounts" : "Evenly",
  );
  const [amountsValue, setAmountsValue] = useState<Record<string, string>>(
    () => {
      if (
        expense?.split_method.method === "Amounts" &&
        expense.split_method.details
      ) {
        return JSON.parse(expense.split_method.details);
      }
      return {};
    },
  );
  const [dateTime, setDateTime] = useState(() => {
    if (expense?.expense_date) {
      return timestampToDateTimeLocal(expense.expense_date);
    }
    return timestampToDateTimeLocal(Math.floor(Date.now() / 1000));
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!expense || !isOpen) return;
    setName(expense.name);
    setAmount(expense.original_amount.toString());
    setCurrency(expense.original_currency);
    setPayedBy(expense.payed_by);
    setPayedFor([...expense.payed_for]);
    setSplitMethod(
      expense.split_method.method === "Amounts" ? "Amounts" : "Evenly",
    );
    if (
      expense.split_method.method === "Amounts" &&
      expense.split_method.details
    ) {
      setAmountsValue(JSON.parse(expense.split_method.details));
    } else {
      setAmountsValue({});
    }
    setDateTime(timestampToDateTimeLocal(expense.expense_date));
  }, [expense, isOpen]);

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
      setError(validationError);
      return;
    }

    if (!name.trim() || !amount || !payedBy || payedFor.length === 0) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const amountsArray = payedFor.map((p) =>
      splitMethod === "Amounts"
        ? parseFloat(amountsValue[p] ?? "0") || 0
        : perPerson,
    );

    const body = {
      split_id: split.id,
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
      const url = isEditing ? `/api/expenses/${expense!.id}` : "/api/expenses";
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

      setIsOpen(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!expense) return;
    if (!confirm("Are you sure you want to delete this expense?")) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ split_id: split.id }),
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

      setIsOpen(false);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

  return html`
    <div class="expense-form-wrapper">
      ${isEditing
        ? html`
            <button
              type="button"
              class="btn btn-ghost"
              onClick=${() => setIsOpen(!isOpen)}
            >
              Edit
            </button>
          `
        : html`
            <button
              type="button"
              class="btn btn-primary"
              onClick=${() => setIsOpen(!isOpen)}
            >
              Add expense
            </button>
          `}
      ${isOpen
        ? html`
            <div class="modal-overlay" onClick=${() => setIsOpen(false)}>
              <div
                class="modal-content"
                onClick=${(e: Event) => e.stopPropagation()}
              >
                <button
                  type="button"
                  class="btn-close"
                  onClick=${() => setIsOpen(false)}
                >
                  ×
                </button>
                <h3>${isEditing ? "Edit expense" : "New expense"}</h3>

                <form onSubmit=${handleSubmit} class="island-form">
                  ${error ? html`<p class="form-error">${error}</p>` : null}

                  <label>
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

                  <label>
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

                  <label>
                    Currency:
                    <${CurrencySelect}
                      selected=${currency}
                      onChange=${(code: string) => setCurrency(code)}
                    />
                  </label>

                  <label>
                    Paid by:
                    <select
                      value=${payedBy}
                      onChange=${(e: Event) =>
                        setPayedBy((e.target as HTMLSelectElement).value)}
                      required
                    >
                      <option value="">Select payer</option>
                      ${split.participants.map(
                        (p) => html`
                          <option value=${p} selected=${p === payedBy}>
                            ${p}
                          </option>
                        `,
                      )}
                    </select>
                  </label>

                  <label>
                    Split method:
                    <select
                      value=${splitMethod}
                      onChange=${(e: Event) =>
                        setSplitMethod(
                          (e.target as HTMLSelectElement).value as
                            | "Evenly"
                            | "Amounts",
                        )}
                    >
                      <option value="Evenly">Evenly</option>
                      <option value="Amounts">By amount</option>
                    </select>
                  </label>

                  <fieldset>
                    <legend>Split between:</legend>
                    ${split.participants.map(
                      (p) => html`
                        <div class="participant-amount-row">
                          <label class="checkbox-label">
                            <input
                              type="checkbox"
                              checked=${payedFor.includes(p)}
                              onChange=${() => toggleParticipant(p)}
                            />
                            <span>${p}</span>
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
                            class="participant-amount-input"
                            min="0"
                            step="0.01"
                            disabled=${splitMethod === "Evenly" ||
                            !payedFor.includes(p)}
                          />
                        </div>
                      `,
                    )}
                  </fieldset>

                  <label>
                    Date:
                    <input
                      type="datetime-local"
                      value=${dateTime}
                      onChange=${(e: Event) =>
                        setDateTime((e.target as HTMLInputElement).value)}
                    />
                  </label>

                  <div class="form-actions">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      disabled=${submitting}
                    >
                      ${submitting
                        ? "Saving..."
                        : isEditing
                          ? "Save"
                          : "Add expense"}
                    </button>
                    ${isEditing
                      ? html`
                          <button
                            type="button"
                            class="btn btn-danger"
                            onClick=${handleDelete}
                            disabled=${submitting}
                          >
                            Delete
                          </button>
                        `
                      : null}
                  </div>
                </form>
              </div>
            </div>
          `
        : null}
    </div>
  `;
}

export default defineIsland(ExpenseForm, import.meta.path);
