/**
 * API handler for adding an expense to a split
 * POST /api/addExpense
 * Returns updated expenses list as HTML
 */

import { html } from "htm/preact";
import { addExpense, getExpensesBySplitId } from "../db/db";
import type { AddExpenseInput, Expense } from "../types";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function renderExpensesList(expenses: Expense[]): string {
  if (expenses.length === 0) {
    return html`
      <div class="empty-state">
        <p>No expenses yet. Add one to get started!</p>
      </div>
    `.toString();
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
              </tr>
            `,
          )}
        </tbody>
      </table>
    </div>
  `.toString();
}

export async function handleAddExpense(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const formData = await request.formData();
    const splitId = formData.get("splitId") as string;
    const name = formData.get("name") as string;
    const amountStr = formData.get("amount") as string;
    const currency = formData.get("currency") as string;
    const payedBy = formData.get("payedBy") as string;
    const payedFor = formData.getAll("payedFor") as string[];
    const splitMethod = (formData.get("splitMethod") as string) || "Evenly";

    // Validation
    const errors: string[] = [];

    if (!splitId) errors.push("Split ID is required");
    if (!name || !name.trim()) errors.push("Description is required");
    if (!amountStr || isNaN(parseFloat(amountStr)))
      errors.push("Valid amount is required");
    if (!currency) errors.push("Currency is required");
    if (!payedBy) errors.push("Must specify who paid");
    if (payedFor.length === 0) errors.push("Must select at least one person");

    if (splitMethod !== "Evenly" && splitMethod !== "Amounts") {
      errors.push("Invalid split method");
    }

    if (errors.length > 0) {
      const errorHtml = html`
        <div class="form-error">
          <ul>
            ${errors.map((e) => html`<li>${e}</li>`)}
          </ul>
        </div>
      `.toString();
      return new Response(errorHtml, {
        status: 400,
        headers: { "Content-Type": "text/html" },
      });
    }

    const amount = parseFloat(amountStr);

    const input: AddExpenseInput = {
      splitId,
      name: name.trim(),
      amount,
      currency,
      payedBy,
      payedFor,
      splitMethod: splitMethod as "Evenly" | "Amounts",
    };

    addExpense(input);

    // Return updated expenses list as HTML
    const expenses = getExpensesBySplitId(splitId);
    const expensesHtml = renderExpensesList(expenses);

    return new Response(expensesHtml, {
      status: 201,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Internal server error";
    const errorHtml = html`<div class="form-error">
      ${errorMsg}
    </div>`.toString();
    return new Response(errorHtml, {
      status: 500,
      headers: { "Content-Type": "text/html" },
    });
  }
}
