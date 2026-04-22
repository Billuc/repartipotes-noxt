/**
 * API handler for adding an expense to a split
 * POST /api/addExpense
 * Returns updated expenses list as HTML
 */

import { html } from "htm/preact";
import { addExpense, getExpensesBySplitId } from "@lib/db";
import ExpensesList from "@src/components/ExpensesList";
import type { AddExpenseInput } from "@lib/types";

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
    if (!amountStr || isNaN(parseFloat(amountStr))) errors.push("Valid amount is required");
    if (!currency) errors.push("Currency is required");
    if (!payedBy) errors.push("Must specify who paid");
    if (payedFor.length === 0) errors.push("Must select at least one person");

    if (splitMethod !== "Evenly" && splitMethod !== "Amounts") {
      errors.push("Invalid split method");
    }

    if (errors.length > 0) {
      return new Response(
        html`
          <div class="form-error">
            <ul>
              ${errors.map((e) => html`<li>${e}</li>`)}
            </ul>
          </div>
        `.toString(),
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
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
    const expensesHtml = await ExpensesList({ expenses, canDelete: true });

    return new Response(expensesHtml.toString(), {
      status: 201,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error adding expense:", error);
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      html`<div class="form-error">${errorMsg}</div>`.toString(),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}
