/**
 * API handler for fetching splits list
 */

import { html } from "htm/preact";
import { getAllSplits } from "../db/db";
import type { Split } from "../types";

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function handleGetSplits(): Promise<Response> {
  try {
    const splits = getAllSplits();

    const content =
      splits.length === 0
        ? html`
            <div class="empty-state">
              <p>No splits yet. Create one to get started!</p>
            </div>
          `
        : html`
            <div class="splits-list">
              ${splits.map(
                (split: Split) => html`
                  <div class="split-card">
                    <h3>${split.description}</h3>
                    <div class="split-meta">
                      <span class="participants">
                        ${split.participants.length} people
                      </span>
                      <span class="currency">${split.defaultCurrency}</span>
                    </div>
                    <div class="split-participants">
                      ${split.participants.map(
                        (p: string) =>
                          html`<span class="participant">${p}</span>`,
                      )}
                    </div>
                    <div class="created">${formatDate(split.createdAt)}</div>
                    <div class="split-actions">
                      <a
                        href="/split.html?id=${split.id}"
                        class="btn btn-secondary"
                        >View</a
                      >
                    </div>
                  </div>
                `,
              )}
            </div>
          `.toString();

    return new Response(content, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error fetching splits:", error);
    return new Response(
      html`<div class="error">Error loading splits</div>`.toString(),
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    );
  }
}
