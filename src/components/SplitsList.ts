/**
 * Renders a list of all splits
 * Server-rendered component (non-interactive)
 */

import { html } from "htm/preact";
import type { Split } from "@lib/types";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface SplitsListProps {
  splits: Split[];
}

export default function SplitsList({ splits }: SplitsListProps) {
  if (splits.length === 0) {
    return html`
      <div class="empty-state">
        <p>No splits yet. Create one to get started!</p>
      </div>
    `;
  }

  return html`
    <div class="splits-list">
      ${splits.map(
        (split) => html`
          <div class="split-card">
            <h3>${split.description}</h3>
            <div class="split-meta">
              <span class="participants">
                ${split.participants.length}
                ${split.participants.length === 1 ? "person" : "people"}
              </span>
              <span class="currency">${split.defaultCurrency}</span>
            </div>
            <div class="split-participants">
              ${split.participants.map(
                (p) => html`<span class="participant">${p}</span>`,
              )}
            </div>
            <div class="created">Created ${formatDate(split.createdAt)}</div>
            <div class="split-actions">
              <a href="/split.html?id=${split.id}" class="btn btn-secondary">
                View Details
              </a>
            </div>
          </div>
        `,
      )}
    </div>
  `;
}
