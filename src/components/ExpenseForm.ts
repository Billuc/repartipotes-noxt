/**
 * Form for adding a new expense to a split
 * Interactive island that uses popup/modal
 */

import { html } from "htm/preact";
import { useState } from "preact/hooks";
import { defineIsland } from "@lib/island";

interface ExpenseFormProps {
  splitId: string;
  participants: string[];
  defaultCurrency: string;
  onExpenseAdded?: () => void;
}

function ExpenseForm({
  splitId,
  participants,
  defaultCurrency,
}: ExpenseFormProps) {
  const [showModal, setShowModal] = useState(false);
  const [splitMethod, setSplitMethod] = useState<"Evenly" | "Amounts">(
    "Evenly",
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.target as HTMLFormElement);
    formData.append("splitId", splitId);
    formData.append("splitMethod", splitMethod);

    try {
      const response = await fetch("/api/addExpense", {
        method: "POST",
        body: formData,
      });

      const html = await response.text();

      if (!response.ok) {
        setError(html || "Failed to add expense");
        setSubmitting(false);
        return;
      }

      // Update the expenses list on the page
      const expensesList = document.getElementById("expenses-list");
      if (expensesList) {
        expensesList.innerHTML = html;
      }

      // Close modal and reset form
      setShowModal(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding expense");
    }

    setSubmitting(false);
  }

  return html`
    <div class="expense-form-container">
      <button class="btn btn-primary" onclick=${() => setShowModal(true)}>
        + Add Expense
      </button>

      ${showModal
        ? html`
            <div class="modal-overlay" onclick=${() => setShowModal(false)}>
              <div class="modal" onclick=${(e: Event) => e.stopPropagation()}>
                <div class="modal-header">
                  <h3>Add Expense</h3>
                  <button
                    class="modal-close"
                    onclick=${() => setShowModal(false)}
                  >
                    ✕
                  </button>
                </div>

                <form class="expense-form" onsubmit=${handleSubmit}>
                  ${error ? html` <div class="form-error">${error}</div> ` : ""}

                  <div class="form-group">
                    <label for="expense-description">Description</label>
                    <input
                      id="expense-description"
                      type="text"
                      name="name"
                      placeholder="e.g., Hotel, Dinner"
                      required
                    />
                  </div>

                  <div class="form-row">
                    <div class="form-group">
                      <label for="expense-amount">Amount</label>
                      <input
                        id="expense-amount"
                        type="number"
                        name="amount"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div class="form-group">
                      <label for="expense-currency">Currency</label>
                      <input
                        id="expense-currency"
                        type="text"
                        name="currency"
                        value=${defaultCurrency}
                        readonly
                      />
                    </div>
                  </div>

                  <div class="form-group">
                    <label for="expense-payer">Paid By</label>
                    <select id="expense-payer" name="payedBy" required>
                      <option value="">-- Select --</option>
                      ${participants.map(
                        (p) => html`<option value=${p}>${p}</option>`,
                      )}
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="expense-split-method">Split Method</label>
                    <select
                      id="expense-split-method"
                      name="splitMethod"
                      value=${splitMethod}
                      onchange=${(e: Event) =>
                        setSplitMethod(
                          (e.target as HTMLSelectElement).value as
                            | "Evenly"
                            | "Amounts",
                        )}
                    >
                      <option value="Evenly">Evenly among all</option>
                      <option value="Amounts">Custom amounts</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label>Split Among</label>
                    <div class="checkbox-group">
                      ${participants.map(
                        (p) => html`
                          <label class="checkbox-label">
                            <input
                              type="checkbox"
                              name="payedFor"
                              value=${p}
                              checked
                            />
                            ${p}
                          </label>
                        `,
                      )}
                    </div>
                  </div>

                  <div class="form-actions">
                    <button
                      type="button"
                      class="btn btn-secondary"
                      onclick=${() => setShowModal(false)}
                      disabled=${submitting}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      class="btn btn-primary"
                      disabled=${submitting}
                    >
                      ${submitting ? "Adding..." : "Add Expense"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          `
        : ""}
    </div>
  `;
}

export default defineIsland(ExpenseForm, import.meta.path);
