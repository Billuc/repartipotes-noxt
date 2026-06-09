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
        ? html`<p>All settled up!</p>`
        : html`
            <ul>
              ${balances.map(
                (b) => html`
                  <li>
                    <strong>${b.debtor}</strong> owes
                    <strong
                      >${b.amount.toFixed(2)}${b.currency}</strong
                    >
                    to <strong>${b.creditor}</strong>
                  </li>
                `,
              )}
            </ul>
          `}
    </div>
  `;
}
