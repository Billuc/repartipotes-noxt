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
        ? html`
            <p class="text-light">No expenses yet. Add one above!</p>
          `
        : html`
            <div class="vstack gap-2">
              ${expenses.map(
                (exp) => html`
                  <article class="card p-4">
                    <div class="hstack justify-between flex-nowrap">
                      <strong class="font-display text-lg">
                        ${exp.name}
                      </strong>
                      <span class="font-bold text-xl text-nowrap">
                        ${exp.amount.toFixed(2)}${exp.currency}
                      </span>
                    </div>
                    <div class="hstack mt-1 flex-nowrap gap-1">
                      <span class="text-light text-base">Paid by</span>
                      <strong class="text-md">${exp.payed_by}</strong>
                      ${exp.payed_for.length > 0
                        ? html`
                            <span class="text-light text-base">for</span>
                            <span class="text-base">
                              ${(exp.payed_for.length > 3
                                ? [...exp.payed_for.slice(0, 3), "..."]
                                : exp.payed_for
                              ).join(", ")}
                            </span>
                          `
                        : null}
                    </div>
                    <div class="hstack justify-between mt-2">
                      <span class="text-light text-sm">
                        ${formatDate(exp.expense_date)}
                      </span>
                      <div class="hstack gap-2">
                        ${exp.original_currency !== exp.currency
                          ? html`
                              <span class="text-light text-xs">
                                (${exp.original_amount.toFixed(
                                  2,
                                )}${exp.original_currency})
                              </span>
                            `
                          : null}
                        <a
                          href="/edit-expense?split_id=${split.id}&expense_id=${exp.id}"
                          class="ghost small"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  </article>
                `,
              )}
            </div>
          `}
    </div>
  `;
}
