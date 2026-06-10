import { html } from "htm/preact";
import type { Balance } from "../lib/types.ts";

interface SettlementsTabProps {
  balances: Balance[];
}

export default function SettlementsTab({ balances }: SettlementsTabProps) {
  return html`
    <div id="balances">
      <h3>Settlements</h3>
      ${balances.length === 0
        ? html`
            <p class="text-light">All settled up!</p>
          `
        : html`
            <div class="vstack gap-2">
              ${balances.map(
                (b) => html`
                  <div
                    class="card p-4"
                    style="border-inline-start:4px solid var(--primary);padding-inline-start:calc(var(--space-4) - 2px)"
                  >
                    <span style="font-size:0.9rem">
                      <strong>${b.debtor}</strong>
                      ${" "}
                      <span class="text-light" style="font-size:0.85rem">
                        owes
                      </span>
                      ${" "}
                      <span
                        class="badge"
                        data-variant="danger"
                        style="font-size:0.85rem"
                      >
                        ${b.amount.toFixed(2)}${b.currency}
                      </span>
                      ${" "}
                      <span class="text-light" style="font-size:0.85rem">
                        to
                      </span>
                      ${" "}
                      <strong>${b.creditor}</strong>
                    </span>
                  </div>
                `,
              )}
            </div>
          `}
    </div>
  `;
}
