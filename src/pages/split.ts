/**
 * Split detail page
 * Shows expenses and allows adding new ones
 * Accessed via query param: ?id=<splitId>
 */

import { html } from "htm/preact";
import { asIsland } from "@lib/server";
import { getSplit, getExpensesBySplitId } from "@lib/db";
import Layout from "../components/Layout";
import ExpenseForm from "../components/ExpenseForm";
import ExpensesList from "../components/ExpensesList";

const ExpenseFormIsland = await asIsland(ExpenseForm);

export default function SplitPage({ splitId }: { splitId?: string }) {
  if (!splitId) {
    return html`
      <${Layout} title="Split Not Found">
        <div class="container">
          <div class="error-message">
            <h2>Split not found</h2>
            <p>The split you're looking for doesn't exist.</p>
            <a href="/" class="btn btn-primary">Back to Home</a>
          </div>
        </div>
      </>
    `;
  }

  const split = getSplit(splitId);
  if (!split) {
    return html`
      <${Layout} title="Split Not Found">
        <div class="container">
          <div class="error-message">
            <h2>Split not found</h2>
            <p>The split you're looking for doesn't exist.</p>
            <a href="/" class="btn btn-primary">Back to Home</a>
          </div>
        </div>
      </>
    `;
  }

  const expenses = getExpensesBySplitId(splitId);

  return html`
    <${Layout} title=${split.description}>
      <div class="container">
        <header class="page-header">
          <a href="/" class="btn-back">← Back</a>
          <div>
            <h1>${split.description}</h1>
            <p class="subtitle">
              ${split.participants.length} people • ${split.defaultCurrency}
            </p>
          </div>
        </header>

        <section class="page-content">
          <div class="split-info">
            <div class="split-card-large">
              <h3>Participants (${split.participants.length})</h3>
              <div class="participants-grid">
                ${split.participants.map(
                  (p) => html`
                    <div class="participant-badge">
                      <span class="participant-name">${p}</span>
                    </div>
                  `,
                )}
              </div>
            </div>
          </div>

          <div class="expenses-section">
            <div class="section-header">
              <h2>Expenses (${expenses.length})</h2>
              <${ExpenseFormIsland}
                splitId=${splitId}
                participants=${split.participants}
                defaultCurrency=${split.defaultCurrency}
              />
            </div>

            <div id="expenses-list">
              <${ExpensesList} expenses=${expenses} canDelete=${true} />
            </div>
          </div>

          <div class="balance-section">
            <h2>Balances</h2>
            <button class="btn btn-secondary">Calculate Balances</button>
            <p class="help-text">Tap the button above to see who owes whom</p>
          </div>
        </section>
      </div>
    </>
  `;
}

// Server-side data fetching based on query params
export async function getStaticProps({
  query,
}: {
  query: Record<string, string>;
}) {
  return {
    props: {
      splitId: query.id || null,
    },
  };
}
