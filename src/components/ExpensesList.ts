/**
 * Renders a list of expenses for a split
 * Server-rendered component (non-interactive)
 */

import { html } from "htm/preact";
import type { Expense } from "@lib/types";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface ExpensesListProps {
  expenses: Expense[];
  canDelete?: boolean;
}

export default function ExpensesList({
  expenses,
  canDelete = false,
}: ExpensesListProps) {
  if (expenses.length === 0) {
    return html`
      <div class="empty-state">
        <p>No expenses yet. Add one to get started!</p>
      </div>
    `;
  }

  return html`
    <div class="expenses-list">
      <table class="expenses-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount</th>
            <th>Paid By</th>
            <th>Split</th>
            <th>Date</th>
            ${canDelete ? html`<th></th>` : ""}
          </tr>
        </thead>
        <tbody>
          ${expenses.map(
            (expense) => html`
              <tr>
                <td>${expense.name}</td>
                <td>
                  ${expense.amount.toFixed(2)}
                  <span class="currency">${expense.currency}</span>
                </td>
                <td>${expense.payedBy}</td>
                <td>
                  <span class="split-method"
                    >${expense.splitMethod.method}</span
                  >
                  <span class="split-count"
                    >${expense.payedFor.length} people</span
                  >
                </td>
                <td>${formatDate(expense.expenseDate)}</td>
                ${canDelete
                  ? html`
                      <td>
                        <button
                          class="btn-delete"
                          data-expense-id="${expense.id}"
                          onclick="deleteExpense(${expense.id})"
                        >
                          ✕
                        </button>
                      </td>
                    `
                  : ""}
              </tr>
            `,
          )}
        </tbody>
      </table>
    </div>
  `;
}
