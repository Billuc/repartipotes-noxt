import { html } from "htm/preact";
import type { Expense } from "../lib/types.ts";

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ExpensesTabProps {
  split: { id: string; participants: string[]; default_currency: string };
  expenses: Expense[];
}

export default function ExpensesTab({ split, expenses }: ExpensesTabProps) {
  return html`
    <div id="expenses">
      <div class="hstack justify-between mb-4">
        <h3>Expenses</h3>
        <a href="/edit-expense?split_id=${split.id}" class="button small">
          + Add expense
        </a>
      </div>

      ${expenses.length === 0
        ? html`<p class="text-light">No expenses yet. Add one above!</p>`
        : html`
            <div class="table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Payer</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  ${expenses.map(
                    (exp) => html`
                      <tr>
                        <td>${exp.name}</td>
                        <td>
                          ${exp.amount.toFixed(2)}${exp.currency}
                          ${exp.original_currency !== exp.currency
                            ? html`<br /><small
                                  >(${exp.original_amount.toFixed(
                                    2,
                                  )}${exp.original_currency})</small
                                >`
                            : null}
                        </td>
                        <td>
                          <strong>${exp.payed_by}</strong>
                          <br /><small>for ${exp.payed_for.join(", ")}</small>
                        </td>
                        <td>${formatDate(exp.expense_date)}</td>
                        <td>
                          <a
                            href="/edit-expense?split_id=${split.id}&expense_id=${exp.id}"
                            class="ghost small"
                          >
                            Edit
                          </a>
                        </td>
                      </tr>
                    `,
                  )}
                </tbody>
              </table>
            </div>
          `}
    </div>
  `;
}
