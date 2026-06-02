import { html } from "htm/preact";
import { useState, useEffect, useCallback } from "preact/hooks";
import { defineIsland } from "noxt";
import ExpenseForm from "./ExpenseForm";

interface SplitMethod {
  method: "Evenly" | "Amounts";
  details: string;
}

interface Expense {
  id: number;
  split_id: string;
  name: string;
  amount: number;
  currency: string;
  original_amount: number;
  original_currency: string;
  payed_by: string;
  payed_for: string[];
  expense_date: number;
  split_method: SplitMethod;
}

interface Balance {
  debtor: string;
  amount: number;
  currency: string;
  creditor: string;
}

interface SplitData {
  id: string;
  description: string;
  participants: string[];
  default_currency: string;
  expenses: Expense[];
  individualBalances: Record<string, number>;
  balances: Balance[];
}

const SPLITS_KEY = "splits";
const SEPARATOR = ",";

function storeSplitId(id: string) {
  try {
    const raw = localStorage.getItem(SPLITS_KEY) ?? "";
    const ids = new Set(raw.split(SEPARATOR).filter((s) => s.length > 0));
    ids.add(id);
    localStorage.setItem(SPLITS_KEY, Array.from(ids).join(SEPARATOR));
  } catch {}
}

function formatDate(ts: number): string {
  return new Date(ts * 1000).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SplitView() {
  const [splitId, setSplitId] = useState<string | null>(null);
  const [data, setData] = useState<SplitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [newParticipant, setNewParticipant] = useState("");
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("split_id");
    if (id) {
      setSplitId(id);
      storeSplitId(id);
    } else {
      setError("No split ID provided");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!splitId) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/splits/${splitId}`);
        if (!res.ok) {
          throw new Error(`Failed to load split (${res.status})`);
        }
        const json = (await res.json()) as SplitData;
        if (!cancelled) setData(json);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load split");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [splitId, refreshCounter]);

  const loadData = useCallback(() => {
    setRefreshCounter((c) => c + 1);
  }, []);

  const handleAddParticipant = async (e: Event) => {
    e.preventDefault();
    if (!newParticipant.trim() || !data) return;

    const updated = [...data.participants, newParticipant.trim()];

    try {
      const res = await fetch(`/api/splits/${splitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participants: updated }),
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        throw new Error((errData.error as string) ?? "Failed to add participant");
      }

      setNewParticipant("");
      setParticipantError(null);
      loadData();
    } catch (err) {
      setParticipantError(err instanceof Error ? err.message : "Failed to add participant");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Failed to copy to clipboard");
    }
  };

  const splitUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/split?split_id=${splitId}`
      : "";

  if (loading) {
    return html`<div class="split-view"><p class="loading-text">Loading split...</p></div>`;
  }

  if (error) {
    return html`<div class="split-view"><p class="form-error">${error}</p></div>`;
  }

  if (!data) {
    return html`<div class="split-view"><p class="muted-text">No split data found.</p></div>`;
  }

  return html`
    <div class="split-view">
      <div class="split-header">
        <h2>${data.description}</h2>
        <button
          type="button"
          class="btn btn-secondary"
          onClick=${() => setShowShare(!showShare)}
        >
          Share
        </button>
      </div>

      ${showShare
        ? html`
            <div class="share-popover">
              <p>
                Share this link with friends:<br />
                <a href=${splitUrl} target="_blank">${splitUrl}</a>
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick=${() => copyToClipboard(splitUrl)}
                >
                  ${copied ? "Copied!" : "Copy link"}
                </button>
              </p>
              <p>
                Or use this code:<br />
                <strong>${data.id}</strong>
                <button
                  type="button"
                  class="btn btn-secondary"
                  onClick=${() => copyToClipboard(data.id)}
                >
                  ${copied ? "Copied!" : "Copy code"}
                </button>
              </p>
              <button
                type="button"
                class="btn-close"
                onClick=${() => setShowShare(false)}
              >
                Close
              </button>
            </div>
          `
        : null}

      <div class="split-details">
        <div id="participants">
          <h3>Participants</h3>
          <ul>
            ${data.participants.map(
              (p) => html`
                <li>
                  ${p}
                  ${data.individualBalances[p] != null
                    ? (() => {
                        const displayBalance =
                          -data.individualBalances[p]!;
                        if (displayBalance === 0) return null;
                        return html`
                          <span
                            class="individual-balance ${displayBalance > 0
                              ? "positive"
                              : "negative"}"
                          >
                            (${displayBalance > 0 ? "+" : ""}${displayBalance.toFixed(2)}${data.default_currency})
                          </span>
                        `;
                      })()
                    : null}
                </li>
              `,
            )}
          </ul>

          <form
            onSubmit=${handleAddParticipant}
            class="island-form add-participant-form"
          >
            ${participantError
              ? html`<p class="form-error">${participantError}</p>`
              : null}
            <div class="participant-row">
              <input
                type="text"
                value=${newParticipant}
                onInput=${(e: Event) =>
                  setNewParticipant((e.target as HTMLInputElement).value)}
                placeholder="New participant name"
                required
              />
              <button type="submit" class="btn btn-primary">Add</button>
            </div>
          </form>
        </div>

        <div id="expenses">
          <div class="expenses-header">
            <h3>Expenses</h3>
            <${ExpenseForm}
              split=${{ id: data.id, participants: data.participants, default_currency: data.default_currency }}
              onSaved=${loadData}
            />
          </div>

          ${data.expenses.length === 0
            ? html`<p class="muted-text">No expenses yet. Add one above!</p>`
            : html`
                <table class="expenses-table">
                  ${data.expenses.map(
                    (exp) => html`
                      <tr class="expense-row">
                        <td>
                          <span class="expense-name">${exp.name}</span>
                          <span class="expense-amount"
                            >${exp.amount.toFixed(2)}${exp.currency}</span
                          >
                          ${exp.original_currency !== exp.currency
                            ? html`
                                <span class="original-amount"
                                  >(${exp.original_amount.toFixed(2)}${exp.original_currency})</span
                                >
                              `
                            : null}
                          <${ExpenseForm}
                            split=${{ id: data.id, participants: data.participants, default_currency: data.default_currency }}
                            expense=${exp}
                            onSaved=${loadData}
                          />
                        </td>
                      </tr>
                      <tr class="expense-details-row">
                        <td>
                          Paid by <span class="highlight">${exp.payed_by}</span>
                          for
                          <span class="highlight"
                            >${exp.payed_for.join(", ")}</span
                          >
                          on ${formatDate(exp.expense_date)}
                        </td>
                      </tr>
                    `,
                  )}
                </table>
              `}
        </div>

        <div id="balances">
          <h3>Settlements</h3>
          ${data.balances.length === 0
            ? html`<p class="muted-text">All settled up!</p>`
            : html`
                <ul>
                  ${data.balances.map(
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
      </div>
    </div>
  `;
}

export default defineIsland(SplitView, import.meta.path);
