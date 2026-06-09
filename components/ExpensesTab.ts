import { html } from "htm/preact";
import ExpenseForm from "../islands/ExpenseForm";

interface SplitMethod {
  method: "Evenly" | "Amounts";
  details: string;
}

interface Expense {
  id: number;
  split_id: string;
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
  onSaved: () => void;
}

export default function ExpensesTab({ split, expenses, onSaved }: ExpensesTabProps) {
  return html`
    <div id="expenses">
      <div class="hstack justify-between">
        <h3>Expenses</h3>
        <${ExpenseForm}
          split=${split}
          onSaved=${onSaved}
        />
      </div>

      ${expenses.length === 0
        ? html`<p>No expenses yet. Add one above!</p>`
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
                                >(${exp.original_amount.toFixed(2)}${exp.original_currency})</small
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
