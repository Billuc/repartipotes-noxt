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
                    <div
                      class="hstack justify-between"
                      style="flex-wrap:nowrap"
                    >
                      <strong
                        style="font-size:1.05rem;font-family:'Oswald',sans-serif;text-transform:uppercase;letter-spacing:.03em"
                      >
                        ${exp.name}
                      </strong>
                      <span
                        style="font-weight:700;font-size:1.1rem;white-space:nowrap"
                      >
                        ${exp.amount.toFixed(2)}${exp.currency}
                      </span>
                    </div>
                    <div
                      class="hstack"
                      style="margin-top:var(--space-1);flex-wrap:nowrap;gap:var(--space-1)"
                    >
                      <span class="text-light" style="font-size:0.85rem">
                        Paid by
                      </span>
                      <strong style="font-size:0.9rem">${exp.payed_by}</strong>
                      ${exp.payed_for.length > 0
                        ? html`
                            <span class="text-light" style="font-size:0.85rem">
                              for
                            </span>
                            <span style="font-size:0.85rem">
                              ${(exp.payed_for.length > 3
                                ? [...exp.payed_for.slice(0, 3), "..."]
                                : exp.payed_for
                              ).join(", ")}
                            </span>
                          `
                        : null}
                    </div>
                    <div
                      class="hstack justify-between"
                      style="margin-top:var(--space-2)"
                    >
                      <span class="text-light" style="font-size:0.8rem">
                        ${formatDate(exp.expense_date)}
                      </span>
                      <div class="hstack" style="gap:var(--space-2)">
                        ${exp.original_currency !== exp.currency
                          ? html`
                              <span
                                class="text-light"
                                style="font-size:0.75rem"
                              >
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
