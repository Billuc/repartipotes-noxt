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
                  <div class="card p-4 border-left-primary">
                    <span class="text-md">
                      <strong>${b.debtor}</strong>
                      <span class="text-light text-base">owes</span>
                      <span class="badge text-base" data-variant="danger">
                        ${b.amount.toFixed(2)}${b.currency}
                      </span>
                      <span class="text-light text-base">to</span>
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
