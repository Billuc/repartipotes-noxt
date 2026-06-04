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
      <div class="expenses-header">
        <h3>Expenses</h3>
        <${ExpenseForm}
          split=${split}
          onSaved=${onSaved}
        />
      </div>

      ${expenses.length === 0
        ? html`<p class="muted-text">No expenses yet. Add one above!</p>`
        : html`
            <table class="expenses-table">
              ${expenses.map(
                (exp) => html`
                  <tr class="expense-row">
                    <td>
                      <span class="expense-name">${exp.name}</span>
                      <span class="expense-amount"
                        >${exp.amount.toFixed(2)}${exp.currency}</span
                      >
                      ${exp.original_currency !== exp.currency
                        ? html`
                            <span class="original-amount"
                              >(${exp.original_amount.toFixed(2)}${exp.original_currency})</span
                            >
                          `
                        : null}
                      <${ExpenseForm}
                        split=${split}
                        expense=${exp}
                        onSaved=${onSaved}
                      />
                    </td>
                  </tr>
                  <tr class="expense-details-row">
                    <td>
                      Paid by <span class="highlight">${exp.payed_by}</span>
                      for
                      <span class="highlight"
                        >${exp.payed_for.join(", ")}</span
                      >
                      on ${formatDate(exp.expense_date)}
                    </td>
                  </tr>
                `,
              )}
            </table>
          `}
    </div>
  `;
}
