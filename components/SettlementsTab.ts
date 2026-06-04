import { html } from "htm/preact";

interface Balance {
  debtor: string;
  amount: number;
  currency: string;
  creditor: string;
}

interface SettlementsTabProps {
  balances: Balance[];
}

export default function SettlementsTab({ balances }: SettlementsTabProps) {
  return html`
    <div id="balances">
      <h3>Settlements</h3>
      ${balances.length === 0
        ? html`<p class="muted-text">All settled up!</p>`
        : html`
            <ul>
              ${balances.map(
                (b) => html`
                  <li>
                    <span class="highlight">${b.debtor}</span> owes
                    <span class="highlight"
                      >${b.amount.toFixed(2)}${b.currency}</span
                    >
                    to <span class="highlight">${b.creditor}</span>
                  </li>
                `,
              )}
            </ul>
          `}
    </div>
  `;
}
